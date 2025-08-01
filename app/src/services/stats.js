const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const statsService = {
    // Obtenir l'aperçu des statistiques
    // GET /api/stats/overview
    getOverview: async (token) => {
        const response = await fetch(`${api_URL}/api/stats/overview`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stats overview');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Compter les annonces sur une période
    // GET /api/stats/listings/count?range=daily
    getListingCountByPeriod: async (token, range) => {
        const response = await fetch(`${api_URL}/api/stats/listings/count?range=${range}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings stats by period');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Collecter les annonces par catégorie
    // GET /api/stats/listings/by-category
    getListingByCategory: async (token) => {
        const response = await fetch(`${api_URL}/api/stats/listings/by-category`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings stats by category');
        }

        const data = await response.json();
        console.log('listings stats by category', data)
        return data;
    },
    // GET /api/stats/listings/top?metric=${metric}&limit=10
    getTopListings: async (token, metric, limit) => {
        const response = await fetch(`${api_URL}/api/stats/listings/top?metric=${metric}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch top listings stats by metrics');
        }

        const data = await response.json();
        console.log('top listings stats by metrics', data)
        return data;
    },
    // Collecter les utilisateurs sur une période
    // GET /api/stats/users/registrations?range=monthly
    getUsersByRegistration: async (token, range) => {
        const response = await fetch(`${api_URL}/api/stats/users/registrations?range=${range}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users stats by registration period');
        }

        const data = await response.json();
        console.log('users stats by registration',data)
        return data;
    },
    // Collecter les utilisateurs à partir d'un role
    // GET /api/stats/users/by-role
    getUsersByRole: async (token) => {
        const response = await fetch(`${api_URL}/api/stats/users/by-role`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users stats by role');
        }

        const data = await response.json();
        console.log('users stats by role', data)
        return data;
    },
    // Collecter les utilisateurs par statut d'activité
    // GET /api/stats/users/activity-status
    getUsersByActivityStatus: async (token) => {
        const response = await fetch(`${api_URL}/api/stats/users/activity-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users stats by activity');
        }

        const data = await response.json();
        console.log('users stats by activity', data)
        return data;
    },
    // Collecter les boutique à partir d'une période
    // GET /api/stores/count?range=daily
    getStoresCountByPeriod: async (token, range) => {
        const response = await fetch(`${api_URL}/api/stats/stores/count?range=${range}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stores stats by period');
        }

        const data = await response.json();
        console.log('stores stats by period', data)
        return data;
    },
    // Collecter les boutique à partir du secteur d'activité
    // GET /api/stores/by-sector
    getStoresBySector: async (token) => {
        const response = await fetch(`${api_URL}/api/stats/stores/by-sector`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stores stats by sector');
        }

        const data = await response.json();
        return data;
    },
    // Collecter les boutique à partir du métrique
    // GET /api/stores/top?metric=followers&limit=5
    getStoresTop: async (token, metric, limit) => {
        const response = await fetch(`${api_URL}/api/stats/stores/top?metric=${metric}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch top stores stats by metric');
        }

        const data = await response.json();
        console.log('top stores stats by metric', data)
        return data;
    }
};