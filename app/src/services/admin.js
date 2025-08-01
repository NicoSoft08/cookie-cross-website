const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const adminService = {
    // Récupérer tous les utilisateurs
    // GET /api/users
    getUsers: async (token) => {
        const response = await fetch(`${api_URL}/api/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Récupérer tous les magasins
    // GET /api/stores
    getStores: async (token) => {
        const response = await fetch(`${api_URL}/api/admin/stores`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch stores');
        }

        const data = await response.json();
        console.log(data);
        return data;
    },
    // Changer le statut d'une voutique
    // PUT /api/stores/:id/status
    changeStoreStatus: async (storeId, status, token) => {
        const response = await fetch(`${api_URL}/api/admin/stores/${storeId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Failed to change store status');
        }

        const data = await response.json();
        return data;
    }
};