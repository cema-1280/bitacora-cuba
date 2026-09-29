// ==========================================
// Service Worker - Bitácora Cuba Offline
// ==========================================

const CACHE_NAME = 'bitacora-cuba-v1';
const ARCHIVOS_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', (evento) => {
    console.log('📦 Service Worker: Instalando...');
    evento.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Service Worker: Cacheando archivos');
            return cache.addAll(ARCHIVOS_CACHE);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (evento) => {
    console.log('🚀 Service Worker: Activado');
    evento.waitUntil(
        caches.keys().then((nombres) => {
            return Promise.all(
                nombres.map((nombre) => {
                    if (nombre !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Borrando caché viejo', nombre);
                        return caches.delete(nombre);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        caches.match(evento.request).then((respuesta) => {
            if (respuesta) {
                return respuesta;
            }
            return fetch(evento.request).then((respuestaRed) => {
                if (respuestaRed && respuestaRed.status === 200 && respuestaRed.type === 'basic') {
                    const respuestaClonada = respuestaRed.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(evento.request, respuestaClonada);
                    });
                }
                return respuestaRed;
            }).catch(() => {
                if (evento.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
