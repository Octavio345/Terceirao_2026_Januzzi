// public/service-worker.js
const APP_VERSION = 'v1.0.0';
const CACHE_NAME = `terceirao-${APP_VERSION}`;

// ===== SISTEMA DE RIFA =====
const SYNC_TAG = 'sync-raffle-numbers';

// Armazenar números vendidos no IndexedDB
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RaffleNumbersDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('soldNumbers')) {
        db.createObjectStore('soldNumbers', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// Sincronizar em background
const syncSoldNumbers = async () => {
  try {
    const db = await openDatabase();
    const tx = db.transaction('soldNumbers', 'readonly');
    const store = tx.objectStore('soldNumbers');
    const allNumbers = await store.getAll();
    
    // Aqui você pode enviar para um servidor real
    // Por enquanto, vamos apenas sincronizar entre abas
    const response = await fetch('/api/sync-numbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numbers: allNumbers })
    });
    
    if (response.ok) {
      console.log('✅ Números sincronizados com sucesso');
      
      // Notificar todas as abas abertas
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'NUMBERS_SYNCED',
          data: { timestamp: new Date().toISOString() }
        });
      });
    }
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
};

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
    Promise.all([
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
      }),
      // Assume controle de TODAS as páginas abertas
      self.clients.claim()
    ])
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
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('⚡ Atualização forçada solicitada');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.source.postMessage({
        type: 'VERSION_INFO',
        version: APP_VERSION
      });
      break;
      
    case 'MARK_NUMBER_SOLD':
      const { className, number } = data;
      
      // Armazenar localmente
      event.waitUntil(
        openDatabase().then(db => {
          const tx = db.transaction('soldNumbers', 'readwrite');
          const store = tx.objectStore('soldNumbers');
          store.put({
            id: `${className}-${number}`,
            className,
            number,
            soldAt: new Date().toISOString()
          });
          
          // Disparar sincronização
          return tx.complete.then(() => {
            console.log(`✅ Número ${number} da turma ${className} marcado como vendido`);
            self.registration.sync.register(SYNC_TAG);
          });
        })
      );
      break;
  }
});

// ===== SINCRONIZAÇÃO EM BACKGROUND =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-check') {
    console.log('🔍 Verificando atualizações em background...');
    // Aqui você pode implementar lógica para verificar atualizações
  }
  
  if (event.tag === SYNC_TAG) {
    console.log('🔄 Sincronizando números vendidos...');
    event.waitUntil(syncSoldNumbers());
  }
});