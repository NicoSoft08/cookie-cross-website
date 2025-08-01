// public/sw.js (ou serviceWorker.js si tu l'as mis ailleurs)
self.addEventListener('push', event => {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: '/logo192.png',
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
