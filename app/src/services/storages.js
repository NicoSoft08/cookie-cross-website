const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const storageService = {
    // Récupérer tous les stocks
    // GET /api/storages
    getStorages: async () => {
        const response = await fetch(`${api_URL}/api/storages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch storages');
        }

        const data = await response.json();
        return data;
    },
    // Supprimer les images d'un post dans le stockage
    // DELETE /api/storages/post/:postId
    deleteImagesFromPost: async (postId) => {
        const response = await fetch(`${api_URL}/api/storages/post/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete images from post');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer les images d'un post
    // GET /api/storages/post/:postId
    getImagesFromPost: async (postId) => {
        const response = await fetch(`${api_URL}/api/storages/post/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch images from post');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer la photo de profil d'un utilisateur
    // GET /api/storages/user/:userId
    getUserProfilePhoto: async (userId) => {
        const response = await fetch(`${api_URL}/api/storages/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile photo');
        }

        const data = await response.json();
        return data;
    },
    // Télécharger une photo de profil dans le stockage
    // POST /api/storages/user/:userId/profile
    uploadUserProfilePhoto: async (userId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const response = await fetch(`${api_URL}/api/storages/user/${userId}/profile`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload user profile photo');
        }

        const data = await response.json();
        return data;
    },
    // Télécharger la photo de couverture d'un utilisateur dans le stockage
    // POST /api/storages/user/:userId/cover
    uploadUserCoverPhoto: async (userId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const response = await fetch(`${api_URL}/api/storages/user/${userId}/cover`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload user cover photo');
        }

        const data = await response.json();
        return data;
    },
    // Télécharger l'image d'un post dans le stockage
    // POST /api/storages/post/:postId
    uploadPostImage: async (formData, token) => {
        const response = await fetch(`${api_URL}/api/storages/post-image/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload post image');
        }

        const data = await response.json();
        console.log(data);
        return data;
    },
    // Télécharger les documents de vérification d'un utilisateur dans le stockage
    // POST /api/storages/user/:userId/verification
    uploadUserVerificationDocuments: async (userId, document, selfie) => {
        const formData = new FormData();
        formData.append('document', document);
        formData.append('selfie', selfie);
        formData.append('userId', userId);

        const response = await fetch(`${api_URL}/api/storages/user/${userId}/verification`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload user verification documents');
        }

        const data = await response.json();
        return data;
    },
};