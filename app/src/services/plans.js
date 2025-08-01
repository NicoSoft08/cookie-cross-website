const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const planService = {
    // Récupérer tous les plans
    // GET /api/plans
    getPlans: async () => {
        const response = await fetch(`${api_URL}/api/plans`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch plans');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    getPlanBySlug: async (slug) => {
        const response = await fetch(`${api_URL}/api/plans/${slug}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch plan');
        }

        const data = await response.json();
        console.log(data)
        return data;
    }
}