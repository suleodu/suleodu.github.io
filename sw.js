var dataCacheName = 'currencyConverter-v1';
var cacheName = 'currency-Converter-v2';
var filesToCache = [
  '/',
  '/index.html',
  '/idb.js',
  '/app.js',
  '/style.css',
  'https://free.currencyconverterapi.com/api/v5/currencies',
];


self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then( cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map( key => {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', (e) => {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://free.currencyconverterapi.com/api/v5/currencies';
  
  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then( (cache) => {
        return fetch(e.request).then((response) => {
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
    
  } else {
   
    e.respondWith(
      caches.match(e.request).then((response) => {
        return response || fetch(e.request);
      })
    );
  }
});