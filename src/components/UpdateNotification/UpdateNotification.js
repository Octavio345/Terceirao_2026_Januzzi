// src/components/UpdateNotification/UpdateNotification.js
import React from 'react';
import './UpdateNotification.css';

const UpdateNotification = ({ onUpdate, onDismiss }) => {
  return (
    <div className="update-notification">
      <div className="update-notification-content">
        <div className="update-notification-icon">🔄</div>
        <div className="update-notification-text">
          <h3>Atualização Disponível!</h3>
          <p>Uma nova versão do app está disponível. Clique em "Atualizar" para carregar as últimas melhorias.</p>
          <p className="update-note"><small>O app será recarregado automaticamente.</small></p>
        </div>
        <div className="update-notification-actions">
          <button 
            className="update-notification-button dismiss"
            onClick={onDismiss}
          >
            Agora não
          </button>
          <button 
            className="update-notification-button update"
            onClick={onUpdate}
          >
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;