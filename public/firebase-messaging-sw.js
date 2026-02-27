importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCkvZruMoWv7yFDl1IuTL9NVjYq5g3L7Fw",
    authDomain: "apexquants-3ba48.firebaseapp.com",
    projectId: "apexquants-3ba48",
    storageBucket: "apexquants-3ba48.firebasestorage.app",
    messagingSenderId: "173150409126",
    appId: "1:173150409126:web:e5bd16df0a48980428ff67",
    measurementId: "G-M5WYY4RBRC"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        const notificationTitle = payload.notification?.title || "New Message";
        const notificationOptions = {
            body: payload.notification?.body,
            icon: payload.notification?.icon || '/favicon.ico',
            data: payload.data,
            requireInteraction: true // Critical for keeping Windows OS notifications visible
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (error) {
    console.log('Firebase messaging not initialized in SW', error);
}

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window/tab open with the target URL
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && "focus" in client) {
                    return client.focus();
                }
            }
            // If none, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
