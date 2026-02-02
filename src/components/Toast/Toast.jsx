// src/components/Toast/Toast.jsx
import React, { useState, useEffect, useRef } from 'react';

const Toast = () => {
  const [toasts, setToasts] = useState([]);
  const toastCounter = useRef(0); // Contador para garantir unicidade

  useEffect(() => {
    const handleShowToast = (event) => {
      const { type, message, duration = 3000 } = event.detail;
      
      // Usar um ID único: timestamp + contador incremental
      const id = Date.now() + '-' + toastCounter.current++;
      const newToast = { id, type, message };
      
      setToasts(prev => [...prev, newToast]);
      
      // Remover automaticamente após a duração
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
      
      // Resetar o contador se ficar muito grande
      if (toastCounter.current > 10000) {
        toastCounter.current = 0;
      }
    };

    window.addEventListener('showToast', handleShowToast);
    
    return () => {
      window.removeEventListener('showToast', handleShowToast);
    };
  }, []);

  const getToastStyle = (type) => {
    switch(type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md transition-all duration-300 ${getToastStyle(toast.type)} animate-in slide-in-from-right fade-in`}
        >
          <div className="flex items-start">
            <span className="mr-2">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <p className="flex-1 text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-lg opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
          
          {/* Barra de progresso opcional */}
          {toast.duration && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};



export default Toast;