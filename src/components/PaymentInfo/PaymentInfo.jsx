// src/components/PaymentInfo/PaymentInfo.jsx
import React from 'react';
import { Copy, QrCode, Smartphone, CreditCard, AlertCircle, Shield, Zap, Clock, CheckCircle } from 'lucide-react';

const PaymentInfo = ({ vendorInfo }) => {
  // Verifica se vendorInfo existe e tem os dados necessários
  if (!vendorInfo) {
    return (
      <div className="error-state">
        <p>⚠️ Informações do vendedor não disponíveis. Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  // Verifica se os dados necessários existem
  const whatsapp = vendorInfo.whatsapp || '';
  const pixKey = vendorInfo.pixKey || '';
  const pixName = vendorInfo.pixName || '';
  const bankName = vendorInfo.bankName || '';

  const message = `Olá! Quero enviar o comprovante do meu pagamento via PIX.`;
  const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  const copyToClipboard = () => {
    if (pixKey) {
      navigator.clipboard.writeText(pixKey);
      alert('Chave PIX copiada para a área de transferência!');
    } else {
      alert('Chave PIX não disponível.');
    }
  };

  // Determina o tipo de chave PIX automaticamente se não especificado
  const determinePixType = (key) => {
    if (!key) return 'Chave PIX';
    
    if (key.includes('@') || key.includes('.com') || key.includes('.br')) {
      return 'E-mail';
    } else if (/^\d{11}$/.test(key.replace(/\D/g, ''))) {
      return 'CPF';
    } else if (/^\d{14}$/.test(key.replace(/\D/g, ''))) {
      return 'CNPJ';
    } else if (/^\+\d{1,3}\d{10,15}$/.test(key) || /^\d{10,15}$/.test(key.replace(/\D/g, ''))) {
      return 'Telefone';
    } else {
      return 'Chave Aleatória';
    }
  };

  const currentPixType = vendorInfo.pixType || determinePixType(pixKey);

  return (
    <div className="payment-info-section">
      <div className="container">
        {/* Cabeçalho */}
        <div className="payment-header animate-scale">
          <div className="header-icon">
            <CreditCard size={40} />
          </div>
          <div>
            <h1 className="payment-title">Informações de Pagamento</h1>
            <p className="payment-subtitle">
              Processo seguro e rápido via PIX. Siga os passos abaixo para confirmar sua compra.
            </p>
          </div>
        </div>

        <div className="payment-grid">
          {/* Seção PIX Principal */}
          <div className="pix-section">
            <div className="section-header">
              <div className="section-badge">
                <Zap size={16} />
                <span>Pagamento Recomendado</span>
              </div>
              <h2 className="section-title">💳 Pagamento via PIX</h2>
              <p className="section-description">
                Transação instantânea, sem taxas e com confirmação imediata
              </p>
            </div>

            <div className="pix-container">
              {/* Chave PIX */}
              <div className="pix-key-card animate-in">
                <div className="key-header">
                  <div className="key-info">
                    <Shield size={20} className="key-icon" />
                    <div>
                      <h3 className="key-title">Chave PIX ({currentPixType})</h3>
                      <p className="key-subtitle">Copie esta chave para fazer o pagamento</p>
                    </div>
                  </div>
                  <button 
                    className="copy-key-btn"
                    onClick={copyToClipboard}
                  >
                    <Copy size={16} />
                    <span>Copiar Chave</span>
                  </button>
                </div>
                <div className="key-value-container">
                  <code className="key-value">{pixKey || 'Chave PIX não configurada'}</code>
                  <div className="key-status">
                    <CheckCircle size={14} />
                    <span>Chave válida e ativa</span>
                  </div>
                </div>
              </div>

              {/* QR Code com imagem */}
              <div className="qr-code-section animate-in" style={{ animationDelay: '0.1s' }}>
                <div className="qr-code-header">
                  <QrCode size={20} />
                  <h3>QR Code para Pagamento</h3>
                </div>
                <div className="qr-code-container">
                  <div className="qr-code-image-wrapper">
                    <div className="qr-code-image-container">
                      {/* Coloque sua imagem aqui */}
                      <img 
                        src="/qrcode-pix.png" // Caminho da sua imagem
                        alt="QR Code PIX" 
                        className="qr-code-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/200/ffffff/000000?text=QR+CODE";
                        }}
                      />
                    </div>
                    <div className="qr-code-details">
                      <div className="detail-item">
                        <span className="detail-label">Chave PIX:</span>
                        <span className="detail-value">{currentPixType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Destinatário:</span>
                        <span className="detail-value">{pixName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Banco:</span>
                        <span className="detail-value">{bankName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="qr-code-text">
                    <p className="qr-title">Escaneie com seu app de banco</p>
                    <p className="qr-description">
                      Abra o app do seu banco, selecione "Pagar com PIX" e escaneie este código.
                      O valor será inserido automaticamente ou você poderá digitá-lo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passo a passo */}
              <div className="pix-steps animate-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="steps-title">Como pagar via PIX:</h3>
                <div className="steps-container">
                  <div className="step">
                    <div className="step-number">
                      <span>1</span>
                    </div>
                    <div className="step-content">
                      <h4>Abra seu app do banco</h4>
                      <p>Acesse a opção PIX no seu internet banking ou app</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">
                      <span>2</span>
                    </div>
                    <div className="step-content">
                      <h4>Escaneie o QR Code</h4>
                      <p>Use a câmera do seu celular para escanear o código acima</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">
                      <span>3</span>
                    </div>
                    <div className="step-content">
                      <h4>Confirme o pagamento</h4>
                      <p>Verifique os dados e confirme a transação</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">
                      <span>4</span>
                    </div>
                    <div className="step-content">
                      <h4>Envie o comprovante</h4>
                      <p>Envie o comprovante para nosso WhatsApp</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção de envio de comprovante */}
              <div className="payment-info animate-in" style={{ animationDelay: '0.3s' }}>
                <div className="payment-info-content">
                  <h3 className="proof-title">📤 Envio de Comprovante</h3>
                  <p>
                    Após realizar o pagamento via PIX, é <strong>obrigatório</strong> enviar o comprovante pelo WhatsApp para confirmarmos seu pedido.
                  </p>
                  <p className="proof-note">
                    ⏱️ Tempo de confirmação: 1-2 horas úteis após envio do comprovante
                  </p>

                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp btn-large"
                  >
                    📱 Enviar comprovante no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Informações laterais */}
          <div className="info-sidebar">
            {/* Outras formas de pagamento */}
            <div className="other-methods-card animate-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="methods-title">Outras Formas de Pagamento</h3>
              <div className="methods-list">
                <div className="method">
                  <div className="method-icon">
                    <Smartphone size={24} />
                  </div>
                  <div className="method-content">
                    <h4>Transferência Bancária</h4>
                    <p>Solicite os dados da conta pelo WhatsApp</p>
                  </div>
                </div>
                
                <div className="method">
                  <div className="method-icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="method-content">
                    <h4>Dinheiro na Entrega</h4>
                    <p>Disponível apenas para retirada na escola</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações importantes */}
            <div className="important-info-card animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="info-header">
                <AlertCircle size={24} className="info-icon" />
                <h3>Informações Importantes</h3>
              </div>
              <div className="info-content">
                <ul className="info-list">
                  <li className="info-item">
                    <CheckCircle size={16} />
                    <span>Sempre envie o comprovante de pagamento</span>
                  </li>
                  <li className="info-item">
                    <CheckCircle size={16} />
                    <span>Processamos pedidos apenas com pagamento confirmado</span>
                  </li>
                  <li className="info-item">
                    <CheckCircle size={16} />
                    <span>Prazo de entrega inicia após confirmação do pagamento</span>
                  </li>
                  <li className="info-item">
                    <CheckCircle size={16} />
                    <span>Mantenha o comprovante até a entrega do produto</span>
                  </li>
                  <li className="info-item">
                    <CheckCircle size={16} />
                    <span>PIX é instantâneo e sem taxas</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Avisos */}
            <div className="warning-card animate-in" style={{ animationDelay: '0.5s' }}>
              <div className="warning-header">
                <AlertCircle size={20} />
                <h4>Atenção</h4>
              </div>
              <div className="warning-content">
                <p>
                  Não realizamos reembolsos. Em caso de problemas ou dúvidas, 
                  entre em contato conosco imediatamente para encontrarmos a melhor solução.
                </p>
              </div>
            </div>

            {/* Tempo de confirmação */}
            <div className="confirmation-card animate-in" style={{ animationDelay: '0.6s' }}>
              <div className="confirmation-header">
                <Clock size={20} />
                <div>
                  <h4>Tempo de Confirmação</h4>
                  <p className="confirmation-subtitle">PIX - Instantâneo</p>
                </div>
              </div>
              <div className="confirmation-content">
                <div className="timeline">
                  <div className="timeline-step active">
                    <div className="step-dot"></div>
                    <div className="step-label">Pagamento</div>
                  </div>
                  <div className="timeline-line"></div>
                  <div className="timeline-step">
                    <div className="step-dot"></div>
                    <div className="step-label">Envio do Comprovante</div>
                  </div>
                  <div className="timeline-line"></div>
                  <div className="timeline-step">
                    <div className="step-dot"></div>
                    <div className="step-label">Processamento</div>
                  </div>
                </div>
                <p className="timeline-note">
                  Envie o comprovante assim que fizer o pagamento para agilizar o processo.
                </p>
              </div>
            </div>

            {/* Dúvidas */}
            <div className="help-card animate-in" style={{ animationDelay: '0.7s' }}>
              <div className="help-header">
                <AlertCircle size={20} />
                <h4>Dúvidas Frequentes</h4>
              </div>
              <div className="help-content">
                <div className="help-item">
                  <strong>Preciso colocar algum valor específico?</strong>
                  <p>Sim, informe o valor exato do seu pedido.</p>
                </div>
                <div className="help-item">
                  <strong>E se eu pagar um valor diferente?</strong>
                  <p>Seu pedido será processado apenas após confirmação do valor correto.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chamada para ação */}
        <div className="payment-cta animate-scale" style={{ animationDelay: '0.8s' }}>
          <div className="cta-content">
            <div className="cta-icon">🎯</div>
            <div className="cta-text">
              <h3>Pronto para fazer seu pedido?</h3>
              <p>Escolha seus produtos, faça o pagamento e envie o comprovante!</p>
            </div>
          </div>
          <div className="cta-actions">
            <a href="/produtos" className="btn btn-primary btn-large">
              Ver Produtos
            </a>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline btn-large"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-info-section {
          padding: 48px 20px;
          background: linear-gradient(135deg, #F1F5F9 0%, #F8FAFC 100%);
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .error-state {
          text-align: center;
          padding: 60px 20px;
          background: #FEF3F2;
          border: 2px dashed #FDA29B;
          border-radius: 16px;
          margin: 40px auto;
          max-width: 600px;
        }

        .error-state p {
          color: #B42318;
          font-size: 18px;
          font-weight: 500;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .header-icon {
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: #2D3047;
        }

        .payment-title {
          font-size: 2.5rem;
          color: #2D3047;
          margin-bottom: 12px;
          font-weight: 800;
        }

        .payment-subtitle {
          color: #666;
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .payment-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-bottom: 48px;
        }

        @media (min-width: 1200px) {
          .payment-grid {
            grid-template-columns: 1.5fr 1fr;
          }
        }

        .pix-section {
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid #E2E8F0;
        }

        .section-header {
          margin-bottom: 32px;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          color: #2D3047;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.875rem;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 2rem;
          color: #2D3047;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .section-description {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .pix-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .pix-key-card {
          background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%);
          border-radius: 16px;
          padding: 24px;
          border: 2px solid #FFD166;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
        }

        .key-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .key-info {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .key-icon {
          color: #FFD166;
          margin-top: 4px;
        }

        .key-title {
          font-size: 1.25rem;
          color: #2D3047;
          margin-bottom: 4px;
          font-weight: 700;
        }

        .key-subtitle {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
        }

        .copy-key-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          color: #2D3047;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .copy-key-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(255, 209, 102, 0.3);
        }

        .key-value-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #E2E8F0;
        }

        .key-value {
          display: block;
          font-family: 'Courier New', monospace;
          font-size: 1.25rem;
          color: #2D3047;
          font-weight: 600;
          word-break: break-all;
          margin-bottom: 12px;
          padding: 16px;
          background: #F1F5F9;
          border-radius: 8px;
        }

        .key-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10B981;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .qr-code-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E2E8F0;
        }

        .qr-code-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .qr-code-header h3 {
          font-size: 1.5rem;
          color: #2D3047;
          margin: 0;
          font-weight: 700;
        }

        .qr-code-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (min-width: 768px) {
          .qr-code-container {
            grid-template-columns: 1fr 1fr;
          }
        }

        .qr-code-image-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .qr-code-image-container {
          width: 100%;
          max-width: 280px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #E2E8F0;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .qr-code-image {
          width: 100%;
          height: auto;
          aspect-ratio: 1/1;
          object-fit: contain;
        }

        .qr-code-details {
          margin-top: 16px;
          padding: 16px;
          background: #F8FAFC;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          color: #64748B;
          font-weight: 500;
        }

        .detail-value {
          color: #2D3047;
          font-weight: 600;
          text-align: right;
          max-width: 180px;
          word-break: break-word;
        }

        .qr-code-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .qr-title {
          font-size: 1.5rem;
          color: #2D3047;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .qr-description {
          color: #666;
          font-size: 1rem;
          line-height: 1.5;
          margin: 0;
        }

        .pix-steps {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E2E8F0;
        }

        .steps-title {
          font-size: 1.5rem;
          color: #2D3047;
          margin-bottom: 24px;
          font-weight: 700;
        }

        .steps-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .steps-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          color: #2D3047;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.125rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(255, 209, 102, 0.3);
        }

        .step-content h4 {
          color: #2D3047;
          margin-bottom: 8px;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .step-content p {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        /* Seção de envio de comprovante */
        .payment-info {
          background: #F0F9FF;
          border-radius: 16px;
          padding: 24px;
          border: 2px solid #BAE6FD;
          margin-top: 16px;
        }

        .payment-info-content {
          text-align: center;
        }

        .proof-title {
          font-size: 1.5rem;
          color: #0369A1;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .payment-info-content p {
          color: #0369A1;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .proof-note {
          background: rgba(255, 255, 255, 0.8);
          padding: 12px 16px;
          border-radius: 12px;
          border-left: 3px solid #FFD166;
          margin: 24px 0 !important;
          color: #92400E !important;
        }

        .btn-whatsapp {
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          font-size: 1.125rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          margin-top: 16px;
        }

        .btn-whatsapp:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
        }

        .info-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .other-methods-card,
        .important-info-card,
        .warning-card,
        .confirmation-card,
        .help-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
          border: 1px solid #E2E8F0;
        }

        .methods-title {
          font-size: 1.5rem;
          color: #2D3047;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .methods-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .method {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 16px;
          background: #F8FAFC;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .method:hover {
          transform: translateX(5px);
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .method-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2D3047;
          flex-shrink: 0;
        }

        .method-content h4 {
          color: #2D3047;
          margin-bottom: 4px;
          font-size: 1.125rem;
        }

        .method-content p {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .info-icon {
          color: #FFD166;
        }

        .info-header h3 {
          font-size: 1.5rem;
          color: #2D3047;
          margin: 0;
          font-weight: 700;
        }

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-item svg {
          color: #10B981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-item span {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .warning-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .warning-header svg {
          color: #EF4444;
        }

        .warning-header h4 {
          color: #2D3047;
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .warning-content p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .confirmation-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .confirmation-header h4 {
          color: #2D3047;
          margin: 0 0 4px 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .confirmation-subtitle {
          color: #10B981;
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }

        .timeline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .step-dot {
          width: 12px;
          height: 12px;
          background: #E2E8F0;
          border-radius: 50%;
        }

        .timeline-step.active .step-dot {
          background: #FFD166;
          box-shadow: 0 0 0 4px rgba(255, 209, 102, 0.2);
        }

        .step-label {
          font-size: 0.75rem;
          color: #666;
          text-align: center;
          font-weight: 500;
          white-space: nowrap;
        }

        .timeline-line {
          flex: 1;
          height: 2px;
          background: #E2E8F0;
        }

        .timeline-step.active + .timeline-line {
          background: #FFD166;
        }

        .timeline-note {
          font-size: 0.875rem;
          color: #666;
          text-align: center;
          margin: 0;
          font-style: italic;
        }

        .help-card {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border: 1px solid #F59E0B;
        }

        .help-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .help-header svg {
          color: #92400E;
        }

        .help-header h4 {
          color: #92400E;
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .help-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .help-item {
          padding: 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
        }

        .help-item strong {
          color: #92400E;
          font-size: 0.95rem;
          display: block;
          margin-bottom: 4px;
        }

        .help-item p {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
        }

        .payment-cta {
          background: linear-gradient(135deg, #2D3047 0%, #1A1C2E 100%);
          border-radius: 20px;
          padding: 48px;
          color: white;
          text-align: center;
        }

        .cta-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (min-width: 768px) {
          .cta-content {
            flex-direction: row;
            text-align: left;
          }
        }

        .cta-icon {
          font-size: 3rem;
        }

        .cta-text {
          flex: 1;
        }

        .cta-text h3 {
          font-size: 1.75rem;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .cta-text p {
          opacity: 0.9;
          font-size: 1.125rem;
          margin: 0;
        }

        .cta-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid white;
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: white;
          color: #2D3047;
        }

        .btn-primary {
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          color: #2D3047;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 209, 102, 0.3);
        }

        .btn-large {
          font-size: 1.125rem;
          padding: 16px 40px;
        }

        /* Animações */
        .animate-scale {
          animation: scaleIn 0.5s ease-out;
        }

        .animate-in {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .payment-title {
            font-size: 2rem;
          }
          
          .pix-section {
            padding: 24px;
          }
          
          .key-header {
            flex-direction: column;
          }
          
          .copy-key-btn {
            width: 100%;
          }
          
          .qr-code-container {
            grid-template-columns: 1fr;
          }
          
          .qr-code-image-container {
            max-width: 220px;
          }
          
          .cta-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-large {
            width: 100%;
            max-width: 300px;
          }

          .btn-whatsapp {
            width: 100%;
          }

          .timeline {
            flex-direction: column;
            gap: 16px;
          }

          .timeline-line {
            width: 2px;
            height: 20px;
          }

          .step-label {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .payment-header {
            padding: 0 12px;
          }
          
          .section-title {
            font-size: 1.5rem;
          }
          
          .steps-container {
            grid-template-columns: 1fr;
          }
          
          .qr-code-image-container {
            max-width: 180px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentInfo;