const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const notificationService = {
    // Récupérer toutes les notifications
    // GET /api/notifications
    getNotifications: async () => {
        const response = await fetch(`${api_URL}/api/notifications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer les notifications d'un utilisateur
    // GET /api/notifications/users/:userId
    getUserNotifications: async (userId, token) => {
        const response = await fetch(`${api_URL}/api/notifications/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user notifications');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
    // Marquer une notification comme lue
    // PUT /api/notifications/:notificationId/read
    markNotificationAsRead: async (notificationId) => {
        const response = await fetch(`${api_URL}/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        const data = await response.json();
        return data;
    },
    // Marquer toutes les notifications d'un utilisateur comme lues
    // PUT /api/notifications/user/:userId/read
    markUserNotificationsAsRead: async (userId) => {
        const response = await fetch(`${api_URL}/api/notifications/user/${userId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to mark user notifications as read');
        }

        const data = await response.json();
        return data;
    },
    // Supprimer une notification
    // DELETE /api/notifications/:notificationId
    deleteNotification: async (notificationId) => {
        const response = await fetch(`${api_URL}/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete notification');
        }

        const data = await response.json();
        return data;
    },
    // Supprimer toutes les notifications d'un utilisateur
    // DELETE /api/notifications/user/:userId
    deleteUserNotifications: async (userId) => {
        const response = await fetch(`${api_URL}/api/notifications/user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete user notifications');
        }

        const data = await response.json();
        return data;
    }
}