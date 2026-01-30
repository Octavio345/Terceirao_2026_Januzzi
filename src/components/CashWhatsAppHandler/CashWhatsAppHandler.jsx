import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, CheckCircle, ExternalLink, Clock, Home, School, Truck, CreditCard, Wallet } from 'lucide-react';
import './CashWhatsAppHandler.css'

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
    </div>
  );
};

export default CashWhatsAppHandler;