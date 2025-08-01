const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const authService = {
    secureTokenStorage: {
        set: (tokens) => {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('deviceSessionId', tokens.deviceSessionId);
            // Ajouter un flag HttpOnly si possible via cookie
        },
        clear: () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('deviceSessionId');
        }
    },
    // Récupérer un utilisateur par ID
    // GET /api/users/:id
    fetchMe: async (token = null) => {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(`${api_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        return data;
    },
    checkEmailExists: async (email) => {
        const response = await fetch(`${api_URL}/api/auth/check-email-exists?email=${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to check email existence');
        }

        const data = await response.json();
        return data;
    },
    checkPhoneExists: async (phone) => {
        const response = await fetch(`${api_URL}/api/auth/check-phone-exists?phone=${phone}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to check phone existence');
        }

        const data = await response.json();
        return data;
    },
    // Connexion
    // POST /api/auth/signin
    signinUser: async (email, password, rememberMe, captchaValue, ip, browser, os, device, isTabel, isMobile, isBot) => {

        const response = await fetch(`${api_URL}/api/auth/signin`, {
            method: 'POST',
            // credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, rememberMe, captchaValue, ip, browser, os, device, isTabel, isMobile, isBot }),
        });

        const data = await response.json();

        if (response.status === 403 && data?.needsAccountVerification) {
            window.location.href = "/verify-account";
            throw new Error("Account verification is required");
        }

        if (!response.ok) {
            throw new Error("Failed to sign in");
        }

        return data;
    },
    // Création de compte
    // POST /api/auth/signup
    register: async (email, password, phoneNumber, firstName, lastName, displayName, captchaToken) => {
        const response = await fetch(`${api_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, phoneNumber, firstName, lastName, displayName, captchaToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to register');
        }

        const data = await response.json();
        return data;
    },
    verifyEmailCode: async (email, code) => {
        const response = await fetch(`${api_URL}/api/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code }),
        });

        if (!response.ok) {
            throw new Error('Failed to send code verification');
        }

        const data = await response.json();
        console.log(data);
        return data;
    },
    sendPhoneCode: async (phone, token) => {
        const response = await fetch(`${api_URL}/api/auth/send-phone-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ phone }),
        });

        if (!response.ok) {
            throw new Error('Failed to send phone code verification');
        }

        const data = await response.json();
        console.log(data);
        return data;
    },
    verifyPhoneCode: async (phone, code, token) => {
        const response = await fetch(`${api_URL}/api/auth/verify-phone-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ phone, code }),
        });

        if (!response.ok) {
            throw new Error('Failed to verify phone code');
        }

        const data = await response.json();
        console.log(data);
        return data;
    },
    sendEmailVerification: async (email, token) => {
        const response = await fetch(`${api_URL}/api/auth/resend-otp-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error('Failed to send email verification code');
        }

        const data = await response.json();
        return data;
    },
    sendOtpChallenge: async (email, token) => {
        const response = await fetch(`${api_URL}/api/auth/send-otp-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error('Failed to send email verification code');
        }

        const data = await response.json();
        return data;
    },
    forgotPassword: async (email, captchaValue) => {
        const response = await fetch(`${api_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, captchaValue }),
        });

        if (!response.ok) {
            throw new Error('Failed to send password reset email');
        }

        const data = await response.json();
        return data;
    },
    verifyPassword: async (token, password) => {
        const response = await fetch(`${api_URL}/api/auth/verify-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ password }),
        });

        if (!response.ok) {
            throw new Error('Failed to verify password');
        }

        const data = await response.json();
        return data;
    },
    addRecoveryEmail: async (token, email, type) => {
        const response = await fetch(`${api_URL}/api/auth/add-recovery-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ email, type: 'RECOVERY' }),
        });

        if (!response.ok) {
            throw new Error('Failed to add recovery email');
        }

        const data = await response.json();
        console.log(data);
        return data;
    },
};
