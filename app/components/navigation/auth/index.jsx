import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { emailValidationRules, logos } from "../../../config";
import { AlertCircle, ArrowLeft, CheckCircle, ChevronLeft, Eye, EyeOff, Lock, Mail, Phone, RefreshCw, Shield } from "lucide-react";
import Spinner from "../../ui/Spinner";
import ReCAPTCHA from "react-google-recaptcha";
import Logo from "../../ui/Logo";
import { authService } from "../../../services/auth";
import '../../../styles/auth/Signup.scss';
import Toast from "../../ui/Toast";
import { auth } from "../../../firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import PinField from "react-pin-field";

export const EmailSignUp = () => {
    const navigate = useNavigate();

    // Refs
    const validationTimeouts = useRef({});

    const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;


    const [captchaValue, setCaptchaValue] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        agree: false
    });


    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [emailCheckLoading, setEmailCheckLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Fonction de validation d'un champ
    const validateField = useCallback((name, value, allFormData = formData) => {
        const rules = emailValidationRules[name];
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
            case 'confirmPassword':
                if (trimmedValue !== allFormData.password) {
                    return rules.messages.match;
                }
                break;

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

    // Calcul de la force du mot de passe
    const calculatePasswordStrength = useCallback((password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
    }, []);

    // Affichage des toasts
    const showToast = useCallback((type, message) => {
        setToast({ show: true, type, message });
    }, []);

    // Vérification de l'existence de l'email
    const checkEmailExists = useCallback(async (email) => {
        if (!email || !emailValidationRules.email.pattern.test(email)) return;

        setEmailCheckLoading(true);
        try {
            const exists = await authService.checkEmailExists(email);
            if (exists) {
                setErrors(prev => ({
                    ...prev,
                    email: emailValidationRules.email.messages.exists
                }));
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'email:', error);
        } finally {
            setEmailCheckLoading(false);
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
            }, name === 'email' ? 1000 : 500);
        }
    }, [validateAndSetError, checkEmailExists, errors]);

    // Gestion du captcha
    const handleCaptchaChange = useCallback((value) => {
        setCaptchaValue(value);
        if (value && formErrors.captcha) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.captcha;
                return newErrors;
            });
        }
    }, [formErrors.captcha]);

    // Validation de tout le formulaire
    const validateAllFields = useCallback(() => {
        let isValid = true;
        const newErrors = {};

        // Valider tous les champs
        Object.keys(emailValidationRules).forEach(fieldName => {
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

    // ✅ Étape 1: Inscription
    const handleSignUp = async () => {
        if (!validateAllFields()) {
            showToast('error', 'Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setIsLoading(true);
        const { email, password } = formData;
        const result = await authService.register(email, password, captchaValue)
        if (result.success) {
            navigate('verify-email', { state: { email } });
            setCaptchaValue('');
        } else {
            setIsLoading(false);
        }
    }

    // Validation en temps réel
    useEffect(() => {
        if (formData.password) {
            calculatePasswordStrength(formData.password);
        }
    }, [formData.password, calculatePasswordStrength]);

    // Validation en temps réel de la confirmation du mot de passe
    useEffect(() => {
        if (formData.confirmPassword && formData.password) {
            validateAndSetError('confirmPassword', formData.confirmPassword);
        }
    }, [formData.password, formData.confirmPassword, validateAndSetError]);


    // ✅ Étape 2: Vérification d'email
    return (
        <div className="email-signup">
            <div className='signup-header'>
                <Logo src={logos.letterWhiteBgBlue} size='lg' alt='AdsCity' onclick={() => navigate('/')} />
                <h1 className="title">
                    Créer un compte
                </h1>
                <p className="subtitle">
                    Rejoignez notre communauté en quelques étapes
                </p>
            </div>


            <div className="form">
                <div className="form-group">
                    <label className="form-label">
                        Adresse e-mail
                    </label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={'votre@email.com'}
                            className={`form-input ${errors.email ? 'error' : ''} ${formData.email ? 'filled' : ''}`}
                        />
                    </div>
                    {errors.email && (
                        <span className="error-message">{errors.email}</span>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Mot de passe
                    </label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={'Créer un mot de passe'}
                            className={`form-input ${errors.password ? 'error' : ''} ${formData.password ? 'filled' : ''}`}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Confirmer le mot de passe
                    </label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder={'Confirmer le mot de passe'}
                            className={`form-input ${errors.confirmPassword ? 'error' : ''} ${formData.confirmPassword ? 'filled' : ''}`}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                {/* Conditions d'utilisation */}
                <div className="form-group">
                    <label className="checkbox-wrapper checkbox-wrapper--terms">
                        <input
                            type="checkbox"
                            name="agree"
                            checked={formData.agree}
                            onChange={handleChange}
                            className="checkbox-input"
                            aria-describedby={formErrors.agree ? 'agree-error' : undefined}
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
                    {formErrors.agree && (
                        <div id="agree-error" className="error-message" role="alert">
                            {formErrors.agree}
                        </div>
                    )}
                </div>

                {/* reCAPTCHA */}
                <div className="captcha-wrapper">
                    <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={handleCaptchaChange}
                        theme="light"
                    />
                    {formErrors.captcha && <span className="error-message">{formErrors.captcha}</span>}
                </div>

                <button
                    type="submit"
                    className="nav-button nav-button--submit"
                    disabled={isLoading}
                    onClick={handleSignUp}
                >
                    {isLoading ? (
                        <>
                            <Spinner variant="bounce" size={15} color="#fff" />
                        </>
                    ) : (
                        'Créer mon compte'
                    )}
                </button>
            </div>
            <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, type: '', message: '' })} />
        </div>
    );
}

export const PhoneSignUp = () => {
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);
    const pinFieldRef = useRef(null);

    // États principaux
    const [step, setStep] = useState('phone'); // phone, verification, completed
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formattedPhone, setFormattedPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

    // États de chargement et erreurs
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Gestion du countdown pour renvoyer le code
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const maxAttempts = 3;

    // Configuration des numéros russes
    const russianPhoneConfig = {
        countryCode: '+7',
        placeholder: '+7 (XXX) XXX-XX-XX',
        pattern: /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
        format: (number) => {
            // Supprime tous les caractères non numériques
            const cleaned = number.replace(/\D/g, '');

            // Gère les différents formats d'entrée
            let normalized = cleaned;
            if (cleaned.startsWith('8')) {
                normalized = '7' + cleaned.slice(1);
            } else if (cleaned.startsWith('7')) {
                normalized = cleaned;
            } else if (cleaned.length === 10) {
                normalized = '7' + cleaned;
            }

            // Formate le numéro
            if (normalized.length >= 11) {
                const match = normalized.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})/);
                if (match) {
                    return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
                }
            }

            return number;
        },
        validate: (number) => {
            const cleaned = number.replace(/\D/g, '');

            // Doit commencer par 7 et avoir 11 chiffres
            if (!cleaned.startsWith('7') || cleaned.length !== 11) {
                return false;
            }

            // Le premier chiffre après 7 doit être 4, 8 ou 9 (codes mobiles russes)
            const firstDigit = cleaned[1];
            return ['4', '8', '9'].includes(firstDigit);
        },
        normalize: (number) => {
            const cleaned = number.replace(/\D/g, '');
            if (cleaned.startsWith('8')) {
                return '+7' + cleaned.slice(1);
            } else if (cleaned.startsWith('7')) {
                return '+' + cleaned;
            }
            return '+7' + cleaned;
        }
    };

    // Initialisation du reCAPTCHA
    useEffect(() => {
        const initRecaptcha = () => {
            try {
                if (!recaptchaVerifier && recaptchaRef.current) {
                    const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
                        size: 'invisible',
                        callback: () => {
                            console.log('✅ reCAPTCHA résolu');
                        },
                        'expired-callback': () => {
                            console.warn('⚠️ reCAPTCHA expiré');
                            setError('reCAPTCHA expiré. Veuillez réessayer.');
                        }
                    });
                    setRecaptchaVerifier(verifier);
                }
            } catch (error) {
                console.error('Erreur initialisation reCAPTCHA:', error);
                setError('Erreur d\'initialisation. Veuillez recharger la page.');
            }
        };

        initRecaptcha();

        // Nettoyage
        return () => {
            if (recaptchaVerifier) {
                recaptchaVerifier.clear();
            }
        };
    }, [recaptchaVerifier]);

    // Gestion du countdown
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && step === 'verification') {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, step]);

    // Formatage du numéro de téléphone en temps réel
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const formatted = russianPhoneConfig.format(value);
        setPhoneNumber(value);
        setFormattedPhone(formatted);

        // Effacer l'erreur quand l'utilisateur tape
        if (error) {
            setError('');
        }
    };

    // Validation du numéro russe
    const validateRussianPhone = (phone) => {
        const errors = [];

        if (!phone || phone.trim().length === 0) {
            errors.push('Le numéro de téléphone est requis');
            return { isValid: false, errors };
        }

        if (!russianPhoneConfig.validate(phone)) {
            errors.push('Veuillez saisir un numéro de téléphone mobile russe valide');
            return { isValid: false, errors };
        }

        return { isValid: true, errors: [] };
    };

    // Envoi du code SMS
    const handleSendCode = async (e) => {
        e.preventDefault();

        // Validation du numéro
        const validation = validateRussianPhone(phoneNumber);
        if (!validation.isValid) {
            setError(validation.errors[0]);
            return;
        }

        if (!recaptchaVerifier) {
            setError('reCAPTCHA non initialisé. Veuillez recharger la page.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const normalizedPhone = russianPhoneConfig.normalize(phoneNumber);
            console.log('📱 Envoi SMS vers:', normalizedPhone);

            const confirmation = await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier);
            setConfirmationResult(confirmation);
            setStep('verification');
            setCountdown(60);
            setCanResend(false);

            showToast('success', `📱 Code SMS envoyé vers ${formattedPhone}`);

        } catch (error) {
            console.error('Erreur envoi SMS:', error);
            handleFirebaseError(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Vérification du code SMS
    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) {
            setError('Veuillez saisir le code complet à 6 chiffres');
            return;
        }

        if (!confirmationResult) {
            setError('Session expirée. Veuillez recommencer.');
            setStep('phone');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await confirmationResult.confirm(verificationCode);
            const user = result.user;

            console.log('✅ Utilisateur connecté:', user.uid);

            // Créer ou mettre à jour le profil utilisateur
            await authService.createUserProfile({
                uid: user.uid,
                phoneNumber: user.phoneNumber,
                displayName: formattedPhone,
                authMethod: 'phone',
                country: 'RU',
                isPhoneVerified: true
            });

            setStep('completed');
            showToast('success', '✅ Numéro vérifié avec succès !');

            // Redirection après 2 secondes
            setTimeout(() => {
                navigate('/dashboard/quick-access', {
                    state: {
                        user: {
                            uid: user.uid,
                            phoneNumber: user.phoneNumber,
                            displayName: formattedPhone,
                            isPhoneVerified: true
                        }
                    }
                });
            }, 2000);

        } catch (error) {
            console.error('Erreur vérification:', error);
            setAttempts(prev => prev + 1);

            if (error.code === 'auth/invalid-verification-code') {
                setError(`Code incorrect (${attempts + 1}/${maxAttempts})`);
            } else {
                handleFirebaseError(error);
            }

            // Effacer le code et refocus
            setVerificationCode('');
            pinFieldRef.current?.focus();

            // Bloquer après max tentatives
            if (attempts + 1 >= maxAttempts) {
                setError('Trop de tentatives. Demandez un nouveau code.');
                setCanResend(true);
                setCountdown(0);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Renvoyer le code
    const handleResendCode = async () => {
        if (!canResend || isResending || !recaptchaVerifier) return;

        setIsResending(true);
        setError('');

        try {
            const normalizedPhone = russianPhoneConfig.normalize(phoneNumber);
            const confirmation = await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier);
            setConfirmationResult(confirmation);
            setCountdown(60);
            setCanResend(false);
            setAttempts(0);
            setVerificationCode('');

            showToast('success', '📱 Nouveau code SMS envoyé');
            pinFieldRef.current?.focus();

        } catch (error) {
            console.error('Erreur renvoi:', error);
            handleFirebaseError(error);
        } finally {
            setIsResending(false);
        }
    };

    // Auto-vérification quand le code est complet
    useEffect(() => {
        if (verificationCode.length === 6 && step === 'verification' && !isLoading) {
            handleVerifyCode();
        }
    }, [verificationCode, step, isLoading]);

    // Gestion des erreurs Firebase
    const handleFirebaseError = (error) => {
        const errorMessages = {
            'auth/invalid-phone-number': 'Numéro de téléphone invalide',
            'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
            'auth/quota-exceeded': 'Quota SMS dépassé. Réessayez plus tard.',
            'auth/invalid-verification-code': 'Code de vérification incorrect',
            'auth/code-expired': 'Code expiré. Demandez un nouveau code.',
            'auth/missing-verification-code': 'Code de vérification manquant',
            'auth/captcha-check-failed': 'Vérification reCAPTCHA échouée'
        };

        const message = errorMessages[error.code] || 'Une erreur est survenue. Veuillez réessayer.';
        setError(message);
        showToast('error', message);
    };

    // Utilitaire pour les toasts
    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    // Retour à l'étape précédente
    const handleGoBack = () => {
        if (step === 'verification') {
            setStep('phone');
            setVerificationCode('');
            setError('');
        } else {
            navigate('/auth/signup');
        }
    };

    return (
        <div className={`phone-signup ${step}`}>
            <div className="phone-signup-container">
                {/* Header */}
                <div className="phone-signup-header">
                    <button
                        className="back-button"
                        onClick={handleGoBack}
                        disabled={isLoading}
                    >
                        <ChevronLeft size={20} />
                        <span>Retour</span>
                    </button>

                    <div className="step-indicator">
                        <div className={`step ${step === 'phone' ? 'active' : step !== 'phone' ? 'completed' : ''}`}>
                            <Phone size={20} />
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step === 'verification' ? 'active' : step === 'completed' ? 'completed' : ''}`}>
                            <Shield size={20} />
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step === 'completed' ? 'completed' : ''}`}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>

                {/* Étape 1: Saisie du numéro */}
                {step === 'phone' && (
                    <div className="phone-input-section">
                        <div className="section-header">
                            <Phone size={48} className="section-icon" />
                            <h1 className="title">Connexion par téléphone</h1>
                            <p className="subtitle">
                                Saisissez votre numéro de téléphone mobile russe<br />
                                Nous vous enverrons un code de vérification par SMS
                            </p>
                        </div>

                        <form onSubmit={handleSendCode} className="phone-form">
                            <div className="phone-input-group">
                                <label className="phone-label">
                                    <Phone size={18} />
                                    Numéro de téléphone mobile
                                </label>

                                <div className="phone-input-container">
                                    <div className="country-prefix">
                                        <img
                                            src="/flags/ru.svg"
                                            alt="Russie"
                                            className="country-flag"
                                        />
                                        <span className="country-code">+7</span>
                                    </div>

                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="(XXX) XXX-XX-XX"
                                        className={`phone-input ${error ? 'error' : ''}`}
                                        disabled={isLoading}
                                        autoFocus
                                        maxLength={20}
                                    />
                                </div>

                                {formattedPhone && (
                                    <div className="formatted-preview">
                                        Numéro formaté: <strong>{formattedPhone}</strong>
                                    </div>
                                )}

                                {error && (
                                    <div className="error-message">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="phone-info">
                                <div className="info-item">
                                    <Shield size={16} />
                                    <span>Seuls les numéros mobiles russes sont acceptés</span>
                                </div>
                                <div className="info-item">
                                    <Phone size={16} />
                                    <span>Formats acceptés: +7, 8, ou 7 suivi de 10 chiffres</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="send-code-button primary"
                                disabled={isLoading || !phoneNumber}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size={18} />
                                        Envoi du code...
                                    </>
                                ) : (
                                    <>
                                        <Phone size={18} />
                                        Envoyer le code SMS
                                    </>
                                )}
                            </button>

                            {/* reCAPTCHA invisible */}
                            <div ref={recaptchaRef} id="recaptcha-container"></div>
                        </form>

                        <div className="phone-examples">
                            <details className="examples-details">
                                <summary>Exemples de numéros valides</summary>
                                <div className="examples-content">
                                    <ul>
                                        <li>+7 (900) 123-45-67</li>
                                        <li>8 (495) 987-65-43</li>
                                        <li>7 912 345 67 89</li>
                                        <li>+7-800-555-35-35</li>
                                    </ul>
                                </div>
                            </details>
                        </div>
                    </div>
                )}

                {/* Étape 2: Vérification du code */}
                {step === 'verification' && (
                    <div className="verification-section">
                        <div className="section-header">
                            <Shield size={48} className="section-icon" />
                            <h1 className="title">Vérification SMS</h1>
                            <p className="subtitle">
                                Code de vérification envoyé vers<br />
                                <strong>{formattedPhone}</strong>
                            </p>
                        </div>

                        <div className="verification-form">
                            <div className="code-input-group">
                                <label className="code-label">
                                    <Shield size={18} />
                                    Code de vérification (6 chiffres)
                                </label>

                                <div className="pin-field-container">
                                    <PinField
                                        ref={pinFieldRef}
                                        length={6}
                                        validate={/^[0-9]$/}
                                        value={verificationCode}
                                        onChange={setVerificationCode}
                                        className="pin-field"
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            width: '50px',
                                            height: '60px',
                                            margin: '0 6px',
                                            border: `2px solid ${error ? '#ef4444' :
                                                    isLoading ? '#f59e0b' :
                                                        verificationCode.length === 6 ? '#10b981' : '#d1d5db'
                                                }`,
                                            borderRadius: '12px',
                                            backgroundColor: error ? '#fef2f2' : '#ffffff',
                                            outline: 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                        autoFocus
                                        disabled={isLoading || attempts >= maxAttempts}
                                    />
                                </div>

                                <div className="code-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${(verificationCode.length / 6) * 100}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">
                                        {verificationCode.length}/6
                                    </span>
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            {isLoading && (
                                <div className="verifying-indicator">
                                    <Spinner size={20} />
                                    <span>Vérification en cours...</span>
                                </div>
                            )}

                            <div className="verification-actions">
                                <button
                                    className="resend-button secondary"
                                    onClick={handleResendCode}
                                    disabled={!canResend || isResending}
                                >
                                    {isResending ? (
                                        <>
                                            <Spinner variant="bounce" size={15} color="#fff" />
                                        </>
                                    ) : canResend ? (
                                        <>
                                            <RefreshCw size={18} />
                                            Renvoyer le code
                                        </>
                                    ) : (
                                        <>
                                            <Phone size={18} />
                                            Renvoyer dans {countdown}s
                                        </>
                                    )}
                                </button>

                                <button
                                    className="change-number-button tertiary"
                                    onClick={() => setStep('phone')}
                                    disabled={isLoading}
                                >
                                    Changer de numéro
                                </button>
                            </div>

                            <div className="verification-help">
                                <details className="help-details">
                                    <summary>
                                        <AlertCircle size={16} />
                                        Vous ne recevez pas le SMS ?
                                    </summary>
                                    <div className="help-content">
                                        <ul>
                                            <li>📱 Vérifiez que votre téléphone a du réseau</li>
                                            <li>⏱️ Attendez quelques minutes, le SMS peut prendre du temps</li>
                                            <li>🚫 Vérifiez que vous n'avez pas bloqué les SMS inconnus</li>
                                            <li>📞 Assurez-vous que le numéro est correct</li>
                                            <li>🔄 Cliquez sur "Renvoyer le code" si nécessaire</li>
                                        </ul>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                )}

                {/* Étape 3: Confirmation */}
                {step === 'completed' && (
                    <div className="completion-section">
                        <div className="section-header">
                            <CheckCircle size={64} className="section-icon success" />
                            <h1 className="title">Numéro vérifié !</h1>
                            <p className="subtitle">
                                Votre compte a été créé avec succès<br />
                                Redirection vers votre tableau de bord...
                            </p>
                        </div>

                        <div className="completion-info">
                            <div className="user-info">
                                <div className="info-row">
                                    <Phone size={18} />
                                    <span>Numéro vérifié: <strong>{formattedPhone}</strong></span>
                                </div>
                                <div className="info-row">
                                    <Shield size={18} />
                                    <span>Authentification sécurisée activée</span>
                                </div>
                                <div className="info-row">
                                    <CheckCircle size={18} />
                                    <span>Compte créé avec succès</span>
                                </div>
                            </div>
                        </div>

                        <div className="completion-actions">
                            <button
                                className="continue-button primary"
                                onClick={() => navigate('/dashboard/quick-access')}
                            >
                                <CheckCircle size={18} />
                                Accéder au tableau de bord
                            </button>
                        </div>
                    </div>
                )}

                {/* Informations de sécurité */}
                <div className="security-info">
                    <div className="security-item">
                        <Shield size={16} />
                        <span>Connexion sécurisée par SMS</span>
                    </div>
                    <div className="security-item">
                        <Phone size={16} />
                        <span>Numéro protégé et non partagé</span>
                    </div>
                </div>
            </div>

            {/* Toast notifications */}
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ show: false, type: '', message: '' })}
            />
        </div>
    )
}