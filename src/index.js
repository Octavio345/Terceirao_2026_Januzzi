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

// ===== SERVICE WORKER BÁSICO (APENAS REGISTRO) =====
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    
    // Apenas registra, toda a lógica está no App.js
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('✅ Service Worker registrado');
        
        // Verificar atualizações periodicamente (a cada 30 minutos)
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);
      })
      .catch(error => {
        console.error('❌ Erro no Service Worker:', error);
      });
  });
}