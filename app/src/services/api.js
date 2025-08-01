const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const apiService = {
    subscribeUser: async (subscription, token) => {
        const response = await fetch(`${api_URL}/api/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subscription }),
        });

        if (!response.ok) {
            throw new Error('Failed to subscribe user');
        }

        const data = await response.json();
        console.log('Subscription successful:', data);
        return data;
    },
    getVapidKey: async () => {
        const response = await fetch(`${api_URL}/api/notifications/public-key`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get VAPID key');
        }

        const data = await response.json();
        console.log('VAPID key retrieved:', data);
        return data;
    },
    // Recherche avancée
    // POST /api/search
    getAdvancedSearch: async (searchFilters) => {
        const params = new URLSearchParams();

        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });

        const response = await fetch(`${api_URL}/api/listings/search/query?${params.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Erreur lors de la recherche');

        const data = await response.json();
        console.log(data);
        return data;
    }

}