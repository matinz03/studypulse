self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: '⏰ StudyPulse', body: event.data ? event.data.text() : 'Your focus timer is up!' };
  }

  const title = payload.title || '⏰ Time Is Up!';
  const options = {
    body: payload.body || 'Your focus block is complete.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: payload.tag || 'studypulse-timer',
    renotify: true,
    requireInteraction: true,
    vibrate: [250, 100, 250, 100, 400],
    data: payload.data || { url: '/' },
    actions: [
      { action: 'open', title: 'Log & Claim XP' },
      { action: 'break', title: '5m Break' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_LOCAL_NOTIFICATION') {
    const p = event.data.payload || {};
    event.waitUntil(
      self.registration.showNotification(p.title || '⏰ Time Is Up!', {
        body: p.body || 'Focus session finished!',
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: p.tag || 'studypulse-timer',
        renotify: true,
        requireInteraction: true,
        vibrate: [250, 100, 250, 100, 400],
        data: p.data || { url: '/' },
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const targetData = event.notification.data || { url: '/' };

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'SW_NOTIFICATION_CLICK', action, data: targetData });
          return;
        }
      }
      if (self.clients.openWindow) {
        const suffix = action === 'break' ? '/?startBreak=1' : '/';
        return self.clients.openWindow(suffix);
      }
    })
  );
});
