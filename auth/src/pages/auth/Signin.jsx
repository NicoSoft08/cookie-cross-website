import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import DOMPurify from 'dompurify';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/auth/Signin.scss';
import Logo from '../../components/ui/Logo';
import { logos, validationRules } from '../../config';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';
import { authService } from '../../services/auth';
import { collectClientData } from '../../utils';
import InputField from '../../components/ui/InputField';
import SecureInput from '../../components/SecureInput';

const homeURL = process.env.REACT_APP_HOME_URL;
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

export default function Signin() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Récupérer la destination de redirection
    const from = location.state?.from?.pathname;
    const redirectParam = new URLSearchParams(location.search).get('continue');
    const redirectTo = redirectParam || from;

    // États du formulaire
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
        agree: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [emailCheckLoading, setEmailCheckLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Refs
    const validationTimeouts = useRef({});
    const recaptchaRef = useRef(null);

    // Fonction de validation d'un champ
    const validateField = useCallback((name, value, allFormData = formData) => {
        const rules = validationRules[name];
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
            case 'password':
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

            case 'agree':
                if (trimmedValue !== allFormData.agree) {
                    return rules.messages.agree;
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
        if (!email || !validationRules.email.pattern.test(email)) return;

        setEmailCheckLoading(true);
        try {
            const exists = await authService.checkEmailExists(email);
            if (!exists) {
                setErrors(prev => ({
                    ...prev,
                    email: validationRules.email.messages.exists
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

        // Sanitization ciblée (sauf pour les checkboxes et passwords)
        let cleanValue = type === 'checkbox' ? checked : value;

        if (type !== 'checkbox' && name !== 'password') {
            cleanValue = DOMPurify.sanitize(value, {
                ALLOWED_TAGS: [],       // Aucun HTML
                ALLOWED_ATTR: [],       // Aucun attribut
                KEEP_CONTENT: true      // Conserve le texte mais supprime les balises
            });
        }

        setFormData(prev => ({
            ...prev,
            [name]: cleanValue
        }));

        // Gestion du debounce
        if (validationTimeouts.current[name]) {
            clearTimeout(validationTimeouts.current[name]);
        }

        if (['agree'].includes(name)) {
            validateAndSetError(name, cleanValue);
        } else {
            validationTimeouts.current[name] = setTimeout(() => {
                validateAndSetError(name, cleanValue);

                if (name === 'email' && cleanValue && !errors.email) {
                    checkEmailExists(cleanValue); // Utilisation de la valeur nettoyée
                }
            }, name === 'email' ? 1000 : 500);
        }
    }, [validateAndSetError, checkEmailExists, errors.email]);

    // Validation de tout le formulaire
    const validateAllFields = useCallback(() => {
        let isValid = true;
        const newErrors = {};

        // Valider tous les champs
        Object.keys(validationRules).forEach(fieldName => {
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

    // Rediriger si déjà connecté
    useEffect(() => {
        if (currentUser) {
            navigate(redirectTo, { replace: true });
        }
    }, [currentUser, navigate, redirectTo]);

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
    const handleSubmit = useCallback(async () => {
        if (!validateAllFields()) return;

        // Nettoyage final avant soumission
        const sanitizedData = {
            email: DOMPurify.sanitize(formData.email),
            password: formData.password, // Ne pas sanitizer les mots de passe
            rememberMe: formData.rememberMe
        };

        const { ip, browser, os, device, isTablet, isMobile, isBot } = await collectClientData();

        try {
            const response = await authService.signinUser(
                sanitizedData.email,
                sanitizedData.password,
                sanitizedData.rememberMe,
                captchaValue,
                ip,
                browser,
                os,
                device,
                isTablet,
                isMobile,
                isBot
            );

            // Gestion des tokens de manière sécurisée
            if (response.success) {
                authService.secureTokenStorage.set({
                    accessToken: response.accessToken,
                    deviceSessionId: response.deviceSessionId
                });

                await authService.fetchMe(response.accessToken);
                window.location.href = homeURL

                // Réinitialisation sécurisée
                setFormData({});
                setCaptchaValue(null);
            } else {
                authService.secureTokenStorage.clear();
            }

            // Gestion des erreurs
            setToast({
                show: true,
                type: response.success ? 'success' : 'error',
                message: DOMPurify.sanitize(response.message) // Protection XSS pour le message
            });

        } catch (error) {
            console.error('Erreur:', error);
            recaptchaRef.current?.reset();
            setToast({
                show: true,
                type: 'error',
                message: 'Une erreur technique est survenue'
            });
        } finally {
            setIsLoading(false);
        }
    }, [formData, captchaValue, validateAllFields]);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="signin">
            {/* Header avec Logo */}
            <div className='container'>
                <div className='header'>
                    <Logo src={logos.letterWhiteBgBlue} size='lg' alt='AdsCity' onclick={() => window.location.href = homeURL} />
                    <h1 className="title">
                        Bon retour !
                    </h1>
                    <p className="subtitle">
                        Connectez-vous à votre compte
                    </p>
                </div>
                {/* Form */}
                <div className="form">

                    {errors.serve && <p className="error-message">{errors.serve}</p>}

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Adresse e-mail
                        </label>
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
                        {errors.email && (
                            <div id="email-error" className="error-message" role="alert">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Mot de passe
                        </label>
                        <div className="input-wrapper">n
                            <Lock className="input-icon" />

                            <SecureInput
                                className={`form-input ${errors.password ? 'error' : ''} ${formData.password ? 'filled' : ''}`}
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="password"
                                placeholder="Votre mot de passe"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                showPasswordToggle={showPassword}
                                onTogglePassword={toggleShowPassword}
                                showPassword={showPassword}
                                aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                        </div>
                        {errors.password && (
                            <div id="password-error" className="error-message" role="alert">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    {/* Options supplémentaires */}
                    <div className="form-options">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="checkbox-input"
                            />
                            <span className="checkbox-custom"></span>
                            <span className="checkbox-label">
                                Se souvenir de moi
                            </span>
                        </label>

                        <Link to="/auth/forgot-password" className="forgot-pass">
                            Mot de passe oublié ?
                        </Link>
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
                                aria-describedby={errors.agree ? 'agree-error' : undefined}
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
                        {errors.agree && (
                            <div id="agree-error" className="error-message" role="alert">
                                {errors.agree}
                            </div>
                        )}
                    </div>

                    {/* reCAPTCHA */}
                    <div className="form-group">
                        <div className="captcha-wrapper">
                            <ReCAPTCHA
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

                    {/* Bouton de connexion */}
                    <button
                        type="submit"
                        className="nav-button nav-button--submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? (
                            <>
                                <Spinner variant="bounce" size={15} color="#fff" />
                            </>
                        ) : (
                            <span>
                                Se connecter
                            </span>
                        )}
                    </button>

                    {/* Lien d'inscription */}
                    <div className="signup-link">
                        <p>
                            Pas encore de compte ?
                            {' '}
                            <Link to="/signup" className="link">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            {toast.show && (
                <Toast
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ show: false, type: '', message: '' })}
                />
            )}
        </div>
    );
};
