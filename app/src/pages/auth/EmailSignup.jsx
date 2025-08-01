import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { emailValidationRules } from '../../config';
import { authService } from '../../services/auth';
import Toast from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import ReCAPTCHA from 'react-google-recaptcha';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import '../../styles/auth/EmailSignup.scss';

export default function EmailSignup() {
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

    // Validation en temps réel de la confirmation du mot de passe
    useEffect(() => {
        if (formData.confirmPassword && formData.password) {
            validateAndSetError('confirmPassword', formData.confirmPassword);
        }
    }, [formData.password, formData.confirmPassword, validateAndSetError]);

    return (
        <div className="email-signup">
            <div className='email-header'>
                <h1 className="title">
                    Email et mot de passe
                </h1>
                <p className="subtitle">
                    Inscription classique avec votre adresse email
                </p>
            </div>


            <div className="email-form">
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
};
