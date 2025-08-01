import { useEffect } from 'react';
import { apiService } from './services/api';

const publicVapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY; // depuis .env ou ton serveur

export default function NotificationSetup() {
    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/service-worker.js').then(async (registration) => {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
                });

                const res = await apiService.subscribeUser(subscription);
                if (res.success) {
                    console.log('Subscription successful:', res);
                } else {
                    console.error('Subscription failed:', res);
                }
            });
        }
    }, []);

    return null;
}

export function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

