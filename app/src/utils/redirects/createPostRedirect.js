// utils/redirects/createPostRedirect.js
const authURL = process.env.REACT_APP_AUTH_URL;
const dashboardURL = process.env.REACT_APP_DASHBOARD_URL;

export const getCreatePostRedirectPath = (currentUser) => {
    const continuePath = `${dashboardURL}/posts/new?step=category-select`;

    if (!currentUser) {
        return `${authURL}?continue=${continuePath}`;
    }

    if (!currentUser.emailVerified) {
        return `${authURL}/verify-email?continue=${continuePath}`;
    }

    if (!currentUser.isActive) {
        return `${authURL}/verify-account?continue=${continuePath}`;
    }

    return continuePath;
};
