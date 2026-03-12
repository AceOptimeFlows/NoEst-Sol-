/* sw.js – NoEstásSol@ 100% offline shell */

const APP_PREFIX = 'noestassolo';
const APP_VERSION = 'v1.0';

const STATIC_CACHE = `${APP_PREFIX}-static-${APP_VERSION}`;
const IMG_CACHE = `${APP_PREFIX}-img-${APP_VERSION}`;
const RUNTIME_CACHE = `${APP_PREFIX}-rt-${APP_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './i18n.js',
  './export.js',
  './manifest.json',
  './assets/img/logo.png',
  './assets/img/noestassolo180.png',
  './assets/img/noestassolo192.png',
  './assets/img/noestassolo512.png',
  './assets/img/noestassolo-maskable-192.png',
  './assets/img/noestassolo-maskable-512.png',
  './lang/de.json',
  './lang/en.json',
  './lang/es.json',
  './lang/fr.json',
  './lang/it.json',
  './lang/ja.json',
  './lang/ko.json',
  './lang/pt-br.json',
  './lang/ru.json',
  './lang/zh.json'
];

const IMG_CACHE_MAX_ENTRIES = 60;
const HTML_NETWORK_TIMEOUT = 3500;

function sameOrigin(url) {
  try {
    return new URL(url, self.location.href).origin === self.location.origin;
  } catch (_err) {
    return false;
  }
}

function toAbsoluteUrl(resource) {
  return new URL(resource, self.registration.scope).href;
}

function isSuccessfulResponse(response) {
  return !!(response && (response.ok || response.type === 'opaque'));
}

async function putWithLRU(cacheName, request, response, maxEntries) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());

  const keys = await cache.keys();
  while (keys.length > maxEntries) {
    const oldest = keys.shift();
    if (!oldest) break;
    await cache.delete(oldest);
  }
}

function offlineFallbackResponse() {
  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#020617">
    <title>Sin conexión – NoEstásSol@</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 20px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #020617;
        color: #e5e7eb;
      }
      .card {
        width: min(560px, 100%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 18px;
        padding: 22px;
        background:
          radial-gradient(circle at 0% 0%, rgba(56,189,248,0.16), transparent 55%),
          linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.9));
        box-shadow: 0 18px 45px rgba(0,0,0,0.75);
      }
      h1 {
        margin: 0 0 10px;
        font-size: 1.35rem;
      }
      p {
        margin: 8px 0;
        line-height: 1.55;
        color: #cbd5e1;
      }
      strong {
        color: #f8fafc;
      }
    </style>
  </head>
  <body>
    <section class="card">
      <h1>Estás sin conexión</h1>
      <p><strong>NoEstásSol@</strong> no ha podido acceder a la red, pero la app sí debería funcionar offline después de haberse abierto al menos una vez con Internet.</p>
      <p>Si esta pantalla aparece, vuelve a abrir la app una vez online para que el dispositivo guarde la versión local completa.</p>
    </section>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (isSuccessfulResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_err) {
    if (request.destination === 'document') {
      return offlineFallbackResponse();
    }
    return Response.error();
  }
}

async function warmAppShell() {
  const cache = await caches.open(STATIC_CACHE);

  await Promise.all(
    APP_SHELL.map(async (resource) => {
      try {
        const request = new Request(resource, { cache: 'reload' });
        const response = await fetch(request);
        if (response && response.ok) {
          await cache.put(request, response.clone());
        } else {
          console.warn('[NoEstásSol@] Recurso omitido del caché estático:', resource);
        }
      } catch (err) {
        console.warn('[NoEstásSol@] No se pudo precachear:', resource, err);
      }
    })
  );
}

async function matchCachedAppShell(cache, request) {
  const candidates = [
    request,
    request.url,
    './',
    './index.html',
    toAbsoluteUrl('./'),
    toAbsoluteUrl('./index.html')
  ];

  for (const candidate of candidates) {
    const cached = await cache.match(candidate, { ignoreSearch: true });
    if (cached) {
      return cached;
    }
  }

  return null;
}

self.addEventListener('install', (event) => {
  event.waitUntil(warmAppShell());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const existingKeys = await caches.keys();
    const keep = new Set([STATIC_CACHE, IMG_CACHE, RUNTIME_CACHE]);
    const knownPrefixes = [
      `${APP_PREFIX}-static-`,
      `${APP_PREFIX}-img-`,
      `${APP_PREFIX}-rt-`,
      'noestássol@-static-',
      'noestássol@-img-',
      'noestássol@-rt-',
      'nes-static-',
      'nes-runtime-'
    ];

    await Promise.all(
      existingKeys.map((key) => {
        if (knownPrefixes.some((prefix) => key.startsWith(prefix)) && !keep.has(key)) {
          return caches.delete(key);
        }
        return Promise.resolve(false);
      })
    );

    if ('navigationPreload' in self.registration) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (_err) {
        // ignore silently
      }
    }

    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  if (!sameOrigin(request.url)) {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cachedShell = await matchCachedAppShell(cache, request);

      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          await cache.put('./index.html', preloadResponse.clone());
          await cache.put('./', preloadResponse.clone());
          return preloadResponse;
        }
      } catch (_err) {
        // ignore silently
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HTML_NETWORK_TIMEOUT);

      try {
        const networkResponse = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (networkResponse && networkResponse.ok) {
          await cache.put('./index.html', networkResponse.clone());
          await cache.put('./', networkResponse.clone());
        }

        return networkResponse;
      } catch (_err) {
        clearTimeout(timeoutId);
        return cachedShell || offlineFallbackResponse();
      }
    })());
    return;
  }

  if (request.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open(IMG_CACHE);
      const cached = await cache.match(request, { ignoreSearch: true });

      const fetchPromise = fetch(request)
        .then(async (response) => {
          if (response && response.ok) {
            await putWithLRU(IMG_CACHE, request, response.clone(), IMG_CACHE_MAX_ENTRIES);
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(fetchPromise);
        return cached;
      }

      const fresh = await fetchPromise;
      return fresh || Response.error();
    })());
    return;
  }

  const isStaticAsset =
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2');

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(request);
      if (isSuccessfulResponse(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_err) {
      return cached || Response.error();
    }
  })());
});