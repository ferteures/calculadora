// Service worker: guarda os arquivos do app para funcionar offline.
// Ao mudar qualquer arquivo do app, aumente o número da versão abaixo.
const CACHE = "calculadora-v1";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((guardado) => {
      if (guardado) return guardado;
      return fetch(event.request)
        .then((resposta) => {
          // Guarda também as fontes do Google para uso offline.
          if (resposta && (resposta.ok || resposta.type === "opaque")) {
            const copia = resposta.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copia));
          }
          return resposta;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
