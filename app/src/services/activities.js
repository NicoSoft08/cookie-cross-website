const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const activityService = {
    getUserActivityLogs: async (userId, token) => {
        const response = await fetch(`${api_URL}/api/activities/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user activity logs');
        }

        const data = await response.json();
        console.log(data)
        return data;
    }
}