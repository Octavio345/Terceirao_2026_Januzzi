import React, { useState, useEffect } from 'react';
import { Copy, QrCode, Smartphone, CreditCard, AlertCircle, Shield, Zap, Clock, CheckCircle, MessageCircle, ArrowRight, Check, Send } from 'lucide-react';

import './PaymentInfo.css';
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
    </div>
  );
};

export default PaymentInfo;