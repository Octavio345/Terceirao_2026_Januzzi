import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, CheckCircle, ExternalLink, Clock } from 'lucide-react';

const CashWhatsAppHandler = ({ orderData, vendorWhatsApp = '5518996349330', onClose }) => {
  const [status, setStatus] = useState('preparing');
  const [countdown, setCountdown] = useState(10);
  const [hasOpened, setHasOpened] = useState(false);
  const countdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Função para gerar a mensagem formatada
  const generateWhatsAppMessage = () => {
    const {
      customerInfo,
      deliveryOption,
      deliveryAddress = {},
      deliveryDate = '',
      subtotal = 0,
      deliveryFee = 0,
      total = 0,
      cashAmount = 0,
      cashChange = 0,
      items = []
    } = orderData;

    // Formatar nome com primeira letra maiúscula
    const formatName = (name) => {
      return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Formatar telefone
    const formatPhone = (phone) => {
      const digits = phone.replace(/\D/g, '');
      return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    };

    // Formatar valor em reais
    const formatBRL = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Itens do pedido
    const itemsText = items.map(item => {
      const itemTotal = item.price * item.quantity;
      return `• ${item.quantity}x ${item.name} - ${formatBRL(itemTotal)}`;
    }).join('\n');

    // Dados do cliente
    const customerText = `👤 *DADOS DO CLIENTE*\n` +
      `└── Nome: ${formatName(customerInfo.name)}\n` +
      `└── Telefone: ${formatPhone(customerInfo.phone)}\n` +
      (customerInfo.email ? `└── Email: ${customerInfo.email}\n` : '');

    // Informações de entrega
    let deliveryText = '';
    if (deliveryOption === 'retirada') {
      deliveryText = `🏫 *RETIRADA NA ESCOLA*\n` +
        `📍 Local: E.E. Prof. Oswaldo Januzzi\n\n` +
        `⏰ *HORÁRIOS DISPONÍVEIS:*\n` +
        `• MANHÃ: 09:30-09:45 ou 11:25-12:25\n` +
        `• TARDE: 15:55-16:10 ou 18:40-19:40\n`;
    } else {
      deliveryText = `🚚 *ENTREGA A DOMICÍLIO*\n` +
        `📍 Endereço: ${deliveryAddress.street}, ${deliveryAddress.number}\n` +
        (deliveryAddress.complement ? `└── Complemento: ${deliveryAddress.complement}\n` : '') +
        `└── Bairro: ${deliveryAddress.neighborhood}\n` +
        (deliveryAddress.reference ? `└── Referência: ${deliveryAddress.reference}\n` : '') +
        `💰 Taxa de entrega: ${formatBRL(deliveryFee)}\n` +
        `📅 Previsão: ${deliveryDate || 'Próximo dia útil'}\n`;
    }

    // Informações de pagamento
    const paymentText = `💵 *PAGAMENTO EM DINHEIRO*\n` +
      `💰 Valor total: ${formatBRL(total)}\n` +
      `💸 Valor em dinheiro: ${formatBRL(cashAmount)}\n` +
      (cashChange > 0 
        ? `🔄 Troco necessário: ${formatBRL(cashChange)}\n` 
        : `✅ Valor exato (sem troco)\n`);

    // Resumo financeiro
    const summaryText = `💰 *RESUMO FINANCEIRO*\n` +
      `└── Subtotal: ${formatBRL(subtotal)}\n` +
      (deliveryOption === 'entrega' ? `└── Taxa de entrega: ${formatBRL(deliveryFee)}\n` : '') +
      `└── Total: ${formatBRL(total)}\n`;

    // Montar mensagem final
    const message = `🎓 *PEDIDO - TERCEIRÃO 2026*\n\n` +
      customerText + '\n' +
      deliveryText + '\n' +
      paymentText + '\n' +
      `🛒 *ITENS DO PEDIDO*\n${itemsText}\n\n` +
      summaryText + '\n' +
      `⏰ Data/hora: ${new Date().toLocaleString('pt-BR')}\n\n` +
      `📋 *MENSAGEM AUTOMÁTICA*\n` +
      `Olá! 😊\n\n` +
      `Estou confirmando meu pedido para pagamento em dinheiro.\n` +
      `Estarei com ${formatBRL(cashAmount)} para pagar na ${deliveryOption === 'retirada' ? 'retirada' : 'entrega'}.\n\n` +
      `Aguardo a confirmação! 🙏\n\n` +
      `📞 *CONTATO*\n` +
      `Vendedor: Terceirão 2026\n` +
      `WhatsApp: (18) 99634-9330`;

    return message;
  };

  // Função para enviar para WhatsApp
  const sendToWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${vendorWhatsApp}?text=${encodedMessage}`;
    
    setStatus('opening');
    
    const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setHasOpened(true);
    
    setTimeout(() => {
      if (newWindow) {
        setStatus('opened');
      } else {
        setStatus('failed');
      }
    }, 1000);
    
    return true;
  };

  // Countdown automático
  useEffect(() => {
    if (status === 'preparing' && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            sendToWhatsApp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [status, countdown]);

  // Fecha automaticamente após 30 segundos
  useEffect(() => {
    if (hasOpened) {
      timeoutRef.current = setTimeout(() => {
        if (onClose) onClose();
      }, 30000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasOpened, onClose]);

  // Função para voltar manualmente
  const handleBackToSite = () => {
    if (onClose) onClose();
  };

  // Componente de resumo do pedido
  const OrderSummary = () => {
    const { customerInfo, total, cashAmount, cashChange, deliveryOption, items = [] } = orderData;
    const { name, phone } = customerInfo || {};

    const formatBRL = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    return (
      <div className="order-summary">
        <h3>📋 Resumo do seu pedido:</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">👤 Cliente:</span>
            <span className="summary-value">{name || 'Não informado'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">📱 Telefone:</span>
            <span className="summary-value">{phone || 'Não informado'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🎯 Total:</span>
            <span className="summary-value total">{formatBRL(total)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">💵 Valor em dinheiro:</span>
            <span className="summary-value cash">{formatBRL(cashAmount)}</span>
          </div>
          {cashChange > 0 && (
            <div className="summary-item">
              <span className="summary-label">🔄 Troco necessário:</span>
              <span className="summary-value change">{formatBRL(cashChange)}</span>
            </div>
          )}
          <div className="summary-item">
            <span className="summary-label">
              {deliveryOption === 'retirada' ? '🏫' : '🚚'} Entrega:
            </span>
            <span className="summary-value">
              {deliveryOption === 'retirada' ? 'Retirada na escola' : 'Entrega em casa'}
            </span>
          </div>
          <div className="summary-item items">
            <span className="summary-label">🛒 Itens ({items.length || 0}):</span>
            <div className="items-list">
              {items.slice(0, 3).map((item, index) => (
                <div key={index} className="item-preview">
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatBRL(item.price * item.quantity)}</span>
                </div>
              ))}
              {items.length > 3 && (
                <div className="more-items">
                  + {items.length - 3} {items.length - 3 === 1 ? 'outro item' : 'outros itens'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="whatsapp-redirect-container">
      <div className="whatsapp-redirect-content">
        {/* Status: Preparando */}
        {status === 'preparing' && (
          <>
            <div className="status-icon preparing">
              <Clock size={64} />
            </div>
            <h2 className="whatsapp-title">⏱️ Preparando sua mensagem...</h2>
            <p className="whatsapp-message">
              Seu pedido em dinheiro está sendo preparado para enviar ao WhatsApp.
              <br />
              <strong>Abrindo em: {countdown} segundos</strong>
            </p>
            
            <div className="countdown-circle">
              <div className="countdown-text">{countdown}</div>
            </div>

            <OrderSummary />

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={sendToWhatsApp}
              >
                <MessageCircle size={24} />
                <span>Abrir WhatsApp Agora</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleBackToSite}
              >
                <ArrowLeft size={24} />
                <span>Voltar ao Site</span>
              </button>
            </div>
          </>
        )}

        {/* Status: Abrindo */}
        {status === 'opening' && (
          <>
            <div className="status-icon opening">
              <MessageCircle size={64} />
            </div>
            <h2 className="whatsapp-title">🔗 Abrindo WhatsApp...</h2>
            <p className="whatsapp-message">
              Estamos abrindo o WhatsApp em uma nova aba.
              <br />
              Se não abrir automaticamente, clique no botão abaixo.
            </p>

            <OrderSummary />

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={sendToWhatsApp}
              >
                <ExternalLink size={24} />
                <span>Tentar Novamente</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleBackToSite}
              >
                <ArrowLeft size={24} />
                <span>Voltar ao Site</span>
              </button>
            </div>
          </>
        )}

        {/* Status: Aberto */}
        {status === 'opened' && (
          <>
            <div className="status-icon success">
              <CheckCircle size={64} />
            </div>
            <h2 className="whatsapp-title">✅ WhatsApp Aberto!</h2>
            <p className="whatsapp-message">
              Seu pedido foi enviado para o WhatsApp com sucesso.
              <br />
              <strong>Você pode editar a mensagem antes de enviar.</strong>
            </p>
            
            <div className="success-notice">
              <div className="notice-icon">💡</div>
              <p>
                <strong>Dica:</strong> Revise os dados e adicione qualquer informação adicional antes de enviar.
              </p>
            </div>

            <OrderSummary />

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={sendToWhatsApp}
              >
                <MessageCircle size={24} />
                <span>Reabrir WhatsApp</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleBackToSite}
              >
                <ArrowLeft size={24} />
                <span>Voltar ao Site</span>
              </button>
            </div>
            
            <div className="auto-close-notice">
              <Clock size={16} />
              <span>Esta tela fechará automaticamente em alguns segundos...</span>
            </div>
          </>
        )}

        {/* Status: Falha */}
        {status === 'failed' && (
          <>
            <div className="status-icon failed">
              <span className="emoji-icon">❌</span>
            </div>
            <h2 className="whatsapp-title">⚠️ Não foi possível abrir</h2>
            <p className="whatsapp-message">
              O WhatsApp não pôde ser aberto automaticamente.
              <br />
              Isso pode acontecer se o navegador bloquear pop-ups.
            </p>

            <div className="troubleshooting">
              <h4>📝 Soluções possíveis:</h4>
              <ol className="steps">
                <li>Permita pop-ups neste site</li>
                <li>Copie o texto abaixo e cole no WhatsApp</li>
                <li>Use o botão "Copiar Mensagem"</li>
              </ol>
            </div>

            <div className="message-preview">
              <h4>📋 Mensagem do Pedido:</h4>
              <div className="message-content">
                {generateWhatsAppMessage()}
              </div>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => {
                  navigator.clipboard.writeText(generateWhatsAppMessage());
                  alert('✅ Mensagem copiada para a área de transferência!');
                }}
              >
                📋 Copiar Mensagem
              </button>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={sendToWhatsApp}
              >
                <MessageCircle size={24} />
                <span>Tentar Novamente</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleBackToSite}
              >
                <ArrowLeft size={24} />
                <span>Voltar ao Site</span>
              </button>
            </div>
          </>
        )}

        {/* Nota importante */}
        <div className="whatsapp-note">
          <div className="note-icon">💬</div>
          <div className="note-content">
            <p>
              <strong>Importante:</strong> Esta mensagem será aberta no WhatsApp Web ou App.
              Você pode revisar e editar antes de enviar para o vendedor.
            </p>
            <p className="small">
              ⚠️ Certifique-se de que os dados estão corretos antes de enviar.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .whatsapp-redirect-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
          padding: 20px;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .whatsapp-redirect-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Status Icons */
        .status-icon {
          margin: 0 auto 30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }

        .status-icon.preparing {
          background: rgba(245, 158, 11, 0.1);
          color: #F59E0B;
        }

        .status-icon.opening {
          background: rgba(37, 211, 102, 0.1);
          color: #25D366;
        }

        .status-icon.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
        }

        .status-icon.failed {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          font-size: 48px;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .emoji-icon {
          font-size: 64px;
          line-height: 1;
        }

        /* Countdown Circle */
        .countdown-circle {
          width: 100px;
          height: 100px;
          margin: 30px auto;
          border-radius: 50%;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .countdown-circle::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          border: 3px solid rgba(37, 211, 102, 0.3);
          animation: pulse 1.5s infinite;
        }

        .countdown-text {
          font-size: 36px;
          font-weight: 800;
          color: white;
        }

        /* Titles and Messages */
        .whatsapp-title {
          color: #075E54;
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 800;
        }

        .whatsapp-message {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 30px;
        }

        /* Order Summary */
        .order-summary {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          text-align: left;
          border: 2px solid #E2E8F0;
        }

        .order-summary h3 {
          color: #1A1C2E;
          margin: 0 0 15px 0;
          font-size: 18px;
          font-weight: 700;
        }

        .summary-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #E2E8F0;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-item.items {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .summary-label {
          color: #64748B;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .summary-value {
          color: #1A1C2E;
          font-weight: 700;
          font-size: 14px;
          text-align: right;
        }

        .summary-value.total {
          color: #10B981;
        }

        .summary-value.cash {
          color: #9333EA;
        }

        .summary-value.change {
          color: #F59E0B;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 13px;
        }

        .item-preview span:first-child {
          color: #475569;
        }

        .item-preview span:last-child {
          color: #1A1C2E;
          font-weight: 600;
        }

        .more-items {
          font-size: 12px;
          color: #94A3B8;
          font-style: italic;
          text-align: center;
          padding: 4px;
          background: rgba(148, 163, 184, 0.1);
          border-radius: 4px;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          width: 100%;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .btn-large {
          padding: 18px 28px;
          font-size: 18px;
        }

        .btn-small {
          padding: 10px 16px;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(37, 211, 102, 0.4);
        }

        .btn-secondary {
          background: #F1F5F9;
          color: #475569;
          border: 2px solid #E2E8F0;
        }

        .btn-secondary:hover {
          background: #E2E8F0;
          transform: translateY(-2px);
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 30px 0;
        }

        /* Notices */
        .success-notice {
          display: flex;
          gap: 15px;
          padding: 15px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
          border-left: 4px solid #10B981;
          margin: 20px 0;
          text-align: left;
        }

        .notice-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .success-notice p {
          margin: 0;
          font-size: 14px;
          color: #065F46;
          line-height: 1.4;
        }

        .auto-close-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          color: #64748B;
          font-size: 14px;
          margin-top: 20px;
          padding: 12px;
          background: #F8FAFC;
          border-radius: 8px;
        }

        /* Troubleshooting */
        .troubleshooting {
          text-align: left;
          margin: 20px 0;
          padding: 20px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 10px;
          border-left: 4px solid #F59E0B;
        }

        .troubleshooting h4 {
          color: #92400E;
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        .steps {
          margin: 0;
          padding-left: 20px;
          color: #92400E;
        }

        .steps li {
          margin-bottom: 5px;
          font-size: 14px;
        }

        /* Message Preview */
        .message-preview {
          text-align: left;
          margin: 20px 0;
        }

        .message-preview h4 {
          color: #1A1C2E;
          margin: 0 0 10px 0;
          font-size: 16px;
        }

        .message-content {
          background: #1A1C2E;
          color: #E2E8F0;
          padding: 15px;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'Monaco', 'Courier New', monospace;
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        /* Note */
        .whatsapp-note {
          display: flex;
          gap: 15px;
          padding: 20px;
          background: #FFFBEB;
          border-radius: 10px;
          border-left: 4px solid #F59E0B;
          margin-top: 30px;
          text-align: left;
        }

        .note-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .note-content {
          flex: 1;
        }

        .note-content p {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #92400E;
          line-height: 1.4;
        }

        .note-content p.small {
          font-size: 12px;
          color: #B45309;
          margin-bottom: 0;
        }

        /* Mobile Optimizations */
        @media (max-width: 480px) {
          .whatsapp-redirect-content {
            padding: 25px 20px;
            margin: 10px;
          }

          .whatsapp-title {
            font-size: 24px;
          }

          .whatsapp-message {
            font-size: 15px;
          }

          .status-icon {
            width: 80px;
            height: 80px;
          }

          .status-icon svg {
            width: 40px;
            height: 40px;
          }

          .emoji-icon {
            font-size: 40px;
          }

          .countdown-circle {
            width: 80px;
            height: 80px;
          }

          .countdown-text {
            font-size: 28px;
          }

          .order-summary {
            padding: 15px;
          }

          .btn {
            padding: 14px 20px;
            font-size: 15px;
          }

          .btn-large {
            padding: 16px 24px;
            font-size: 16px;
          }

          .message-content {
            font-size: 11px;
            max-height: 150px;
          }
        }

        @media (max-width: 360px) {
          .whatsapp-redirect-content {
            padding: 20px 15px;
          }

          .whatsapp-title {
            font-size: 22px;
          }

          .summary-label,
          .summary-value {
            font-size: 13px;
          }

          .item-preview {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CashWhatsAppHandler;