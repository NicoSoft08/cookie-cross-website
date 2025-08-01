const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const userService = {
    // Récupérer un utilisateur par ID
    // GET /api/users/:id
    getUserById: async (userId) => {
        const response = await fetch(`${api_URL}/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        return data;
    },
    // GET /api/users/:id
    getUserProfileById: async (userId, token) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Créer un nouvel utilisateur
    // POST /api/users
    createUser: async (userData) => {
        const response = await fetch(`${api_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer tous les appareils d'un utilisateur
    // GET /api/users/:userId/devices
    getUserDevices: async (userId) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/devices`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user devices');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer tous les utilisateurs connectés
    // GET /api/users/connected
    getConnectedUsers: async () => {
        const response = await fetch(`${api_URL}/api/users/connected`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch connected users');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer tous les utilisateurs en ligne
    // GET /api/users/online
    getOnlineUsers: async () => {
        const response = await fetch(`${api_URL}/api/users/online`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch online users');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer tous les favoris d'un utilisateur
    // GET /api/users/:userId/favorites
    getUserFavorites: async (userId) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/favorites`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user favorites');
        }

        const data = await response.json();
        return data;
    },
    // Noter un utilisateur
    // POST /api/users/:userId/rate
    rateUser: async (userId, rating, comment) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating, comment }),
        });

        if (!response.ok) {
            throw new Error('Failed to rate user');
        }

        const data = await response.json();
        return data;
    },
    // Mettre à jour les recherches d'un utilisateur
    // PUT /api/users/:userId/searches
    updateUserSearches: async (userId, query) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/searches`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Failed to update user searches');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer l'historique de connexion d'un utilisateur
    // GET /api/users/:userId/login-history
    getUserLoginHistory: async (userId) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/login-history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user login history');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer les adresses e-mail d'un utilisateur
    // GET /api/users/:userId/email-addresses
    getUserEmails: async (userId, token) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/email-addresses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user emails');
        }

        const data = await response.json();
        return data;
    },
    // Mettre à jour le genre de l'utilisateur
    // PUT /api/users/:userId/gender/update
    updateUserGender: async (userId, token, gender, visibility) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/gender/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ gender, visibility })
        });

        if (!response.ok) {
            throw new Error('Failed to update user gender');
        }

        const data = await response.json();
        return data;
    },
    // Mettre à jour le l'adresse de domicile de l'utilisateur
    // PUT /api/users/:userId/home-address/update
    updateUserHomeAddress: async (userId, token, address) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/home-address/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ address })
        });

        if (!response.ok) {
            throw new Error('Failed to update user home address');
        }

        const data = await response.json();
        return data;
    },
    // Mettre à jour le l'adresse de service de l'utilisateur
    // PUT /api/users/:userId/working-address/update
    updateUserWorkAddress: async (userId, token, address) => {
        const response = await fetch(`${api_URL}/api/users/${userId}/working-address/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ address })
        });

        if (!response.ok) {
            throw new Error('Failed to update user working-address');
        }

        const data = await response.json();
        return data;
    },
    sendPresencePing: async (token) => {
        const response = await fetch(`${api_URL}/api/users/presence`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to update user presence');
        }

        const data = await response.json();
        return data;
    },
}