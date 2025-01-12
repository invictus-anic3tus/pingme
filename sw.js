// Service Worker File: sw.js

self.addEventListener("install", (event) => {
  console.log("Service Worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated.");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);

  event.notification.close(); // Close the notification
  // Handle action clicks
  if (event.action === "complete") {
    console.log("User clicked complete.");
  } else if (event.action === "delay") {
    console.log("User clicked delay.");
  } else {
    console.log("Notification clicked without an action.");
  }
  event.waitUntil(
    clients.openWindow('/')
  );
});
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  const data = event.data ? event.data.json() : {};
  console.log('Notification data:', data);

  const title = data.title || 'Default Title';
  const options = {
      body: data.body || 'Default body',
      icon: data.icon || '/images/pingme.png',
      actions: data.actions || [],
      tag: data.tag || 'default-tag',
  };

  event.waitUntil(
      self.registration.showNotification(title, options)
  );
});
