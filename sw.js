const cacheName = "india-pincode-finder-v30";

const filesToCache = [
    "./",
    "index.html",
    "style.css?v=20",
    "script.js?v=30",
    "manifest.json",
    "india-pincode.csv.csv?v=30"
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