// src/components/QRCodeGenerator/QRCodeGenerator.jsx
import React from 'react';

const QRCodeGenerator = ({ pixKey, amount, name }) => {
  // CORREÇÃO: Garantir que amount seja um número
  const formatAmount = (value) => {
    // Converte para número, remove caracteres não numéricos
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const formattedAmount = formatAmount(amount);

  return (
    <div className="qr-code-real">
      <div className="qr-code-image-container">
        {/* Caminho corrigido para a pasta imagens dentro de public */}
        <img 
          src="/imagens/Qr_code.jpeg" 
          alt="QR Code PIX" 
          className="qr-code-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/256/ffffff/000000?text=QR+CODE+PIX";
            console.error("Erro ao carregar QR Code. Verifique o caminho: /imagens/Qr_code.jpeg");
          }}
        />
      </div>
      <div className="qr-code-info">
        <p className="amount">R$ {formattedAmount}</p>
        <p className="name">{name}</p>
        <p className="pix-key">Chave: {pixKey}</p>
        <p className="hint">Escaneie com seu app bancário</p>
        <p className="instruction">Use a função PIX → Ler QR Code</p>
      </div>
      
      <style jsx>{`
        .qr-code-real {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .qr-code-image-container {
          position: relative;
          padding: 12px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #E2E8F0;
        }
        
        .qr-code-image {
          width: 256px;
          height: 256px;
          object-fit: contain;
          display: block;
        }
        
        .qr-code-overlay {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 12px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .overlay-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .overlay-text {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-dark);
        }
        
        .overlay-amount {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-yellow);
        }
        
        .qr-code-info {
          text-align: center;
          max-width: 280px;
        }
        
        .amount {
          font-size: 28px;
          font-weight: 800;
          color: var(--color-yellow);
          margin: 0 0 8px 0;
        }
        
        .name {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-dark);
          margin: 0 0 4px 0;
          word-wrap: break-word;
        }
        
        .pix-key {
          font-size: 12px;
          color: #64748B;
          margin: 0 0 8px 0;
          word-break: break-all;
          background: #F1F5F9;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #E2E8F0;
        }
        
        .hint {
          font-size: 14px;
          color: #64748B;
          margin: 0 0 4px 0;
        }
        
        .instruction {
          font-size: 12px;
          color: #94A3B8;
          margin: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default QRCodeGenerator;