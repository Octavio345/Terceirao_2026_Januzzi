// src/components/QRCodeGenerator/QRCodeGenerator.jsx
import React from 'react';
import './QRCodeGenerator.css'

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
    </div>
  );
};

export default QRCodeGenerator;