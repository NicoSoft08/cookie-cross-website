const apiClient = async (baseURL, method, url, token = null, data = null, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Permet d'ajouter des headers personnalisés
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        credentials: 'include', // Important pour les cookies de session
        ...options, // Permet d'override la config si nécessaire
    };

    // Ajouter le body seulement pour les méthodes qui l'acceptent
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${baseURL}${url}`, config);
        
        // Gérer différents types de réponses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        // Vérifier si la réponse contient du JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return response; // Pour les réponses non-JSON (images, fichiers, etc.)
    } catch (error) {
        console.error('API Client Error:', error);
        throw error;
    }
};

export default apiClient;
