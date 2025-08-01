const STORAGE_KEY = 'adsCity.subscriptionPlan';

export const subscriptionPlanStorage = {
    set(plan) {
        if (!plan || typeof plan !== 'object') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    },

    get() {
        const raw = localStorage.getItem(STORAGE_KEY);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Failed to parse subscriptionPlan:', e);
            return null;
        }
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
    },
};
