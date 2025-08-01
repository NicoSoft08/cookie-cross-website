import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SelectCategory from "../pages/private/dashboard/SelectCategory";
import Details from "../pages/private/dashboard/Details";
import ImageUpload from "../pages/private/dashboard/ImageUpload";
import Location from "../pages/private/dashboard/Location";
import Review from "../pages/private/dashboard/Review";
import ProgressBar from "../components/ui/ProgressBar";
import Toast from "../components/ui/Toast";
import Loading from "../components/ui/Loading";
import LimitReachedModal from "../pages/private/dashboard/LimitReachedModal";
import { postService } from "../services/posts";
import Audience from "../pages/private/dashboard/Audience";

const createSearchableItem = (text) => {
    if (!text) return [];
    text = text.toLowerCase().trim();
    const words = text.split(/\s+/);

    const variations = words.flatMap(word => {
        const cleanWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprimer accents
        const prefixes = [];

        // Générer des préfixes (ex: "ordinateur" => "o", "or", "ord", ...)
        for (let i = 1; i <= cleanWord.length; i++) {
            prefixes.push(cleanWord.slice(0, i));
        }

        return [cleanWord, ...prefixes];
    });

    return [...new Set(variations)];
};

function StepIndicator({ currentStep, totalSteps, title }) {
    return (
        <div className="step-indicator">
            <div className="step-count">
                Étape {currentStep} sur {totalSteps}
            </div>
            <h2 className="step-title">{title}</h2>
        </div>
    );
};

export const useCreatePost = (currentUser, userData) => {
    const stepMapping = {
        'category-select': 1,
        'details-provider': 2,
        'image-uploader': 3,
        'location-picker': 4,
        'audience-selector': 5,
        'form-review': 6,
    };

    const reverseStepMapping = {
        1: 'category-select',
        2: 'details-provider',
        3: 'image-uploader',
        4: 'location-picker',
        5: 'audience-selector',
        6: 'form-review',
    };

    const navigate = useNavigate();
    console.log(currentUser);
    const [searchParams] = useSearchParams();
    const stepParam = searchParams.get('step') || 'category-select';
    const [step, setStep] = useState(stepMapping[stepParam] || 1);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [hasSucceed, setHasSucceed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [formData, setFormData] = useState({ category: '', subcategory: '', details: {}, images: [], location: {}, audience: '' })

    useEffect(() => {
        const stepParam = searchParams.get('step');
        if (stepMapping[stepParam]) {
            setStep(stepMapping[stepParam]);
        } else {
            setStep(1); // fallback en cas de step invalide
        }
    }, [searchParams]);

    // Mettez à jour localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('postFormData', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        console.log("FormData updated:", formData);
    }, [formData]);



    const steps = [
        { id: 1, title: "Catégorisation", component: SelectCategory, progress: 15 },
        { id: 2, title: "Détails", component: Details, progress: 30 },
        { id: 3, title: "Images", component: ImageUpload, progress: 50 },
        { id: 4, title: "Emplacement", component: Location, progress: 65 },
        { id: 5, title: "Audience", component: Audience, progress: 80 },
        { id: 6, title: "Vérification", component: Review, progress: 100 },
    ];


    // Gère les étapes du formulaire
    const nextStep = (newStep) => {
        const stepKey = reverseStepMapping[newStep] || 'category-select';
        navigate(`/dashboard/posts/new?step=${stepKey}`, { replace: true });
    };

    const prevStep = () => {
        const newStep = Math.max(step - 1, 1);
        const stepKey = reverseStepMapping[newStep];
        navigate(`/dashboard/posts/new?step=${stepKey}`, { replace: true });
    };

    // Gestion centralisée des changements de l'état du formulaire
    const handleChange = () => {
        setFormData(prevData => {
            let newData = { ...prevData };

            return newData;
        });
    };

    const {
        details,
        images,
        location,
        category,
        subcategory,
        audience,
    } = formData;

    const searchableTerms = [
        ...createSearchableItem(details.title),
        ...createSearchableItem(details.make),
        ...createSearchableItem(details.model),
        ...createSearchableItem(details.brand),
        ...createSearchableItem(details.color),
        ...createSearchableItem(details.category),
        ...createSearchableItem(details.type_vetement), // type de vetement
        ...createSearchableItem(details.matiere),
        ...createSearchableItem(details.style),
        ...createSearchableItem(location.country),
        ...createSearchableItem(location.city),
        ...createSearchableItem(category),
        ...createSearchableItem(subcategory),
    ];

    const postData = {
        details,
        images,
        location,
        category,
        subcategory,
        audience,
        searchableTerms: [...new Set(searchableTerms)].filter(Boolean),
    };

    const handleSubmit = async (captchaValue) => {
        console.log(formData)
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');

            const res = await postService.createPost(
                postData,
                token,
                captchaValue
            );

            if (res.success) {
                setHasSucceed(true);
                setToast({
                    show: true,
                    type: 'success',
                    message: 'Annonce publiée avec succès !',
                });

                // Après soumission réussie
                localStorage.removeItem('postFormData');

            } else {
                if (res.error === 'Limite d\'annonces atteinte') {
                    setShowLimitModal(true);
                }
            }
        } catch (error) {
            setToast({
                show: true,
                type: 'error',
                message: error.message || 'Une erreur est survenue.'
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <ProgressBar progress={steps[step - 1].progress} />
            <StepIndicator
                currentStep={step}
                totalSteps={steps.length}
                title={steps[step - 1].title}
            />

            {steps.map(({ id, component: Component }) => (
                step === id ? (
                    <Component
                        formData={formData}
                        isLoading={isLoading}
                        userData={userData}
                        currentUser={currentUser}
                        onBack={prevStep}
                        onNext={nextStep}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        setFormData={setFormData}
                        hasSucceed={hasSucceed}
                        showLimitModal={showLimitModal}
                    />
                ) : null
            ))}

            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
            {showLimitModal && (<LimitReachedModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} onUpgrade={() => navigate('/pricing')} />)}
            {isLoading && <Loading />}
        </div>
    )
}