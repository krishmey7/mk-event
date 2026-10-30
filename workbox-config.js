module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,css,html,png,ico,json,woff,woff2,ttf,svg,webp,jpg,jpeg}'],
  // vercel.json n'est pas servi par Vercel (404) : le précacher ferait échouer
  // l'installation du service worker en production. Les valeurs par défaut de
  // Workbox sont répétées car globIgnores les remplace intégralement.
  globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js', 'vercel.json', '**/*.map'],
  swDest: 'dist/sw.js',
  // Le bundle d'entrée web (~3,2 Mo) doit être précaché pour l'offline.
  maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  // App Expo Router en output « single » : toute navigation retombe sur le shell.
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/api\//, /^\/media\//, /^\/admin\//],
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'mk-event-images',
        expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      // Polices Expo (sous assets/node_modules) : non précachées par Workbox,
      // mises en cache au premier chargement pour l'offline.
      urlPattern: ({ request }) => request.destination === 'font',
      handler: 'CacheFirst',
      options: {
        cacheName: 'mk-event-fonts',
        expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    // Les /api/ (JWT + RSVP) ne doivent jamais être mis en cache PWA.
  ],
};
