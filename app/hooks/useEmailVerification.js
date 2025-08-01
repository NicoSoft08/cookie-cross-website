import { applyActionCode, checkActionCode, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

export const useEmailVerification = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [emailSent, setEmailSent] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    // ✅ Countdown pour le renvoi d'email
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // ✅ Envoyer l'email de vérification
    const sendVerificationEmail = async (currentUser = user) => {
        try {
            setLoading(true);
            setError(null);

            if (!currentUser) {
                throw new Error('Aucun utilisateur connecté');
            }

            await sendEmailVerification(currentUser, {
                url: `${window.location.origin}/auth/email-verified`,
                handleCodeInApp: false
            });

            setEmailSent(true);
            setCanResend(false);
            setCountdown(60); // 60 secondes avant de pouvoir renvoyer

            return {
                success: true,
                message: 'Email de vérification envoyé'
            };
        } catch (error) {
            console.error('Erreur envoi email:', error);
            const errorMessage = getEmailErrorMessage(error.code);
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // ✅ Vérifier le code d'action (depuis l'URL)
    const verifyEmailCode = async (actionCode) => {
        try {
            setLoading(true);
            setError(null);

            // Vérifier le code
            await checkActionCode(auth, actionCode);

            // Appliquer le code pour confirmer l'email
            await applyActionCode(auth, actionCode);

            return {
                success: true,
                message: 'Email vérifié avec succès'
            };
        } catch (error) {
            console.error('Erreur vérification email:', error);
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

    // ✅ Vérifier l'état de vérification en temps réel
    const checkVerificationStatus = () => {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    await currentUser.reload(); // Recharger les données utilisateur
                    resolve(currentUser.emailVerified);
                } else {
                    resolve(false);
                }
                unsubscribe();
            });
        });
    };

    const getEmailErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/too-many-requests':
                return 'Trop de demandes. Réessayez plus tard';
            case 'auth/user-disabled':
                return 'Ce compte a été désactivé';
            case 'auth/user-not-found':
                return 'Utilisateur non trouvé';
            default:
                return 'Erreur lors de l\'envoi de l\'email de vérification';
        }
    };

    const getVerificationErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/expired-action-code':
                return 'Le lien de vérification a expiré';
            case 'auth/invalid-action-code':
                return 'Lien de vérification invalide';
            case 'auth/user-disabled':
                return 'Ce compte a été désactivé';
            default:
                return 'Erreur lors de la vérification de l\'email';
        }
    };

    return {
        loading,
        error,
        user,
        emailSent,
        canResend,
        countdown,
        sendVerificationEmail,
        verifyEmailCode,
        checkVerificationStatus,
        clearError: () => setError(null)
    };
}