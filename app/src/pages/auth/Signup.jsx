import { ArrowLeft, ArrowRight, Check, Lock, Mail, Phone, User } from "lucide-react";
import Logo from "../../components/ui/Logo";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import PhoneInput from "react-phone-input-2";
import Toast from "../../components/ui/Toast";
import ReCAPTCHA from "react-google-recaptcha";
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authService } from "../../services/auth";
import { logos, stepFields, registerFormValidationRules } from "../../config";
import '../../styles/auth/Signup.scss';
import SecureInput from "../../components/SecureInput";

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

export default function Signup() {
    const navigate = useNavigate();

    // États du formulaire
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '',
        password: '', confirmPassword: '',
        agree: false
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [emailCheckLoading, setEmailCheckLoading] = useState(false);
    const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);

    // Refs
    const validationTimeouts = useRef({});
    const recaptchaRef = useRef(null);

    // Validation optimisée avec useCallback
    const validateField = useCallback((name, value) => {
        const rules = registerFormValidationRules[name];
        if (!rules) return null;

        const trimmedValue = typeof value === 'string' ? value.trim() : value;

        if (rules.required && !trimmedValue) return rules.messages.required;
        if (!rules.required && !trimmedValue) return null;
        if (rules.minLength && trimmedValue.length < rules.minLength) return rules.messages.minLength;
        if (rules.maxLength && trimmedValue.length > rules.maxLength) return rules.messages.maxLength;

        // Validations spéciales
        if (name === 'confirmPassword' && trimmedValue !== formData.password) {
            return rules.messages.match;
        }

        if (name === 'email' && (trimmedValue.includes('..') ||
            trimmedValue.startsWith('.') ||
            trimmedValue.endsWith('.'))) {
            return rules.messages.pattern;
        }

        return null;
    }, [formData.password]);

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

    // Validation d'une étape complète
    const validateStep = useCallback((currentStep) => {
        const fieldsToValidate = stepFields[currentStep];
        if (!fieldsToValidate) return false;

        let isValid = true;
        const newErrors = { ...errors };

        fieldsToValidate.forEach(fieldName => {
            const fieldValue = formData[fieldName];
            const error = validateField(fieldName, fieldValue);

            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            } else {
                delete newErrors[fieldName];
            }
        });

        if (currentStep === 0) {
            if (!formData.firstName === registerFormValidationRules.firstName.required) {
                newErrors.firstName = registerFormValidationRules.firstName.messages.required;
                isValid = false;
            }
            else if (formData.firstName.length < registerFormValidationRules.firstName.minLength) {
                newErrors.firstName = registerFormValidationRules.firstName.messages.minLength;
                isValid = false;
            }
            else if (formData.firstName.length > registerFormValidationRules.firstName.maxLength) {
                newErrors.firstName = registerFormValidationRules.firstName.messages.maxLength;
                isValid = false;
            } else {
                delete newErrors.firstName;
            }

            if (!formData.lastName === registerFormValidationRules.lastName.required) {
                newErrors.lastName = registerFormValidationRules.lastName.messages.required;
                isValid = false;
            }
            else if (formData.lastName.length < registerFormValidationRules.lastName.minLength) {
                newErrors.lastName = registerFormValidationRules.lastName.messages.minLength;
                isValid = false;
            }
            else if (formData.lastName.length > registerFormValidationRules.firstName.maxLength) {
                newErrors.lastName = registerFormValidationRules.firstName.messages.maxLength;
                isValid = false;
            } else {
                delete newErrors.lastName;
            }
        }

        if (currentStep === 1) {
            if (!formData.email === registerFormValidationRules.email.required) {
                newErrors.email = registerFormValidationRules.email.messages.required;
                isValid = false;
            }
            else if (!formData.email.includes('@')) {
                newErrors.email = registerFormValidationRules.email.messages.pattern;
                isValid = false;
            }
            else if (formData.email.length < registerFormValidationRules.email.minLength) {
                newErrors.email = registerFormValidationRules.email.messages.minLength;
                isValid = false;
            }
            else if (formData.email.length > registerFormValidationRules.email.maxLength) {
                newErrors.email = registerFormValidationRules.email.messages.maxLength;
                isValid = false;
            } else {
                delete newErrors.email;
            }

            if (!formData.phoneNumber === registerFormValidationRules.phoneNumber.required) {
                newErrors.phoneNumber = registerFormValidationRules.phoneNumber.messages.required;
                isValid = false;
            }
            else if (formData.phoneNumber.length < registerFormValidationRules.phoneNumber.minLength) {
                newErrors.phoneNumber = registerFormValidationRules.phoneNumber.messages.minLength;
                isValid = false;
            } else {
                delete newErrors.phoneNumber;
            }
        }

        // Validations spéciales pour l'étape 3
        if (currentStep === 2) {
            if (!formData.password === registerFormValidationRules.password.required) {
                newErrors.password = registerFormValidationRules.password.messages.required;
            } else if (!formData.password === registerFormValidationRules.password.minLength) {
                newErrors.password = registerFormValidationRules.password.messages.minLength;
            } else if (!formData.password === registerFormValidationRules.password.maxLength) {
                newErrors.password = registerFormValidationRules.password.messages.maxLength;
            } else if (!registerFormValidationRules.password.pattern(formData.password)) {
                newErrors.password = registerFormValidationRules.password.messages.pattern;
            }
            if (!formData.agree) {
                newErrors.agree = 'Vous devez accepter les conditions d\'utilisation';
                isValid = false;
            } else {
                delete newErrors.agree;
            }

            if (!captchaValue) {
                newErrors.captcha = 'Veuillez compléter le captcha';
                isValid = false;
            } else {
                delete newErrors.captcha;
            }
        }

        setErrors(newErrors);
        return isValid;
    }, [formData, errors, captchaValue, validateField]);

    // Affichage des toasts
    const showToast = useCallback((type, message) => {
        setToast({ show: true, type, message });
    }, []);

    // Vérification de l'existence de l'email
    const checkEmailExists = useCallback(async (email) => {
        if (!email || !registerFormValidationRules.email.pattern.test(email)) return;

        setEmailCheckLoading(true);
        try {
            const exists = await authService.checkEmailExists(email);
            if (exists) {
                setErrors(prev => ({
                    ...prev,
                    email: registerFormValidationRules.email.messages.exists
                }));
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'email:', error);
        } finally {
            setEmailCheckLoading(false);
        }
    }, []);

    // Vérification de l'existence de l'email
    const checkPhoneExists = useCallback(async (phone) => {
        if (!phone || !registerFormValidationRules.phoneNumber.pattern.test(phone)) return;

        setPhoneCheckLoading(true);
        try {
            const exists = await authService.checkPhoneExists(phone);
            if (exists) {
                setErrors(prev => ({
                    ...prev,
                    email: registerFormValidationRules.phoneNumber.messages.exists
                }));
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du numéro de téléphone:', error);
        } finally {
            setPhoneCheckLoading(false);
        }
    }, []);

    // Gestion des changements de champs
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: fieldValue
        }));

        // Validation en temps réel avec debounce
        if (validationTimeouts.current[name]) {
            clearTimeout(validationTimeouts.current[name]);
        }

        // Validation immédiate pour certains champs
        const immediateValidationFields = ['confirmPassword', 'agree'];
        if (immediateValidationFields.includes(name)) {
            validateAndSetError(name, fieldValue);
        } else {
            // Validation avec délai pour les autres champs
            validationTimeouts.current[name] = setTimeout(() => {
                validateAndSetError(name, fieldValue);

                // Vérification spéciale pour l'email
                if (name === 'email' && fieldValue && !errors.email) {
                    const emailExists = checkEmailExists(fieldValue);
                    if (emailExists) {
                        errors.email = emailExists.message;
                    }
                }
                if (name === 'phoneNumber' && fieldValue && !errors.phoneNumber) {
                    const phoneExists = checkPhoneExists(fieldValue);
                    if (phoneExists) {
                        errors.phoneNumber = phoneExists.message;
                    }
                }
            }, name === 'email' ? 1000 : 500);
        }
    }, [validateAndSetError, checkEmailExists, checkPhoneExists, errors]);

    // Gestion du changement de téléphone
    const handlePhoneChange = useCallback((value) => {
        setFormData(prev => ({ ...prev, phoneNumber: value }));

        if (validationTimeouts.current.phoneNumber) {
            clearTimeout(validationTimeouts.current.phoneNumber);
        }

        validationTimeouts.current.phoneNumber = setTimeout(() => {
            validateAndSetError('phoneNumber', value);
        }, 500);
    }, [validateAndSetError]);

    // Gestion du captcha
    const handleCaptchaChange = useCallback((value) => {
        setCaptchaValue(value);
        if (value && errors.captcha) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.captcha;
                return newErrors;
            });
        }
    }, [errors.captcha]);

    // Navigation entre les étapes
    const nextStep = useCallback(async () => {
        // Validation de l'étape actuelle
        if (!validateStep(step)) {
            // Animation d'erreur
            const container = document.querySelector('.step-content');
            if (container) {
                container.classList.add('shake-error');
                setTimeout(() => container.classList.remove('shake-error'), 500);
            }
            return;
        }

        // Validations asynchrones spéciales pour l'étape 1 (email)
        if (step === 1 && formData.email && !errors.email) {
            setEmailCheckLoading(true);
            try {
                const emailExists = await authService.checkEmailExists(formData.email);
                if (emailExists) {
                    setErrors(prev => ({
                        ...prev,
                        email: registerFormValidationRules.email.messages.exists
                    }));
                    setEmailCheckLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'email:', error);
            } finally {
                setEmailCheckLoading(false);
            }
        }

        // Passer à l'étape suivante
        setStep(prev => {
            const nextStepValue = Math.min(prev + 1, 3);

            // Animation de transition
            const stepContent = document.querySelector('.step-content');
            if (stepContent) {
                stepContent.classList.add('step-transition-out');
                setTimeout(() => {
                    stepContent.classList.remove('step-transition-out');
                    stepContent.classList.add('step-transition-in');
                    setTimeout(() => stepContent.classList.remove('step-transition-in'), 300);
                }, 150);
            }

            return nextStepValue;
        });
    }, [step, validateStep, formData.email, errors.email]);

    const prevStep = useCallback(() => {
        setStep(prev => {
            const prevStepValue = Math.max(prev - 1, 0);

            // Animation de transition
            const stepContent = document.querySelector('.step-content');
            if (stepContent) {
                stepContent.classList.add('step-transition-out-reverse');
                setTimeout(() => {
                    stepContent.classList.remove('step-transition-out-reverse');
                    stepContent.classList.add('step-transition-in-reverse');
                    setTimeout(() => stepContent.classList.remove('step-transition-in-reverse'), 300);
                }, 150);
            }

            return prevStepValue;
        });
    }, []);

    // Validation de tout le formulaire
    const validateAllFields = useCallback(() => {
        let isValid = true;
        const newErrors = {};

        // Valider tous les champs
        Object.keys(registerFormValidationRules).forEach(fieldName => {
            const error = validateField(fieldName, formData[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        // Validations finales
        if (!formData.agree) {
            newErrors.agree = 'Vous devez accepter les conditions d\'utilisation';
            isValid = false;
        }

        if (!captchaValue) {
            newErrors.captcha = 'Veuillez compléter le captcha';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData, captchaValue, validateField]);

    // Soumission du formulaire
    const handleSubmit = useCallback(async () => {
        if (!validateAllFields()) {
            showToast('error', 'Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setIsLoading(true);
        try {
            // Préparer les données pour l'envoi
            const displayName = `${formData.firstName} ${formData.lastName}`;
            const { email, password, phoneNumber, firstName, lastName } = formData;
            const response = await authService.register(email, password, phoneNumber, firstName, lastName, displayName, captchaValue);

            if (response.success) {
                showToast('success', 'Compte créé avec succès ! Vérifiez votre email.');
                // Redirection ou autre action après succès
                navigate('/auth/verify-email', { state: { email: formData.email } });
            } else {
                throw new Error(response.message || 'Erreur lors de la création du compte');
            }
        } catch (error) {
            console.error('Erreur lors de la création du compte:', error);
            showToast('error', error.message || 'Erreur lors de la création du compte');

            // Réinitialiser le captcha en cas d'erreur
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
                setCaptchaValue(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [validateAllFields, formData, captchaValue, showToast, navigate]);

    // Validation en temps réel de la confirmation du mot de passe
    useEffect(() => {
        if (formData.confirmPassword && formData.password) {
            validateAndSetError('confirmPassword', formData.confirmPassword);
        }
    }, [formData.password, formData.confirmPassword, validateAndSetError]);

    const steps = useMemo(() => [
        {
            title: "Informations personnelles",
            content: (
                <div id="personal" data-step="personal">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <User className="input-icon" />
                            <SecureInput
                                type="text"
                                name="firstName"
                                autoComplete="given-name"
                                value={formData?.firstName}
                                onChange={handleChange}
                                placeholder={'Votre prénom'}
                                className={`form-input ${errors?.firstName ? 'error' : ''}`}
                                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                                onBlur={(fieldName, error) => {
                                    // Mise à jour des erreurs dans le state parent
                                    setErrors(prev => ({ ...prev, [fieldName]: error }));
                                }}
                            />
                        </div>
                        {errors?.firstName && <span className="error-message">{errors?.firstName}</span>}
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <User className="input-icon" />
                            <SecureInput
                                type="text"
                                name="lastName"
                                autoComplete="family-name"
                                value={formData?.lastName}
                                onChange={handleChange}
                                placeholder={'Votre nom'}
                                className={`form-input ${errors?.lastName ? 'error' : ''}`}
                                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                                onBlur={(fieldName, error) => {
                                    // Mise à jour des erreurs dans le state parent
                                    setErrors(prev => ({ ...prev, [fieldName]: error }));
                                }}
                            />
                        </div>
                        {errors?.lastName && <span className="error-message">{errors?.lastName}</span>}
                    </div>
                </div>
            )
        },
        {
            title: "Informations de contact",
            content: (
                <div id="contact" data-step="contact">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <Mail className="input-icon" />
                            <SecureInput
                                className={`form-input ${errors.email ? 'error' : ''} ${formData.email ? 'filled' : ''}`}
                                type="email"
                                name="email"
                                id="email"
                                placeholder='votre@email.com'
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />
                            {emailCheckLoading && (
                                <div className="input-loading">
                                    <Spinner variant="bounce" size={10} color="#6c757d" />
                                </div>
                            )}
                        </div>
                        {errors?.email && <span className="error-message">{errors?.email}</span>}
                    </div>
                    <div className="form-group">
                        <div className="input-wrapper">
                            <Phone className="input-icon" />
                            <PhoneInput
                                country="ru"
                                specialLabel={null}
                                onlyCountries={['ru']}
                                value={formData?.phoneNumber}
                                onChange={handlePhoneChange}
                                inputClass={`phone-input ${errors?.phoneNumber ? 'error' : ''}`}
                                containerClass="phone-container"
                                buttonClass="phone-button"
                            />
                            {phoneCheckLoading && (
                                <div className="input-loading">
                                    <Spinner variant="bounce" size={10} color="#6c757d" />
                                </div>
                            )}
                        </div>
                        {errors?.phoneNumber && <span className="error-message">{errors?.phoneNumber}</span>}
                    </div>
                </div>
            )
        },
        {
            title: "Sécurité du compte",
            content: (
                <div id="security" data-step="security">
                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <SecureInput
                                className={`form-input ${errors.password ? 'error' : ''} ${formData.password ? 'filled' : ''}`}
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Votre mot de passe"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                showPasswordToggle={true}
                                onTogglePassword={() => setShowPassword(!showPassword)}
                                showPassword={showPassword}
                                aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                        </div>

                        {errors?.password && <span className="error-message">{errors?.password}</span>}
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <Lock className="input-icon" />
                            <SecureInput
                                className={`form-input ${errors.confirmPassword ? 'error' : ''} ${formData.confirmPassword ? 'filled' : ''}`}
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder="Confirmer le mot de passe"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                autoComplete="current-password"
                                showPasswordToggle={true}
                                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                                showPassword={showConfirmPassword}
                                aria-label={showConfirmPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                                aria-describedby={errors.confirmPassword ? 'password-error' : undefined}
                            />
                        </div>
                        {errors?.confirmPassword && <span className="error-message">{errors?.confirmPassword}</span>}
                    </div>
                </div>
            )
        }
    ], [
        formData, errors, showPassword, showConfirmPassword,
        setShowConfirmPassword, setShowPassword,
        handleChange, handlePhoneChange,
        emailCheckLoading, phoneCheckLoading
    ]);

    // ✅ Formulaires spécifiques
    return (
        <div className="signup">
            <div className="signup-container">
                <div className="signup-header">
                    <Logo src={logos.letterWhiteBgBlue} size='lg' alt='AdsCity' onclick={() => navigate('/')} />
                    <h1 className="title">Créer un compte</h1>
                    <p className="subtitle">
                        Inscription classique avec email et mot de passe
                    </p>
                </div>

                <div className="form">
                    <div className="step-indicator">
                        <div className={`step ${step >= 0 ? 'active' : ''} ${step > 0 ? 'completed' : ''}`}>
                            1
                        </div>
                        <div className={`step-line ${step > 0 ? 'completed' : ''}`}></div>
                        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            2
                        </div>
                        <div className={`step-line ${step > 0 ? 'completed' : ''}`}></div>
                        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            3
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: step > prevStep ? 50 : -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: step > prevStep ? -50 : 50 }}
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <h2 className="step-title active">
                                {steps[step]?.title}
                            </h2>
                            {steps[step]?.content}
                        </motion.div>
                    </AnimatePresence>

                    {/* Conditions d'utilisation */}
                    <div className="form-group">
                        <label className="checkbox-wrapper checkbox-wrapper--terms">
                            <input
                                type="checkbox"
                                name="agree"
                                checked={formData?.agree}
                                onChange={handleChange}
                                className="checkbox-input"
                                aria-describedby={errors?.agree ? 'agree-error' : undefined}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">
                                J'accepte les{' '}
                                <Link to={`/legal/terms`} target="_blank" className="terms-link">
                                    Conditions d'utilisation{' '}
                                </Link>
                                et la{' '}
                                <Link to={`/legal/privacy-policy`} target="_blank" className="terms-link">
                                    Politique de confidentialité
                                </Link>
                            </span>
                        </label>
                        {errors?.agree && (
                            <div id="agree-error" className="error-message" role="alert">
                                {errors?.agree}
                            </div>
                        )}
                    </div>

                    {/* reCAPTCHA */}
                    {step > 1 && (
                        <div div className="captcha-wrapper">
                            <ReCAPTCHA
                                sitekey={RECAPTCHA_SITE_KEY}
                                onChange={handleCaptchaChange}
                                theme="light"
                            />
                            {errors?.captcha && <span className="error-message">{errors?.captcha}</span>}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        {/* Bouton Retour - seulement visible si ce n'est pas la première étape */}
                        {step > 0 && (
                            <button
                                type="button"
                                className="nav-button nav-button--back"
                                onClick={prevStep}
                                disabled={isLoading}
                            >
                                <ArrowLeft size={20} />
                                Retour
                            </button>
                        )}

                        <div className="nav-spacer" />

                        {/* Bouton Suivant/Créer - logique améliorée */}
                        {step < 2 ? (
                            <button
                                type="button"
                                className="nav-button nav-button--next"
                                onClick={nextStep}
                                disabled={isLoading} // Ajoutez une fonction de validation par étape
                            >
                                Suivant
                                <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                type="submit" // Changé en type submit pour meilleure sémantique HTML
                                className="nav-button nav-button--submit"
                                onClick={handleSubmit}
                                disabled={isLoading} // Utilisez une fonction pour vérifier tout le formulaire
                            >
                                {isLoading ? (
                                    <Spinner variant="bounce" size={15} color="#fff" />
                                ) : (
                                    <>
                                        Créer le compte
                                        <Check size={20} />
                                    </>
                                )}
                            </button>
                        )}

                        {/* Lien d'inscription */}
                        <div className="signup-link">
                            <p>
                                Vous avez déjà un compte ?
                                {' '}
                                <Link to="/auth/signin" className="link">
                                    Se connecter
                                </Link>
                            </p>
                        </div>
                    </div>

                    <Toast show={toast?.show} type={toast?.type} message={toast?.message} onClose={() => setToast({ ...toast, show: false })} />
                </div>
            </div>
        </div >
    );
};
