const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const brandService = {
    getBrandBySlug: async (slug) => {
        const response = await fetch(`${api_URL}/api/brands/${slug}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch form fields');
        }

        const data = response.json();
        console.log(data)
        return data;
    },
}