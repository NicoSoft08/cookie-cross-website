import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { categoryService } from "../../../services/categories";
import ReCAPTCHA from "react-google-recaptcha";
import FormData from "../../../components/FormData";
import Modal from "../../../components/ui/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../../../components/ui/Spinner";
import { AlertTriangle } from "lucide-react";
import "../../../styles/dashboard/SelectCategory.scss";

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

export default function Review({ formData, onSubmit, isLoading, hasSucceed, showLimitModal }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(stepMapping[searchParams.get('step')] || 5);
    const [isOpen, setIsOpen] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const [errors, setErrors] = useState({ captcha: '' });
    const [categories, setCategories] = useState([]);

    // Replace with your actual reCAPTCHA site key
    const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

    useEffect(() => {
        const stepParam = searchParams.get('step');
        const mappedStep = stepMapping[stepParam];
        if (mappedStep) {
            setStep(mappedStep);
        } else {
            navigate('/dashboard/posts/new?step=location-picker', { replace: true });
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        loadCategoriesData();
    }, []);

    const loadCategoriesData = async () => {
        const res = await categoryService.getCategories();
        if (res.success) {
            setCategories(res.data?.categoriesData);
        }
    };

    const handleUpgradePlan = () => { };

    const prevStep = () => {
        const prev = Math.max(step - 1, 1);
        const stepKey = reverseStepMapping[prev] || 'location-picker';
        navigate(`/dashboard/posts/new?step=${stepKey}`);
    };

    const handleClose = () => setIsOpen(false);

    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
        // Clear captcha error if it exists
        if (errors.captcha) {
            setErrors({
                ...errors,
                captcha: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!captchaValue) {
            newErrors.captcha = "Veuillez confirmer que vous n'êtes pas un robot";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(captchaValue);
            handleClose();
        }
    };

    const formatCategorization = () => {
        let category = "";
        let subcategory = "";

        if (formData.category) {
            const categoryData = categories.find(cat => cat.categoryName === formData.category);
            if (categoryData) category = categoryData.categoryTitle;
        }

        if (formData.subcategory) {
            const categoryData = categories.find(cat => cat.categoryName === formData.category);
            if (categoryData) {
                const subcategoryData = categoryData.subcategories.find(subcat => subcat.sousCategoryName === formData.subcategory);
                if (subcategoryData) subcategory = subcategoryData.sousCategoryTitle;
            }
        }

        return { category, subcategory };
    };

    const { category, subcategory } = formatCategorization();

    if (hasSucceed) {
        return (
            <div className="post-create-success">
                <div className="success-icon">
                    {Array.from({ length: 3 }, (_, i) => (
                        <div key={i}>
                            <FontAwesomeIcon icon={faThumbsUp} className='icon' />
                        </div>
                    ))}
                </div>

                <h2>Annonce postée avec succès.</h2>
                <p>Votre annonce est en attente de vérification par notre équipe de modération.</p>
                <p>Vous serez notifié(s) une fois la vérification terminée.</p>
                <Link to="/">
                    Revenir à l'accueil
                </Link>
            </div>
        )
    }

    if (showLimitModal) {
        return (
            <div className="limit-reached">
                <div className="header">
                    <AlertTriangle className="warning-icon" />
                </div>
                <div className="body">
                    <h2>Limite atteinte</h2>
                    <p>Vous avez atteint la limite maximale d'annonces pour votre plan</p>
                </div>

                <div className="footer">
                    <button className="upgrade-button" onClick={handleUpgradePlan}>
                        Mettre à jour
                    </button>

                </div>
            </div>
        )
    }
    return (
        <div className='review-form'>
            <div className="review-section">
                <h3>Catégorisation</h3>
                <p>Catégorie: {category}</p>
                <p>Sous-catégorie: {subcategory}</p>
            </div>

            <div className="review-section">
                <h3>Détails de l'annonce</h3>
                <p>Titre: {formData.details?.title}</p>
                <p>Description: {formData.details?.description}</p>

                <FormData details={formData.details} />

                <p>Type de Prix: {formData.details?.price_type}</p>
                <p>Prix: {formData.details?.price} RUB</p>
            </div>

            <div className="review-section">
                <h3>Emplacement</h3>
                <p>Pays: {formData.location?.country}</p>
                <p>Ville: {formData.location?.city}</p>
                <p>Adresse: {formData.location?.address}</p>
            </div>

            <div className="review-section">
                <h3>Photos</h3>
                <div className="image-grid">
                    {formData.images && formData.images?.length > 0 ? (
                        formData.images.map((image, index) => (
                            <div key={index} className="review-image-wrapper">
                                <img src={image} alt={`photo-${index}`} className="review-image" />
                            </div>
                        ))
                    ) : (
                        <p>Aucune photo ajoutée.</p>
                    )}

                </div>
            </div>

            <p>
                Audience: {formData.audience}
            </p>

            {/* reCAPTCHA component */}
            <div className="captcha-container">
                <ReCAPTCHA
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                />
            </div>
            {errors.captcha && <div className="error-text">{errors.captcha}</div>}

            <div className="form-navigation">
                <button className="prev" onClick={prevStep}>
                    Retour
                </button>
                <button
                    className="next"
                    onClick={() => {
                        // First check if CAPTCHA is completed
                        if (!captchaValue) {
                            setErrors({
                                ...errors,
                                captcha: "Veuillez confirmer que vous n'êtes pas un robot"
                            });
                            // Scroll to the CAPTCHA to make the error visible
                            document.querySelector('.captcha-container')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        } else {
                            // CAPTCHA is valid, open the modal
                            setIsOpen(true);
                        }
                    }}
                    aria-label="Publier l'annonce"
                >
                    Envoyer
                </button>
            </div>

            <Modal
                className="review-modal"
                isOpen={isOpen}
                onClose={handleClose}
                showCloseButton={true}
                title={'Publication'}
                children={(
                    <p>Il n'y a pas de retour en arrière. Êtes-vous sûr de vouloir publier cette annonce ?</p>
                )}
                footerClassName="review-footer"
                footer={(
                    <div className="form-navigation">
                        <button type="button" className="prev" onClick={handleClose}>
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="next"
                            onClick={handleSubmit}
                            aria-label="Publier l'annonce"
                        >
                            {isLoading ? <Spinner color="white" size={'md'} variant="digital" /> : "Publier"}
                        </button>
                    </div>
                )}
            >

            </Modal>
        </div>
    )
}
