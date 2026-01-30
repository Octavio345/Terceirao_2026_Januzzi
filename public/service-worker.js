// public/service-worker.js
const APP_VERSION = 'v1.0.0';
const CACHE_NAME = `terceirao-${APP_VERSION}`;

// ===== INSTALAÇÃO =====
self.addEventListener('install', (event) => {
  console.log(`📦 Instalando Terceirão ${APP_VERSION}`);
  
  // Pula a fase de espera - ativa IMEDIATAMENTE
  event.waitUntil(self.skipWaiting());
});

// ===== ATIVAÇÃO =====
self.addEventListener('activate', (event) => {
  console.log(`🚀 Ativando Terceirão ${APP_VERSION}`);
  
  event.waitUntil(
    // Limpa caches de versões antigas
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove todos os caches que não são da versão atual
          if (cacheName.startsWith('terceirao-') && cacheName !== CACHE_NAME) {
            console.log(`🗑️ Removendo cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Assume controle de TODAS as páginas abertas
      return self.clients.claim();
    })
  );
});

// ===== INTERCEPTAÇÃO DE REQUISIÇÕES =====
self.addEventListener('fetch', (event) => {
  // Só processa requisições GET
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Estratégia diferente para cada tipo de recurso
  if (url.pathname === '/' || url.pathname === '/index.html') {
    // HTML: SEMPRE buscar da rede (para atualizações)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Atualiza o cache com a nova versão
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else if (url.pathname.includes('/static/')) {
    // Arquivos estáticos: Cache First (não mudam entre deploys)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request).then((fetchResponse) => {
            // Cache apenas se for bem-sucedido
            if (fetchResponse.ok) {
              const clone = fetchResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return fetchResponse;
          });
        })
    );
  } else {
    // Outros recursos: Network First
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match(event.request))
    );
  }
});

// ===== MENSAGENS DA APLICAÇÃO =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Atualização forçada solicitada');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source.postMessage({
      type: 'VERSION_INFO',
      version: APP_VERSION
    });
  }
});

// ===== SINCRONIZAÇÃO EM BACKGROUND =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-check') {
    console.log('🔍 Verificando atualizações em background...');
    // Aqui você pode implementar lógica para verificar atualizações
  }
});