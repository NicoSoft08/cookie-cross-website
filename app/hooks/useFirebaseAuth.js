import { createUserWithEmailAndPassword, PhoneAuthProvider, RecaptchaVerifier, signInWithCredential, signInWithPhoneNumber } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebaseConfig";

export const useFirebaseAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verificationId, setVerificationId] = useState(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

    // ✅ Inscription avec Email/Password
    const signUpWithEmail = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            return {
                success: true,
                user: userCredential.user,
                message: 'Compte créé avec succès'
            };
        } catch (error) {
            const errorMessage = getErrorMessage(error.code);
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // ✅ Configuration du reCAPTCHA
    const setupRecaptcha = (containerId = 'recaptcha-container') => {
        try {
            const verifier = new RecaptchaVerifier(auth, containerId, {
                size: 'normal',
                callback: () => {
                    console.log('reCAPTCHA résolu');
                },
                'expired-callback': () => {
                    console.log('reCAPTCHA expiré');
                    setError('reCAPTCHA expiré, veuillez réessayer');
                }
            });

            setRecaptchaVerifier(verifier);
            return verifier;
        } catch (error) {
            console.error('Erreur configuration reCAPTCHA:', error);
            setError('Erreur de configuration de la vérification');
            return null;
        }
    };

    // ✅ Envoi du code SMS
    const sendPhoneVerification = async (phoneNumber) => {
        try {
            setLoading(true);
            setError(null);

            // Configurer reCAPTCHA si pas déjà fait
            let verifier = recaptchaVerifier;
            if (!verifier) {
                verifier = setupRecaptcha();
                if (!verifier) return { success: false, error: 'Erreur de configuration' };
            }

            // Envoyer le code SMS
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
            setVerificationId(confirmationResult.verificationId);

            return {
                success: true,
                verificationId: confirmationResult.verificationId,
                message: 'Code de vérification envoyé'
            };
        } catch (error) {
            console.error('Erreur envoi SMS:', error);
            const errorMessage = getPhoneErrorMessage(error.code);
            setError(errorMessage);

            // Réinitialiser reCAPTCHA en cas d'erreur
            if (recaptchaVerifier) {
                recaptchaVerifier.clear();
                setRecaptchaVerifier(null);
            }

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // ✅ Vérification du code SMS
    const verifyPhoneCode = async (code) => {
        try {
            setLoading(true);
            setError(null);

            if (!verificationId) {
                throw new Error('Aucun code de vérification en cours');
            }

            const credential = PhoneAuthProvider.credential(verificationId, code);
            const userCredential = await signInWithCredential(auth, credential);

            return {
                success: true,
                user: userCredential.user,
                message: 'Numéro vérifié avec succès'
            };
        } catch (error) {
            const errorMessage = getVerificationErrorMessage(error.code);
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // ✅ Messages d'erreur personnalisés
    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Cette adresse email est déjà utilisée';
            case 'auth/invalid-email':
                return 'Adresse email invalide';
            case 'auth/weak-password':
                return 'Le mot de passe doit contenir au moins 6 caractères';
            case 'auth/operation-not-allowed':
                return 'Cette méthode d\'authentification n\'est pas activée';
            default:
                return 'Une erreur est survenue lors de l\'inscription';
        }
    };

    const getPhoneErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-phone-number':
                return 'Numéro de téléphone invalide';
            case 'auth/too-many-requests':
                return 'Trop de tentatives. Réessayez plus tard';
            case 'auth/captcha-check-failed':
                return 'Échec de la vérification reCAPTCHA';
            default:
                return 'Erreur lors de l\'envoi du code de vérification';
        }
    };

    const getVerificationErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-verification-code':
                return 'Code de vérification invalide';
            case 'auth/code-expired':
                return 'Le code de vérification a expiré';
            default:
                return 'Erreur lors de la vérification du code';
        }
    };

    return {
        loading,
        error,
        verificationId,
        signUpWithEmail,
        sendPhoneVerification,
        verifyPhoneCode,
        setupRecaptcha,
        clearError: () => setError(null)
    };
}