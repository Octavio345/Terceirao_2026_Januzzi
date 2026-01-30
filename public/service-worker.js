// public/service-worker.js

const CACHE_NAME = 'loja-terceirao-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// INSTALAÇÃO - Cache dos arquivos essenciais
self.addEventListener('install', event => {
  console.log('🛠️ Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache aberto, adicionando arquivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos os recursos cacheados com sucesso');
        return self.skipWaiting(); // Ativa imediatamente
      })
  );
});

// ATIVAÇÃO - Limpa caches antigos
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker ativado!');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Removendo cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Toma controle de todas as páginas imediatamente
      return self.clients.claim();
    })
  );
});

// INTERCEPTA REQUISIÇÕES - Estratégia: Cache First, depois Network
self.addEventListener('fetch', event => {
  // Ignora requisições de chrome-extension ou analytics
  if (event.request.url.includes('chrome-extension') || 
      event.request.url.includes('analytics')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrou
        if (response) {
          return response;
        }
        
        // Se não tem no cache, busca na rede
        return fetch(event.request).then(response => {
          // Se não for uma resposta válida, retorna como está
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clona a resposta para salvar no cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
      .catch(() => {
        // Fallback para página offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// OUVE MENSAGENS DA APLICAÇÃO
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Recebido SKIP_WAITING - Atualizando imediatamente!');
    self.skipWaiting();
  }
});

// VERIFICA ATUALIZAÇÕES PERIODICAMENTE
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-updates') {
    console.log('🕐 Verificando atualizações...');
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url).then(response => {
              cache.put(url, response);
            });
          })
        );
      })
    );
  }
});