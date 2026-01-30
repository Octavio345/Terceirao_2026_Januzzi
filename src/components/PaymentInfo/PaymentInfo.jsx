import React, { useState, useEffect } from 'react';
import { Copy, QrCode, CreditCard, AlertCircle, Shield,  Clock, CheckCircle, MessageCircle, ArrowRight, Check, Send } from 'lucide-react';

const PaymentInfo = ({ vendorInfo }) => {
  // Estado para controlar se o usuário já enviou comprovante
  const [hasSentProof, setHasSentProof] = useState(() => {
    return localStorage.getItem('hasSentPixProof') === 'true';
  });

  // Estado para controlar se está em mobile
  const [isMobile, setIsMobile] = useState(false);

  // Estado para copiar chave PIX
  const [copied, setCopied] = useState(false);

  // Verificar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Atualizar localStorage quando enviar comprovante
  useEffect(() => {
    localStorage.setItem('hasSentPixProof', hasSentProof);
  }, [hasSentProof]);

  // Verifica se vendorInfo existe e tem os dados necessários
  if (!vendorInfo) {
    return (
      <div className="error-state">
        <AlertCircle size={32} />
        <p>Informações do vendedor não disponíveis.</p>
      </div>
    );
  }

  // Verifica se os dados necessários existem
  const whatsapp = vendorInfo.whatsapp || '';
  const pixKey = vendorInfo.pixKey || '';
  const pixName = vendorInfo.pixName || '';
  const bankName = vendorInfo.bankName || '';

  const message = `Olá! Acabei de fazer o pagamento via PIX e gostaria de enviar o comprovante.`;
  const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  const copyToClipboard = () => {
    if (pixKey) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      alert('❌ Chave PIX não disponível.');
    }
  };

  // Função para marcar como enviado
  const handleSendProof = () => {
    if (!hasSentProof) {
      setHasSentProof(true);
      // Abrir WhatsApp
      window.open(url, '_blank');
      
      // Mostrar mensagem de sucesso
      setTimeout(() => {
        alert('✅ Comprovante enviado com sucesso! Aguarde a confirmação.');
      }, 500);
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
            <CreditCard size={isMobile ? 32 : 40} />
          </div>
          <div>
            <h1 className="payment-title">Pagamento via PIX</h1>
            <p className="payment-subtitle">
              {hasSentProof 
                ? '✅ Comprovante enviado! Aguarde a confirmação.'
                : 'Pagamento instantâneo e seguro. Siga os passos abaixo.'}
            </p>
          </div>
        </div>

        {/* Banner de Status do Comprovante */}
        {hasSentProof && (
          <div className="proof-status-banner success animate-scale">
            <div className="banner-content">
              <CheckCircle size={24} />
              <div>
                <h3>Comprovante Enviado com Sucesso!</h3>
                <p>Vendedor confirmará em até 2 horas úteis.</p>
              </div>
            </div>
            <button 
              className="banner-action"
              onClick={() => setHasSentProof(false)}
            >
              <Send size={16} />
              Reenviar
            </button>
          </div>
        )}

        <div className="payment-grid">
          {/* Seção PIX Principal */}
          <div className="pix-section">
            {/* Seção de envio de comprovante - TOPO - MUITO EVIDENTE */}
            <div className="proof-section-main animate-in">
              <div className="proof-header">
                <div className="proof-badge">
                  <MessageCircle size={16} />
                  <span>⚠️ AÇÃO OBRIGATÓRIA</span>
                </div>
                <h2 className="proof-title-main">
                  <MessageCircle size={28} />
                  ENVIAR COMPROVANTE
                </h2>
                <p className="proof-description-main">
                  <strong>Após fazer o pagamento PIX, você DEVE enviar o comprovante</strong> para confirmar seu pedido.
                </p>
              </div>

              <div className="proof-actions">
                <div className="proof-notes">
                  <div className="proof-note-item">
                    <Clock size={18} />
                    <span><strong>Confirmação rápida:</strong> 1-2 horas úteis após envio</span>
                  </div>
                  <div className="proof-note-item">
                    <AlertCircle size={18} />
                    <span><strong>Atenção:</strong> Pedido só será processado após confirmação</span>
                  </div>
                </div>

                {/* Botão PRINCIPAL - DESTAQUE MÁXIMO */}
                <button
                  onClick={handleSendProof}
                  className={`btn-send-proof ${hasSentProof ? 'sent' : 'primary'}`}
                  disabled={hasSentProof}
                >
                  <div className="btn-content">
                    {hasSentProof ? (
                      <>
                        <CheckCircle size={28} />
                        <div className="btn-text">
                          <span className="btn-title">COMPROVANTE ENVIADO</span>
                          <span className="btn-subtitle">Aguardando confirmação do vendedor</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={28} />
                        <div className="btn-text">
                          <span className="btn-title">ENVIAR COMPROVANTE AGORA</span>
                          <span className="btn-subtitle">Clique para abrir WhatsApp e enviar o comprovante</span>
                        </div>
                        <ArrowRight size={24} className="btn-arrow" />
                      </>
                    )}
                  </div>
                </button>

                <div className="proof-instruction">
                  <div className="instruction-icon">💡</div>
                  <div className="instruction-text">
                    <strong>Como enviar:</strong> Clique no botão verde acima → Envie a foto/screenshot do comprovante no WhatsApp → Volte para esta página
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code com imagem - PRIORIDADE */}
            <div className="qr-code-section animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="section-header">
                <div className="section-badge">
                  <QrCode size={16} />
                  <span>PAGAMENTO RECOMENDADO</span>
                </div>
                <h2 className="section-title">💳 Pagar com PIX</h2>
                <p className="section-description">
                  Transação instantânea, segura e sem taxas
                </p>
              </div>

              <div className="qr-code-container">
                <div className="qr-code-image-wrapper">
                  <div className="qr-code-image-container">
                    <div className="qr-code-overlay">
                      <QrCode size={40} />
                    </div>
                    <img 
                      src="/qrcode-pix.png"
                      alt="QR Code PIX" 
                      className="qr-code-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23ffffff'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='12' fill='%23000000' text-anchor='middle' dy='.3em'%3EQR CODE%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="qr-code-details">
                    <div className="detail-item highlight">
                      <span className="detail-label">VALOR DO PEDIDO:</span>
                      <span className="detail-value">R$ 18,00</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Chave PIX:</span>
                      <span className="detail-value type-badge">{currentPixType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Destinatário:</span>
                      <span className="detail-value name-badge">{pixName}</span>
                    </div>
                    {bankName && (
                      <div className="detail-item">
                        <span className="detail-label">Banco:</span>
                        <span className="detail-value bank-badge">{bankName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="qr-code-instructions">
                  <div className="instruction-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Abra seu app do banco</h4>
                      <p>Vá até a opção "Pagar com PIX"</p>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Escaneie o código</h4>
                      <p>Use a câmera do celular para escanear</p>
                    </div>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Confirme o pagamento</h4>
                      <p>Verifique os dados e confirme</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chave PIX - Alternativa */}
            <div className="pix-key-card animate-in">
              <div className="card-header">
                <div className="header-content">
                  <Shield size={24} className="key-icon" />
                  <div>
                    <h3 className="key-title">Chave PIX para Copiar</h3>
                    <p className="key-subtitle">Use esta opção se preferir pagar sem QR Code</p>
                  </div>
                </div>
                <button 
                  className={`copy-key-btn ${copied ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copiar Chave</span>
                    </>
                  )}
                </button>
              </div>
              <div className="key-value-container">
                <code className="key-value">{pixKey || 'Chave PIX não configurada'}</code>
                <div className="key-type">
                  <div className="type-tag">{currentPixType}</div>
                  <div className="key-status">
                    <CheckCircle size={14} />
                    <span>Chave verificada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo a passo completo */}
            <div className="complete-steps animate-in">
              <h3 className="steps-title">📋 Passo a Passo Completo</h3>
              <div className="steps-container">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Pague via PIX</h4>
                    <p>Use o QR Code acima ou copie a chave PIX</p>
                  </div>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Salve o comprovante</h4>
                    <p>Tire print ou salve a confirmação do pagamento</p>
                  </div>
                </div>
                <div className="step-arrow">→</div>
                <div className="step highlight-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Envie o comprovante</h4>
                    <p>Clique no botão verde acima para enviar no WhatsApp</p>
                  </div>
                </div>
                <div className="step-arrow">→</div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Aguarde a confirmação</h4>
                    <p>Vendedor confirmará em até 2 horas úteis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop */}
          {!isMobile && (
            <div className="info-sidebar">
              {/* Status do Pedido */}
              <div className="order-status-card animate-in">
                <div className="status-header">
                  <div className="status-title">
                    <Clock size={24} />
                    <h3>Status do Pedido</h3>
                  </div>
                  <div className="order-number">#PED339777347</div>
                </div>
                <div className="status-timeline">
                  <div className={`timeline-step ${!hasSentProof ? 'current' : 'completed'}`}>
                    <div className="step-indicator">
                      <div className="step-icon">
                        {!hasSentProof ? '1' : <Check size={14} />}
                      </div>
                    </div>
                    <div className="step-content">
                      <h4>Pagamento PIX</h4>
                      <p>Realize o pagamento via PIX</p>
                    </div>
                  </div>
                  
                  <div className="timeline-connector"></div>
                  
                  <div className={`timeline-step ${hasSentProof ? 'current' : ''}`}>
                    <div className="step-indicator">
                      <div className="step-icon">
                        {hasSentProof ? <Check size={14} /> : '2'}
                      </div>
                    </div>
                    <div className="step-content">
                      <h4>Enviar Comprovante</h4>
                      <p>{hasSentProof ? '✅ Enviado' : 'Envie o comprovante'}</p>
                    </div>
                  </div>
                  
                  <div className="timeline-connector"></div>
                  
                  <div className="timeline-step">
                    <div className="step-indicator">
                      <div className="step-icon">3</div>
                    </div>
                    <div className="step-content">
                      <h4>Confirmação</h4>
                      <p>Análise do comprovante</p>
                    </div>
                  </div>
                </div>
                
                {/* Resumo do Pedido */}
                <div className="order-summary">
                  <h4>Resumo do Pedido</h4>
                  <div className="summary-item">
                    <span>Subtotal:</span>
                    <span>R$ 15,00</span>
                  </div>
                  <div className="summary-item">
                    <span>Entrega:</span>
                    <span>R$ 3,00</span>
                  </div>
                  <div className="summary-total">
                    <span>Total:</span>
                    <span className="total-value">R$ 18,00</span>
                  </div>
                </div>
              </div>

              {/* Botão de envio de comprovante na sidebar também */}
              <div className="sidebar-proof-card">
                <div className="sidebar-proof-header">
                  <MessageCircle size={20} />
                  <h4>Enviar Comprovante</h4>
                </div>
                <p className="sidebar-proof-text">
                  Lembre-se de enviar o comprovante após o pagamento
                </p>
                <button
                  onClick={handleSendProof}
                  className={`sidebar-proof-btn ${hasSentProof ? 'sent' : ''}`}
                  disabled={hasSentProof}
                >
                  {hasSentProof ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Comprovante Enviado</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Enviar Agora</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informações importantes */}
              <div className="important-info-card">
                <div className="info-header">
                  <AlertCircle size={24} />
                  <h3>Informações Importantes</h3>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <CheckCircle size={16} />
                    <span>PIX é instantâneo e seguro</span>
                  </div>
                  <div className="info-item">
                    <CheckCircle size={16} />
                    <span>Sem taxas adicionais</span>
                  </div>
                  <div className="info-item">
                    <CheckCircle size={16} />
                    <span>Confirmação em até 2 horas</span>
                  </div>
                  <div className="info-item">
                    <CheckCircle size={16} />
                    <span>Suporte via WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Precisa de ajuda? */}
              <div className="help-card">
                <div className="help-header">
                  <AlertCircle size={20} />
                  <h4>Precisa de ajuda?</h4>
                </div>
                <div className="help-content">
                  <p>Entre em contato pelo WhatsApp:</p>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="help-whatsapp"
                  >
                    <MessageCircle size={18} />
                    <span>Falar com o vendedor</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Mobile - Status e Botão Fixo */}
          {isMobile && (
            <div className="mobile-bottom-section">
              {/* Status Móvel */}
              <div className="mobile-status-card">
                <div className="status-header">
                  <Clock size={20} />
                  <h3>Seu Pedido #PED339777347</h3>
                </div>
                <div className="mobile-status-steps">
                  <div className={`status-step ${!hasSentProof ? 'active' : 'completed'}`}>
                    <div className="step-indicator">
                      <div className="step-dot"></div>
                    </div>
                    <div className="step-label">
                      <span>Pagar</span>
                    </div>
                  </div>
                  <div className="step-connector"></div>
                  <div className={`status-step ${hasSentProof ? 'active' : ''}`}>
                    <div className="step-indicator">
                      <div className="step-dot"></div>
                    </div>
                    <div className="step-label">
                      <span>Enviar</span>
                    </div>
                  </div>
                  <div className="step-connector"></div>
                  <div className="status-step">
                    <div className="step-indicator">
                      <div className="step-dot"></div>
                    </div>
                    <div className="step-label">
                      <span>Confirmar</span>
                    </div>
                  </div>
                </div>
                
                <div className="mobile-order-summary">
                  <div className="summary-row">
                    <span>Total:</span>
                    <span className="total-value">R$ 18,00</span>
                  </div>
                </div>
              </div>

              {/* Lembretes Móvel */}
              <div className="mobile-reminders">
                <div className="reminder-item">
                  <AlertCircle size={16} />
                  <span>Pague via PIX usando o QR Code acima</span>
                </div>
                <div className="reminder-item highlight">
                  <MessageCircle size={16} />
                  <span><strong>ENVIE O COMPROVANTE</strong> após o pagamento</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão fixo para mobile - SUPER EVIDENTE */}
      {isMobile && !hasSentProof && (
        <button
          onClick={handleSendProof}
          className="mobile-proof-btn-floating"
        >
          <div className="floating-btn-content">
            <MessageCircle size={28} />
            <div className="floating-btn-text">
              <span className="floating-btn-title">ENVIAR COMPROVANTE</span>
              <span className="floating-btn-subtitle">Clique aqui após pagar</span>
            </div>
            <ArrowRight size={24} className="floating-btn-arrow" />
          </div>
        </button>
      )}

      {/* Botão flutuante desktop */}
      {!isMobile && !hasSentProof && (
        <button
          onClick={handleSendProof}
          className="desktop-floating-btn"
        >
          <div className="floating-btn-content">
            <Send size={20} />
            <span>Enviar Comprovante</span>
          </div>
        </button>
      )}

      <style jsx>{`
        .payment-info-section {
          padding: ${isMobile ? '20px 16px 120px' : '32px 20px 48px'};
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          position: relative;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .error-state {
          text-align: center;
          padding: 60px 20px;
          background: #fef3f2;
          border: 2px dashed #fda29b;
          border-radius: 16px;
          margin: 40px auto;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .error-state p {
          color: #b42318;
          font-size: 18px;
          font-weight: 500;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          width: ${isMobile ? '80px' : '100px'};
          height: ${isMobile ? '80px' : '100px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .payment-title {
          font-size: ${isMobile ? '1.75rem' : '2.5rem'};
          color: #1e293b;
          margin-bottom: 12px;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .payment-subtitle {
          color: #64748b;
          font-size: ${isMobile ? '1rem' : '1.25rem'};
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
          font-weight: 500;
        }

        /* Banner de Status do Comprovante */
        .proof-status-banner {
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: slideDown 0.5s ease-out;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 2px solid #10b981;
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.2);
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .banner-content svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .banner-content h3 {
          color: #065f46;
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .banner-content p {
          color: #065f46;
          margin: 0;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .banner-action {
          background: transparent;
          border: 2px solid #10b981;
          color: #065f46;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          margin-left: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .banner-action:hover {
          background: #10b981;
          color: white;
        }

        .payment-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        @media (min-width: 769px) {
          .payment-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 40px;
          }
        }

        /* Seção principal PIX */
        .pix-section {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Seção de Comprovante - SUPER EVIDENTE */
        .proof-section-main {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-radius: 20px;
          padding: ${isMobile ? '24px 20px' : '32px'};
          border: 3px solid #22c55e;
          box-shadow: 0 20px 40px rgba(34, 197, 94, 0.2);
          position: relative;
          overflow: hidden;
        }

        .proof-section-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #22c55e, #16a34a);
        }

        .proof-header {
          margin-bottom: 24px;
        }

        .proof-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #dc2626;
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.875rem;
          margin-bottom: 16px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .proof-title-main {
          font-size: ${isMobile ? '1.5rem' : '2rem'};
          color: #166534;
          margin-bottom: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .proof-description-main {
          color: #166534;
          font-size: ${isMobile ? '1rem' : '1.25rem'};
          line-height: 1.5;
          margin: 0;
        }

        .proof-actions {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .proof-notes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .proof-note-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          border-left: 4px solid #f59e0b;
        }

        .proof-note-item span {
          color: #92400e;
          font-size: ${isMobile ? '0.9rem' : '1rem'};
          font-weight: 500;
        }

        /* Botão PRINCIPAL - MÁXIMO DESTAQUE */
        .btn-send-proof {
          border: none;
          padding: ${isMobile ? '24px 20px' : '28px 32px'};
          font-weight: 700;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          margin: 0;
          display: block;
          width: 100%;
          transform: translateY(0);
          animation: subtleBounce 3s infinite;
        }

        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        .btn-send-proof.primary {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
        }

        .btn-send-proof.sent {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 5px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-send-proof.primary:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(34, 197, 94, 0.6);
        }

        .btn-send-proof:disabled {
          cursor: not-allowed;
          opacity: 0.9;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .btn-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }

        .btn-title {
          font-size: ${isMobile ? '1.125rem' : '1.5rem'};
          font-weight: 800;
          margin-bottom: 4px;
        }

        .btn-subtitle {
          font-size: ${isMobile ? '0.875rem' : '1rem'};
          opacity: 0.9;
          font-weight: 500;
        }

        .btn-arrow {
          opacity: 0.8;
        }

        .proof-instruction {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          border: 2px dashed #22c55e;
        }

        .instruction-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .instruction-text {
          color: #166534;
          font-size: ${isMobile ? '0.9rem' : '1rem'};
          line-height: 1.5;
        }

        /* QR Code Section */
        .qr-code-section {
          background: white;
          border-radius: 20px;
          padding: ${isMobile ? '24px 20px' : '32px'};
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .section-header {
          margin-bottom: 24px;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.875rem;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: ${isMobile ? '1.5rem' : '2rem'};
          color: #1e293b;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .section-description {
          color: #64748b;
          font-size: ${isMobile ? '1rem' : '1.125rem'};
          margin: 0;
        }

        .qr-code-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .qr-code-image-wrapper {
          display: flex;
          flex-direction: ${isMobile ? 'column' : 'row'};
          align-items: center;
          gap: 24px;
        }

        .qr-code-image-container {
          flex-shrink: 0;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .qr-code-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .qr-code-image-container:hover .qr-code-overlay {
          opacity: 1;
        }

        .qr-code-image {
          width: ${isMobile ? '200px' : '240px'};
          height: ${isMobile ? '200px' : '240px'};
          object-fit: contain;
        }

        .qr-code-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-item.highlight {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 16px;
          border-radius: 12px;
          border: none;
          margin: 8px 0;
        }

        .detail-label {
          color: #64748b;
          font-size: ${isMobile ? '0.875rem' : '1rem'};
          font-weight: 600;
        }

        .detail-value {
          color: #1e293b;
          font-size: ${isMobile ? '0.875rem' : '1rem'};
          font-weight: 700;
          text-align: right;
          word-break: break-word;
        }

        .type-badge, .name-badge, .bank-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .type-badge {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .name-badge {
          background: #dcfce7;
          color: #166534;
        }

        .bank-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .qr-code-instructions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .instruction-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        /* Chave PIX Card */
        .pix-key-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .key-icon {
          color: #10b981;
        }

        .key-title {
          font-size: 1.25rem;
          color: #1e293b;
          margin: 0 0 4px 0;
          font-weight: 700;
        }

        .key-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .copy-key-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .copy-key-btn.copied {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .copy-key-btn:hover:not(.copied) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .key-value-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }

        .key-value {
          color: #1e293b;
          font-size: 0.95rem;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          display: block;
          margin-bottom: 16px;
          line-height: 1.5;
          padding: 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .key-type {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .type-tag {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .key-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #10b981;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Passo a passo completo */
        .complete-steps {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .steps-title {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 24px;
          font-weight: 700;
        }

        .steps-container {
          display: flex;
          flex-direction: ${isMobile ? 'column' : 'row'};
          align-items: center;
          justify-content: space-between;
          gap: ${isMobile ? '16px' : '8px'};
        }

        .step {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          min-width: 0;
        }

        .step.highlight-step {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border: 2px solid #22c55e;
          transform: scale(1.05);
          z-index: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .step-arrow {
          color: #94a3b8;
          font-size: 1.5rem;
          font-weight: 700;
          padding: 0 8px;
        }

        @media (max-width: 768px) {
          .step-arrow {
            display: none;
          }
        }

        /* Botões flutuantes */
        .mobile-proof-btn-floating {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          padding: 20px 24px;
          z-index: 1000;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.4);
          animation: pulseGlow 2s infinite;
          transition: all 0.3s ease;
        }

        @keyframes pulseGlow {
          0%, 100% { 
            box-shadow: 0 10px 40px rgba(34, 197, 94, 0.4);
          }
          50% { 
            box-shadow: 0 10px 40px rgba(34, 197, 94, 0.6);
          }
        }

        .mobile-proof-btn-floating:active {
          transform: scale(0.98);
        }

        .floating-btn-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .floating-btn-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .floating-btn-title {
          font-size: 1.125rem;
          font-weight: 800;
        }

        .floating-btn-subtitle {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .floating-btn-arrow {
          opacity: 0.8;
        }

        .desktop-floating-btn {
          position: fixed;
          bottom: 40px;
          right: 40px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          padding: 16px 24px;
          z-index: 1000;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .desktop-floating-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(34, 197, 94, 0.6);
        }

        /* Estilos mobile */
        .mobile-bottom-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mobile-status-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .mobile-status-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 20px 0;
        }

        .mobile-order-summary {
          padding-top: 16px;
          border-top: 2px solid #f1f5f9;
        }

        .mobile-reminders {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reminder-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .reminder-item.highlight {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
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
      `}</style>
    </div>
  );
};

export default PaymentInfo;