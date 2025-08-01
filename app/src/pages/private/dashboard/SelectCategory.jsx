import { useCallback, useEffect, useState } from 'react'
import { categoryService } from '../../../services/categories';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Toast from '../../../components/ui/Toast';
import '../../../styles/dashboard/SelectCategory.scss';

const stepMapping = {
    'category-select': 1,
    'details-provider': 2,
    'image-uploader': 3,
    'location-picker': 4,
    'form-review': 5,
};

const reverseStepMapping = {
    1: 'category-select',
    2: 'details-provider',
    3: 'image-uploader',
    4: 'location-picker',
    5: 'form-review',
};

export default function SelectCategory({ formData, setFormData }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();


    const stepParam = searchParams.get('step') || 'category-select';
    const [step, setStep] = useState(stepMapping[stepParam] || 1);

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);


    const [requiresVerification, setRequiresVerification] = useState(false);
    const [verificationStarted, setVerificationStarted] = useState(false);

    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        const stepParam = searchParams.get('step');
        const mappedStep = stepMapping[stepParam];

        if (mappedStep) {
            setStep(mappedStep);
        } else {
            navigate('/dashboard/posts/new?step=category-select', { replace: true });
        }
    }, [searchParams, navigate]);


    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            const res = await categoryService.getCategories();
            if (isMounted && res.success) {
                setCategories(res.data);
            }
        };

        loadData();

        return () => { isMounted = false }; // Nettoyage
    }, []);

    // Mise à jour des sous-catégories quand la catégorie change
    useEffect(() => {
        if (formData.category && categories.length) {
            const selectedCategory = categories.find(cat => cat.slug === formData.category);
            setSubcategories(selectedCategory?.children || []);
        } else {
            setSubcategories([]);
        }
    }, [formData.category, categories]);

    // Vérifier si la sous-catégorie sélectionnée est sensible
    useEffect(() => {
        if (formData.subcategory) {
            const selectedSubcategory = subcategories.find(sub => sub.slug === formData.subcategory);
            setRequiresVerification(selectedSubcategory?.isSensitive || false);
        } else {
            setRequiresVerification(false);
        }
    }, [formData.subcategory, subcategories]);

    // Gestion des changements de catégorie
    const handleChangeCategory = useCallback((e) => {
        const newValue = e.target.value;
        console.log("new value", newValue)
        setFormData(prev => ({ ...prev, category: newValue, subcategory: '' }));
        setVerificationStarted(false);
    }, [setFormData]);

   
    // Gestion des changements de sous-catégorie
     const handleChangeSubcategory = useCallback((e) => {
        const newSubcategory = e.target.value;
        setFormData(prev => ({ ...prev, subcategory: newSubcategory }));

        // Vérifier si la sous-catégorie nécessite une vérification
        const selectedSub = subcategories.find(sub => sub.slug === newSubcategory);
        setRequiresVerification(selectedSub?.isSensitive || false);
        setVerificationStarted(false);
    }, [setFormData, subcategories]);

    const startVerification = () => {
        // Ici vous pourriez lancer un processus de vérification
        // Pour l'exemple, nous simulons simplement l'approbation
        setVerificationStarted(true);
        setRequiresVerification(false);
    };

    // Gère les étapes du formulaire
    const nextStep = () => {
        const next = step + 1;
        const stepKey = reverseStepMapping[next] || 'category-select';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };


    return (
        <div className='select-cat'>
            {/* Sélection de la catégorie */}
            <select
                className="input-field"
                value={formData.category}
                onChange={handleChangeCategory}
                required
            >
                <option value="">-- Sélectionner une catégorie --</option>
                {categories.map(({ id, slug, name }) => (
                    <option key={id} value={slug}>
                        {name}
                    </option>
                ))}
            </select>

            {/* Si une catégorie est sélectionnée */}
            {formData.category && subcategories.length > 0 && (
                <select
                    className="input-field"
                    value={formData.subcategory}
                    onChange={handleChangeSubcategory}
                    required
                >
                    <option value="">-- Sélectionner une sous-catégorie --</option>
                    {subcategories.map(({ id, slug, name, isSensitive }) => (
                        <option key={id} value={slug}>
                            {name} {isSensitive && '⚠️'}
                        </option>
                    ))}
                </select>
            )}

            {requiresVerification && !verificationStarted && (
                <div className="sensitive-warning">
                    <p>🔒 <strong>Vérification requise pour cette catégorie</strong></p>
                    <p>
                        Pour garantir la sécurité et la qualité des annonces, une vérification supplémentaire est requise.
                        <a href="/help/posts">En savoir plus</a>
                    </p>
                    <p>
                        ℹ️ Ce système est en cours de mise en place. Merci de votre patience."
                    </p>
                    <button onClick={startVerification}>
                        Démarrer
                    </button>
                </div>
            )}

            {/* Contact support */}
            <div className="contact-support">
                <p>Vous ne trouvez pas la catégorie ? <Link to='/contact-us'>Contactez le support</Link></p>
            </div>

            {/* Bouton Suivant */}
            {formData.subcategory && (
                <div className="form-navigation">
                    <button className='next' onClick={nextStep}>
                        Suivant
                    </button>
                </div>
            )}

            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        </div>
    )
}
