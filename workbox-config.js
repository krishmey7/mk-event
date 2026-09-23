module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,css,html,png,ico,json,woff,woff2,ttf,svg,webp,jpg,jpeg}'],
  swDest: 'dist/sw.js',
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'mk-event-images',
        expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    // Les /api/ (JWT + RSVP) ne doivent jamais être mis en cache PWA.
  ],
};
