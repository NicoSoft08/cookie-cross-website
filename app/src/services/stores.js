const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const storeService = {
    // Récupérer tous les magasins
    // GET /api/stores
    getPublicStores: async () => {
        const response = await fetch(`${api_URL}/api/stores`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stores');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Créer un nouveau magasin
    // POST /api/stores/create
    createStore: async (formDataToSend, token) => {
        const response = await fetch(`${api_URL}/api/stores/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formDataToSend
        });

        if (!response.ok) {
            throw new Error('Failed to create store');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Récupérer un magasin par slug
    // GET /api/stores/:slug
    getStoreBySlug: async (slug) => {
        const response = await fetch(`${api_URL}/api/stores/slug/${slug}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch store');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer un magasin par ID
    // GET /api/stores/:id
    getStoreById: async (id) => {
        const response = await fetch(`${api_URL}/api/stores/id/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch store');
        }

        const data = await response.json();
        console.log("Store data:", data);
        return data;
    },
    // Récupérer un magasin par ID utilisateur
    // GET /api/stores/user/:userId
    getStoreByUserId: async (userId, token) => {
        const response = await fetch(`${api_URL}/api/stores/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch store by user ID');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer les annonces d'une boutique par son ID
    // GET /api/stores/:id/listings
    getStoreListings: async (id) => {
        const response = await fetch(`${api_URL}/api/stores/id/${id}/listings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get store listings');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Liker une boutique
    // POST /api/stores/:id/like
    likeStore: async (id, token) => {
        const response = await fetch(`${api_URL}/api/stores/${id}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to like store');
        }

        const data = await response.json();
        return data;
    },
    // Disliker une boutique
    // POST /api/stores/:id/dislike
    dislikeStore: async (id, token) => {
        const response = await fetch(`${api_URL}/api/stores/${id}/dislike`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to dislike store');
        }

        const data = await response.json();
        return data;
    },
    // Suivre une boutique
    // POST /api/stores/:id/follow
    followStore: async (id, token) => {
        const response = await fetch(`${api_URL}/api/stores/id/${id}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to follow store');
        }

        const data = await response.json();
        return data;
    },
    // Ne plus suivre une boutique
    // DELETE /api/stores/:storeId/unfollow
    unfollowStore: async (id, token) => {
        const response = await fetch(`${api_URL}/api/stores/id/${id}/unfollow`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to follow store');
        }

        const data = await response.json();
        return data;
    },
    // Augmenter le nombre de visites d'une boutique
    // POST /api/stores/:storeId/visits
    incrementStoreVisit: async (id, token) => {
        const response = await fetch(`${api_URL}/api/stores/id/${id}/visits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to increment store visit');
        }

        const data = await response.json();
        return data;
    }
}