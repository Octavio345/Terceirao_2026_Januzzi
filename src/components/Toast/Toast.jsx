// src/components/Toast/Toast.jsx
import React, { useState, useEffect } from 'react';

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const { type, message, duration = 3000 } = event.detail;
      
      const id = Date.now();
      const newToast = { id, type, message };
      
      setToasts(prev => [...prev, newToast]);
      
      // Remover automaticamente após a duração
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
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

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md transition-all duration-300 ${getToastStyle(toast.type)}`}
        >
          <div className="flex items-start">
            <span className="mr-2">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
            </span>
            <p className="flex-1 text-sm">{toast.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-2 text-lg opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;