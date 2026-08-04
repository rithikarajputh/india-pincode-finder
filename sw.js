const cacheName = "india-pincode-finder-v10";

const filesToCache = [
    "./",
    "index.html",
    "style.css",
    "script.js",
    "manifest.json",
    "india-pincode.csv"
];

self.addEventListener("install", function (event) {
    self.skipWaiting();

    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (oldCache) {
                    if (oldCache !== cacheName) {
                        return caches.delete(oldCache);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});