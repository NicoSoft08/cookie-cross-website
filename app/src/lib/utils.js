import { apiService } from "../services/api";

export const formatDate = (timestamp) => {
    if (timestamp && timestamp._seconds) {
        const date = new Date(timestamp._seconds * 1000); // Convert to milliseconds
        let formattedDate = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

        // Capitalize the first letter
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }
    return '';
};

export async function subscribeUser() {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
        });

        // Envoyer la souscription au serveur
        const res = await apiService.subscribeUser(subscription);
        if (res.success) {
            console.log('Subscription successful:', res);
            return res;
        }
    }
} 