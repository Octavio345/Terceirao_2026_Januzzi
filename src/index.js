import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ===== SERVICE WORKER - PRODUÇÃO =====
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Configura verificação periódica (30 minutos)
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
        
        // Detectar atualizações automaticamente
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          
          newWorker.onstatechange = () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nova versão encontrada - atualiza silenciosamente
                console.log('🔄 Nova versão detectada, atualizando...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // Salva no localStorage para o App.js mostrar notificação
                localStorage.setItem('swUpdateAvailable', 'true');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('❌ Erro no Service Worker:', error);
      });
    
    // Recarrega quando novo Service Worker assumir
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      localStorage.removeItem('swUpdateAvailable');
      window.location.reload();
    });
  });
}

// ===== BOTÃO DEBUG (apenas desenvolvimento) =====
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    const debugDiv = document.createElement('div');
    debugDiv.innerHTML = `
      <button id="force-update" style="
        position: fixed; bottom: 70px; right: 20px; z-index: 9999;
        padding: 8px 12px; background: #ff6b6b; color: white;
        border: none; border-radius: 4px; cursor: pointer;
        font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      ">
        🔄 Forçar Atualização
      </button>
      <button id="clear-cache" style="
        position: fixed; bottom: 110px; right: 20px; z-index: 9999;
        padding: 8px 12px; background: #4ecdc4; color: white;
        border: none; border-radius: 4px; cursor: pointer;
        font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      ">
        🗑️ Limpar Cache
      </button>
    `;
    
    document.body.appendChild(debugDiv);
    
    document.getElementById('force-update').onclick = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update().then(() => {
            alert('Atualização forçada! Recarregue a página.');
          });
        });
      }
    };
    
    document.getElementById('clear-cache').onclick = () => {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
        alert('Cache limpo!');
      });
    };
  }, 2000);
}