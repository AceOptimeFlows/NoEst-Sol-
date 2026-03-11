/* sw.js – Service Worker mejorado de NoEstásSol@ */

const APP_PREFIX  = 'noestássol@';
const APP_VERSION = 'v-1.0.0';

const STATIC_CACHE  = `${APP_PREFIX}-static-${APP_VERSION}`;
const IMG_CACHE     = `${APP_PREFIX}-img-${APP_VERSION}`;
const RUNTIME_CACHE = `${APP_PREFIX}-rt-${APP_VERSION}`;

// Shell básico de la app (lo que quieres tener sí o sí offline)
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './i18n.js',
  './manifest.json',
  './export.json',
  './assets/img/logo.png',
  './assets/img/noestassolo192.png',
  './assets/img/noestassolo180.png',
  './assets/img/noestassolo512.png',
  './lang/es.json',
  './lang/en.json',
  './lang/pt-br.json',
  './lang/fr.json',
  './lang/it.json',
  './lang/de.json',
  './lang/ko.json',
  './lang/ja.json',
  './lang/zh.json',
  './lang/ru.json'
];

// Parámetros de comportamiento
const IMG_CACHE_MAX_ENTRIES = 60;    // Límite simple LRU para imágenes
const HTML_NETWORK_TIMEOUT  = 3500;  // ms para abortar navegaciones lentas

// ------------------------
// Helpers comunes
// ------------------------

function sameOrigin(u) {
  try {
    return new URL(u, self.location).origin === self.location.origin;
  } catch {
    return false;
  }
}

async function putWithLRU(cacheName, request, response, max) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  if (keys.length > max) {
    // FIFO simple: borra el primero que entró
    await cache.delete(keys[0]);
  }
}

// Página offline sencilla para cuando no hay red ni caché
function offlineFallbackResponse() {
  const html = `
    <!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Sin conexión – NoEstásSol@</title>
      <style>
        :root { color-scheme: dark; }
        body{
          margin:0;
          font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
          display:grid;
          place-items:center;
          min-height:100vh;
          background:#020617;
          color:#e5e7eb;
        }
        .card{
          background:#020617;
          border:1px solid #1f2937;
          border-radius:16px;
          padding:20px 22px;
          max-width:520px;
          box-shadow:0 18px 45px rgba(0,0,0,.75);
        }
        h1{
          margin:0 0 8px;
          font-size:1.3rem;
        }
        p{
          margin:4px 0;
          line-height:1.5;
          opacity:.9;
        }
        small{ opacity:.8; font-size:.8rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Estás sin conexión</h1>
        <p>No hemos podido cargar NoEstásSol@ desde la red y tampoco había una copia disponible en este dispositivo.</p>
        <p>Cuando vuelvas a tener Internet, abre de nuevo la app para actualizar el contenido.</p>
        <small>NoEstásSol@ – cuidando tu bienestar también offline.</small>
      </div>
    </body>
    </html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// Estrategia cache-first reutilizable
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(request);
    if (res && res.ok) {
      await cache.put(request, res.clone());
    }
    return res;
  } catch {
    // Si es un documento y no hay nada, devolvemos HTML offline
    return cached || (request.destination === 'document'
      ? offlineFallbackResponse()
      : Response.error());
  }
}

// ------------------------
// Install
// ------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(
        APP_SHELL.map((u) => new Request(u, { cache: 'reload' }))
      )
    )
  );
  self.skipWaiting();
});

// ------------------------
// Activate
// ------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    const keep = new Set([STATIC_CACHE, IMG_CACHE, RUNTIME_CACHE]);

    // Solo limpiamos cachés que claramente pertenecen a NoEstásSol@
    const prefixes = [
      `${APP_PREFIX}-static-`,
      `${APP_PREFIX}-img-`,
      `${APP_PREFIX}-rt-`,
      'nes-static-',
      'nes-runtime-'
    ];

    await Promise.all(
      keys.map((key) => {
        if (prefixes.some((p) => key.startsWith(p)) && !keep.has(key)) {
          return caches.delete(key);
        }
      })
    );

    // Habilita navigationPreload cuando esté disponible
    if ('navigationPreload' in self.registration) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (_) {
        // ignoramos errores silenciosamente
      }
    }

    await self.clients.claim();
  })());
});

// ------------------------
// Mensajes (p.ej. SKIP_WAITING)
// ------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ------------------------
// Fetch strategies
// ------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Solo gestionamos peticiones del mismo origen
  if (!sameOrigin(req.url)) {
    return;
  }

  // 1) Navegación (HTML / SPA): network-primero con timeout + fallback offline
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cachedIndex = await cache.match('./index.html');

      // Intentamos usar navigationPreload si está disponible
      try {
        const preload = await event.preloadResponse;
        if (preload) {
          try {
            await cache.put('./index.html', preload.clone());
          } catch (_) {}
          return preload;
        }
      } catch (_) {
        // ignoramos cualquier error de preload
      }

      // Carrera red vs timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HTML_NETWORK_TIMEOUT);

      try {
        const net = await fetch(req, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (net && net.ok) {
          try {
            await cache.put('./index.html', net.clone());
          } catch (_) {}
        }
        return net;
      } catch (_) {
        clearTimeout(timeoutId);
        // Si no hay red, usamos index cacheada o HTML offline
        return cachedIndex || offlineFallbackResponse();
      }
    })());
    return;
  }

  // 2) Imágenes del mismo origen: stale-while-revalidate con LRU
  if (req.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open(IMG_CACHE);
      const cached = await cache.match(req);

      const fetchPromise = fetch(req)
        .then(async (res) => {
          if (res && res.ok) {
            await putWithLRU(IMG_CACHE, req, res.clone(), IMG_CACHE_MAX_ENTRIES);
          }
          return res;
        })
        .catch(() => null);

      if (cached) {
        // Mientras devolvemos la caché, dejamos que la red actualice en segundo plano
        event.waitUntil(fetchPromise);
        return cached;
      }

      return fetchPromise || Response.error();
    })());
    return;
  }

  // 3) Recursos estáticos locales: cache-first
  if (sameOrigin(req.url)) {
    const pathname = url.pathname;

    const isStatic =
      pathname.endsWith('.html') ||
      pathname.endsWith('.json') ||
      pathname.endsWith('.ico')  ||
      pathname.endsWith('.css')  ||
      pathname.endsWith('.js')   ||
      pathname.endsWith('.woff') || pathname.endsWith('.woff2') ||
      pathname.startsWith('/icons/') ||
      pathname.startsWith('/assets/');

    if (isStatic) {
      event.respondWith(cacheFirst(req, STATIC_CACHE));
      return;
    }
  }

  // 4) Resto de peticiones del mismo origen: cache runtime simple
  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        await cache.put(req, res.clone());
      }
      return res;
    } catch (_) {
      return cached || Response.error();
    }
  })());
});
