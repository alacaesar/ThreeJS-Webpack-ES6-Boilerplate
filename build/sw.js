var CACHE_NAME = "Mobiquity-Milestones";
var urlsToCache = [
    '/',
];
self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(urlsToCache);
    }));
});
self.addEventListener('activate', (event) => {
    const cleanup = async () => {
        const cacheNames = await caches.keys();
        const cachesToDelete = cacheNames.filter((cacheNames) => (cacheNames.startsWith(`${registration.scope}!`) && cacheNames !== CACHE_NAME));
        await Promise.all(cachesToDelete.map(CACHE_NAME => {
            return caches.delete(CACHE_NAME);
        }))
    };
    event.waitUntil(cleanup());
});