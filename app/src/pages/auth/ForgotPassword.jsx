import { Link, useNavigate } from "react-router-dom";
import '../../styles/auth/ForgotPassword.scss';
import Spinner from "../../components/ui/Spinner";
import ReCAPTCHA from "react-google-recaptcha";
import { Check, Mail } from "lucide-react";
import Logo from "../../components/ui/Logo";
import { logos, resetPasswordFormValidationRules } from "../../config";
import { useCallback, useEffect, useRef, useState } from "react";
import { authService } from "../../services/auth";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        agree: false
    });
    const [captchaValue, setCaptchaValue] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [emailCheckLoading, setEmailCheckLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    // Refs
    const validationTimeouts = useRef({});
    const recaptchaRef = useRef(null);

    const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

    // Fonction de validation d'un champ
    const validateField = useCallback((name, value, allFormData = formData) => {
        const rules = resetPasswordFormValidationRules[name];
        if (!rules) return null;

        const trimmedValue = typeof value === 'string' ? value.trim() : value;

        // Vérification requis
        if (rules.required && (!trimmedValue || trimmedValue === '')) {
            return rules.messages.required;
        }

        // Si le champ n'est pas requis et est vide, pas d'erreur
        if (!rules.required && (!trimmedValue || trimmedValue === '')) {
            return null;
        }

        // Vérification longueur minimale
        if (rules.minLength && trimmedValue.length < rules.minLength) {
            return rules.messages.minLength;
        }

        // Vérification longueur maximale
        if (rules.maxLength && trimmedValue.length > rules.maxLength) {
            return rules.messages.maxLength;
        }

        // Vérification pattern
        if (rules.pattern && !rules.pattern.test(trimmedValue)) {
            return rules.messages.pattern;
        }

        // Validations spéciales
        switch (name) {
            case 'email':
                if (trimmedValue.includes('..') ||
                    trimmedValue.startsWith('.') ||
                    trimmedValue.endsWith('.')) {
                    return rules.messages.pattern;
                }
                break;

            default:
                break;
        }

        return null;
    }, [formData]);

    // Validation d'un champ avec mise à jour des erreurs
    const validateAndSetError = useCallback((name, value) => {
        const error = validateField(name, value);
        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[name] = error;
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });
        return !error;
    }, [validateField]);

    // Validation en temps réel
    useEffect(() => {
        const isValid = formData.email &&
            formData.password &&
            formData.agree &&
            captchaValue &&
            Object.keys(errors).length === 0;
        setIsFormValid(isValid);
    }, [formData, errors, captchaValue]);

    // Vérification de l'existence de l'email
    const checkEmailExists = useCallback(async (email) => {
        if (!email || !resetPasswordFormValidationRules.email.pattern.test(email)) return;

        setEmailCheckLoading(true);
        try {
            const exists = await authService.checkEmailExists(email);
            if (exists) {
                setErrors(prev => ({
                    ...prev,
                    email: resetPasswordFormValidationRules.email.messages.exists
                }));
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'email:', error);
        } finally {
            setEmailCheckLoading(false);
        }
    }, []);

    // Gestion des changements dans le formulaire
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value.trim()
        }));

        // Validation en temps réel avec debounce
        if (validationTimeouts.current[name]) {
            clearTimeout(validationTimeouts.current[name]);
        } else {
            // Validation avec délai pour les autres champs
            validationTimeouts.current[name] = setTimeout(() => {
                validateAndSetError(name, value);

                // Vérification spéciale pour l'email
                if (name === 'email' && value && !errors.email) {
                    checkEmailExists(value);
                }
            }, name === 'email' ? 1000 : 500);
        }
    }, [errors, validateAndSetError, checkEmailExists]);

    // Validation de tout le formulaire
    const validateAllFields = useCallback(() => {
        let isValid = true;
        const newErrors = {};

        // Valider tous les champs
        Object.keys(resetPasswordFormValidationRules).forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        if (!captchaValue) {
            newErrors.captcha = 'Veuillez compléter le captcha';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData, captchaValue, validateField]);


    // Affichage des toasts
    const showToast = useCallback((type, message) => {
        setToast({ show: true, type, message });
    }, []);

    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
        if (value) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.captcha;
                return newErrors;
            });
        }
    };

    // Soumission du formulaire
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateAllFields()) {
            showToast('error', 'Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(formData.email, captchaValue);

            if (response.success) {
                setIsEmailSent(true);
                showToast('success', 'E-mail de réinitialisation envoyé avec succès');
            } else {
                throw new Error(response.message || 'Erreur lors de l\'envoi de l\'e-mail');
            }
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);

            // Messages d'erreur spécifiques
            let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

            if (error.message.includes('user-not-found')) {
                errorMessage = 'Aucun compte associé à cette adresse e-mail';
            } else if (error.message.includes('too-many-requests')) {
                errorMessage = 'Trop de tentatives. Veuillez patienter avant de réessayer.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
            }

            showToast('error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [formData.email, validateAllFields, showToast]);

    // Renvoyer l'e-mail
    const handleResendEmail = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(formData.email.toLowerCase());

            if (response.success) {
                showToast('success', 'E-mail renvoyé avec succès');
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Erreur lors du renvoi:', error);
            showToast('error', 'Erreur lors du renvoi de l\'e-mail');
        } finally {
            setIsLoading(false);
        }
    }, [formData.email, showToast]);

    return (
        <div className="forgot-password">
            <div className="container">
                <div className='header'>
                    <Logo src={logos.letterWhiteBgBlue} size='lg' alt='AdsCity' onclick={() => navigate('/')} />
                    {!isEmailSent ? (
                        <>
                            <h1 className="title">
                                Mot de passe oublié ?
                            </h1>
                            <p className="subtitle">
                                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="success-icon">
                                <Check size={48} />
                            </div>
                            <h1 className="title">
                                E-mail envoyé !
                            </h1>
                            <p className="subtitle">
                                Nous avons envoyé un lien de réinitialisation à <strong>{formData.email}</strong>
                            </p>
                        </>
                    )}
                </div>

                {/* Formulaire */}
                {!isEmailSent ? (
                    <form className="form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                Adresse e-mail
                            </label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="votre@email.com"
                                    className={`form-input ${errors.email ? 'error' : ''} ${formData.email ? 'filled' : ''}`}
                                    maxLength={254}
                                    disabled={isLoading}
                                    required
                                />
                                {emailCheckLoading && (
                                    <div className="input-loading">
                                        <Spinner variant="bounce" size={10} color="#6c757d" />
                                    </div>
                                )}
                            </div>
                            {errors.email && (<span className="error-message">{errors.email}</span>)}
                        </div>

                        {/* reCAPTCHA */}
                        <div className="form-group">
                            <div className="captcha-wrapper">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={RECAPTCHA_SITE_KEY}
                                    onChange={handleCaptchaChange}
                                    theme="light"
                                    size="normal"
                                />
                            </div>
                            {errors.captcha && (
                                <div className="error-message" role="alert">
                                    {errors.captcha}
                                </div>
                            )}
                        </div>


                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isLoading || !formData.email}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner className="spinner" size={20} />
                                    Envoi en cours...
                                </>
                            ) : (
                                'Envoyer le lien de réinitialisation'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="success-content">
                        <div className="instructions">
                            <h3>Que faire maintenant ?</h3>
                            <ol>
                                <li>Vérifiez votre boîte de réception</li>
                                <li>Cliquez sur le lien dans l'e-mail</li>
                                <li>Créez un nouveau mot de passe</li>
                                <li>Connectez-vous avec votre nouveau mot de passe</li>
                            </ol>
                        </div>

                        <div className="help-section">
                            <p className="help-text">
                                Vous n'avez pas reçu l'e-mail ? Vérifiez votre dossier spam ou
                            </p>
                            <button
                                type="button"
                                className="resend-button"
                                onClick={handleResendEmail}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner className="spinner" size={16} />
                                    </>
                                ) : (
                                    'Renvoyer l\'e-mail'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Lien de retour */}
                <div className="back-link">
                    <Link to="/auth/signin" className="link">
                        <span>Retour à la connexion</span>
                    </Link>
                </div>

                {/* Aide supplémentaire */}
                <div className="help-footer">
                    <p>
                        Besoin d'aide ? <Link to="/help/contact" className="link">Contactez notre support</Link>
                    </p>
                </div>
            </div >
        </div>
    );
};
