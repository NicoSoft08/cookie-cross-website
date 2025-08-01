const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
    ENDPOINTS: {
        // Auth
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        
        // Categories
        CATEGORIES: '/api/categories',
        CATEGORY_BY_ID: (id) => `/api/categories/${id}`,
        
        // Posts
        POSTS: '/api/posts',
        POST_BY_ID: (id) => `/api/posts/${id}`,
        USER_POSTS: (userId) => `/api/posts/user/${userId}`,
        
        // Users
        USERS: '/api/users',
        USER_PROFILE: (userId) => `/api/users/${userId}`,
        USER_ME: '/api/users/me',
    }
};

export default API_CONFIG;
