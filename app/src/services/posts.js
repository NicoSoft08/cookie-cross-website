const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const postService = {
    // Récupérer tous les posts
    // GET /api/posts
    getPublicPosts: async () => {
        const response = await fetch(`${api_URL}/api/listings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        return data;
    },
    // GET /api/admin/listings
    getPosts: async (token) => {
        const response = await fetch(`${api_URL}/api/admin/listings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer un post par ID
    // GET /api/posts/:id
    getPostById: async (postId) => {
        const response = await fetch(`${api_URL}/api/listings/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch post');
        }

        const data = await response.json();
        return data;
    },
    // Créer un nouveau post
    // POST /api/posts
    createPost: async (postData, token, captchaValue) => {
        console.log(postData)
        const response = await fetch(`${api_URL}/api/listings/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                postData,
                captchaValue
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create post');
        }

        const data = await response.json();
        return data;
    },
    // Mettre à jour un post existant
    // PUT /api/posts/:id
    updatePost: async (postId, postData) => {
        const response = await fetch(`${api_URL}/api/listings/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error('Failed to update post');
        }

        const data = await response.json
        return data;
    },
    // Supprimer un post
    // DELETE /api/posts/:id
    deletePost: async (postId) => {
        const response = await fetch(`${api_URL}/api/listings/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete post');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer tous les posts d'un utilisateur
    // GET /api/posts/user/:userId
    getPostsByUser: async (userId) => {
        const response = await fetch(`${api_URL}/api/posts/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts by user');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer tous les posts d'une catégorie
    // GET /api/posts/category/:categoryId
    getPostsByCategory: async (categoryId) => {
        const response = await fetch(`${api_URL}/api/posts/category/${categoryId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts by category');
        }

        const data = await response.json();
        return data;
    },
    // Récupérer tous les posts connexes à un post donné
    // GET /api/posts/:postId/related
    getRelatedPosts: async (postId) => {
        const response = await fetch(`${api_URL}/api/posts/${postId}/related`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch related posts');
        }

        const data = await response.json();
        return data;
    },
    // Marquer un post comme vendu
    // PUT /api/posts/:postId/sold
    markPostAsSold: async (postId) => {
        const response = await fetch(`${api_URL}/api/posts/${postId}/sold`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to mark post as sold');
        }

        const data = await response.json();
        return data;
    },
    // Reposter un post
    // POST /api/posts/:postId/repost
    repostPost: async (postId) => {
        const response = await fetch(`${api_URL}/api/posts/${postId}/repost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to repost post');
        }

        const data = await response.json();
        return data;
    },
    // Mettre à jour le nombre de vues d'un post
    // POST /api/listings/:id/share
    updateShareCount: async (id, token) => {
        const response = await fetch(`${api_URL}/api/listings/${id}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
        });

        if (!response.ok) {
            throw new Error('Failed to update share count');
        }
        const data = await response.json();
        return data;
    },
    // Signaler un post
    // POST /api/listings/:id/report
    reportListing: async (id, token, reason) => {
        const response = await fetch(`${api_URL}/api/listings/${id}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
            body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
            throw new Error('Failed to report listing');
        }
        const data = await response.json();
        return data;
    },
    // Incrémenter le nombre de vues
    // POST /api/listings/:id/views
    incrementViewCount: async (id, token) => {
        const response = await fetch(`${api_URL}/api/listings/${id}/views`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
        });

        if (!response.ok) {
            throw new Error('Failed to increment listing views');
        }
        const data = await response.json();
        return data;
    },
    // Incrémenter le nombre de clicks
    // POST /api/listings/:id/views
    incrementClickCount: async (id, token) => {
        const response = await fetch(`${api_URL}/api/listings/${id}/clicks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
        });

        if (!response.ok) {
            throw new Error('Failed to increment listing views');
        }
        const data = await response.json();
        return data;
    },
    // Ajouter aux favoris
    // POST /api/listings/:id/add-favorite
    addToFavorite: async (id, token) => {
        const response = await fetch(`${api_URL}/api/listings/${id}/favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
        });

        if (!response.ok) {
            throw new Error('Failed to add listing favorite');
        }
        const data = await response.json();
        return data;
    },
    // Retirer des favoris
    // POST /api/listings/:id/remove-favorite
    removeFavorite: async (id, token) => {
        const response = await fetch(`${api_URL}/api/listings/${id}/favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`

            },
        });

        if (!response.ok) {
            throw new Error('Failed to remove listing favorite');
        }
        const data = await response.json();
        return data;
    }
}