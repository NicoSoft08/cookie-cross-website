const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const cityService = {
    getCities: async () => {
        const response = await fetch(`${api_URL}/api/cities/ci`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cities');
        }

        const data = await response.json();
        console.log(data)
        return data;
    }
}