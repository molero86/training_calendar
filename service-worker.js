self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('training-app-cache').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/styles.css',
                '/js/scripts.js',
                '/icons/icon-192x192.png',
                '/icons/icon-256x256.png',
                '/icons/icon-384x384.png',
                '/icons/icon-512x512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});