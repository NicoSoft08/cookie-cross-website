import { useCallback, useEffect, useRef, useState } from "react";
import DOMPurify from 'dompurify';
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";
import { validationRules } from "../config";
import { collectClientData } from "../utils";

export default function useLogin() {

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

    const navigate = useNavigate();

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
                navigate('/');

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
    }, [formData, captchaValue, navigate, validateAllFields]);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return {
        formData,
        errors,
        isLoading,
        toast,
        setToast,
        emailCheckLoading,
        showPassword,
        isFormValid,
        handleChange,
        handleSubmit,
        toggleShowPassword,
        recaptchaRef,
        handleCaptchaChange,
    };
}