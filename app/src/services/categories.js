const api_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'

export const categoryService = {
    // Récupérer toutes les catégories
    getCategories: async (lang = 'fr') => {
        const response = await fetch(`${api_URL}/api/categories?lang=${lang}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }

        const data = await response.json();  
        console.log(data)
        return data;
    },
    // Récupérer une catégorie par Slug
    getCategoryBySlug: async (slug) => {
        const response = await fetch(`${api_URL}/api/categories/${slug}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch category');
        }

        const data = await response.json();
        console.log(data)
        return data;
    },
};