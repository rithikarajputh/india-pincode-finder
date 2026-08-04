const cacheName = "india-pincode-finder-v2";

const filesToCache = [
    "./",
    "index.html",
    "style.css",
    "script.js",
    "manifest.json",
    "india-pincode.csv"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});