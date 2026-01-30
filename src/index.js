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

// ===== SERVICE WORKER - APENAS EM PRODUÇÃO =====
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('✅ Service Worker registrado');
        
        // Verificar atualizações a cada 30 minutos
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
        
        // Detectar quando uma nova versão está disponível
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nova versão encontrada - atualiza automaticamente
                console.log('🔄 Nova versão detectada');
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // Notifica o App.js sobre a atualização
                localStorage.setItem('swUpdateAvailable', 'true');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('❌ Erro no Service Worker:', error);
      });
    
    // Recarrega quando novo Service Worker assumir controle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      localStorage.removeItem('swUpdateAvailable');
      window.location.reload();
    });
  });
}