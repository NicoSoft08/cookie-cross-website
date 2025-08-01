const api_URL = process.env.REACT_APP_API_URL;

export const sessionService = {
    getDeviceByUserId: async (userId, token) => {
        try {
            const response = await fetch(`${api_URL}/api/devices/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch devices');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching devices:', error);
            throw error;
        }
    }
}