/* Service worker for the self-hosted build.

   Strategy, and why:

   index.html carries the auction data, and that data is refreshed weekly.
   So the document is NETWORK-FIRST: when there is a connection you always
   get the current lots, and the cached copy is only used when the network
   fails. A cache-first document would mean the app showed last week's
   auctions until the cache happened to be invalidated — exactly the wrong
   trade-off for this app.

   Icons and the manifest never change meaningfully, so they stay
   CACHE-FIRST, which keeps launches instant.

   Bump CACHE when you change any of the static assets. You do NOT need to
   bump it just to ship new auction data — the network-first document
   handles that on its own.  */

const CACHE = "auction-map-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())        // take over without waiting
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())      // control open pages immediately
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  let url;
  try { url = new URL(e.request.url); } catch (_) { return; }

  const isDocument =
    e.request.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("index.html");

  if (isDocument) {
    // network first — freshness of the auction data wins
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match("./index.html").then(hit => hit || caches.match("./"))
        )
    );
    return;
  }

  // cache first — static assets
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        try {
          if (res && res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
        } catch (_) {}
        return res;
      })
    )
  );
});
