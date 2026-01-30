import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Copy, Check, QrCode, Smartphone, Banknote, Shield, Clock, 
  Download, X, Wallet, CreditCard, Calculator, DollarSign 
} from 'lucide-react'; // Adicionei DollarSign aqui
import { useCart } from '../../context/CartContext';
import QRCodeGenerator from '../QRCodeGenerator/QRCodeGenerator';
import './Payment.css'

const Payment = () => {
  const { 
    currentOrder, 
    vendorInfo, 
    showPayment,
    setShowPayment,
    closePaymentOnly
  } = useCart();
  
  const [copied, setCopied] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // Função para fechar o modal usando useCallback para evitar dependências cíclicas
  const handleCloseModal = useCallback(() => {
    console.log('Fechando modal de pagamento...');
    
    if (typeof closePaymentOnly === 'function') {
      closePaymentOnly();
    } else if (typeof setShowPayment === 'function') {
      setShowPayment(false);
    }
    
    setTimeout(() => {
      const modal = document.querySelector('.payment-overlay');
      if (modal) {
        modal.style.display = 'none';
      }
      document.body.style.overflow = 'auto';
    }, 10);
  }, [closePaymentOnly, setShowPayment]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showPayment) {
        console.log('ESC pressionado - fechando pagamento');
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPayment, handleCloseModal]);

  // Focar no modal quando abrir
  useEffect(() => {
    if (showPayment && modalRef.current) {
      modalRef.current.focus();
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPayment]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('payment-overlay')) {
      console.log('Clicou no overlay - fechando');
      handleCloseModal();
    }
  };

  // Se não tiver pedido ou não estiver mostrando pagamento, não renderiza
  if (!currentOrder || !showPayment) {
    console.log('Não renderizando Payment - currentOrder:', currentOrder, 'showPayment:', showPayment);
    return null;
  }

  console.log('Renderizando Payment com pedido:', currentOrder.id);

  const handleCopyPixKey = () => {
    if (!vendorInfo?.pixKey) {
      console.error('Chave PIX não disponível');
      return;
    }
    
    navigator.clipboard.writeText(vendorInfo.pixKey)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
      });
  };

  const generateWhatsAppMessage = () => {
    if (!vendorInfo?.whatsapp) {
      console.error('WhatsApp não configurado');
      return '#';
    }
    
    const phone = vendorInfo.whatsapp.replace(/\D/g, '');
    
    const deliveryOption = currentOrder.deliveryOption || 'retirada';
    const deliveryAddress = currentOrder.deliveryAddress || null;
    const deliveryDate = currentOrder.deliveryDate || null;
    const paymentMethod = currentOrder.paymentMethod || 'pix';
    const cashAmount = currentOrder.cashAmount || null;
    const cashChange = currentOrder.cashChange || 0;
    
    // CORREÇÃO: Usar emojis compatíveis com WhatsApp
    let message = `*📋 ${paymentMethod === 'pix' ? 'ENVIAR COMPROVANTE PIX' : 'CONFIRMAR PAGAMENTO EM DINHEIRO'}*\n\n`;
    
    // Informações básicas
    message += `*🧾 PEDIDO:* ${currentOrder.id}\n`;
    message += `*👤 CLIENTE:* ${currentOrder.customer?.name || 'Não informado'}\n`;
    message += `*💰 VALOR PAGO:* R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`;
    
    // Informações de pagamento
    message += `*💳 INFORMAÇÕES DE PAGAMENTO*\n`;
    if (paymentMethod === 'pix') {
      message += `*🔑 FORMA DE PAGAMENTO:* PIX\n`;
      message += `*💰 VALOR:* R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n`;
      message += `*📱 CHAVE PIX:* ${vendorInfo?.pixKey || 'Será enviada após confirmação'}\n`;
    } else {
      message += `*💵 FORMA DE PAGAMENTO:* DINHEIRO\n`;
      message += `*💰 VALOR A PAGAR:* R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n`;
      if (cashAmount) {
        message += `*💸 VALOR INFORMADO:* R$ ${cashAmount.toFixed(2)}\n`;
        if (cashChange > 0) {
          message += `*🔄 TROCO NECESSÁRIO:* R$ ${cashChange.toFixed(2)}\n`;
        } else {
          message += `*✅ VALOR EXATO - SEM TROCO*\n`;
        }
      }
      message += `*📝 OBS:* Pagamento será realizado na ${deliveryOption === 'retirada' ? 'retirada' : 'entrega'}\n`;
    }
    message += `\n`;
    
    // Informações de entrega/retirada
    message += `*📦 INFORMAÇÕES DE ENTREGA*\n`;
    
    if (deliveryOption === 'retirada') {
      message += `*🏫 TIPO:* Retirada na Escola\n`;
      message += `*📍 LOCAL:* Escola Estadual\n`;
      message += `*⏰ HORÁRIO:* Combinar via WhatsApp\n\n`;
    } else {
      message += `*🚚 TIPO:* Entrega a Domicílio\n`;
      message += `*💰 TAXA DE ENTREGA:* R$ 3,00 (já incluída no valor)\n`;
      
      // Aviso importante sobre prazo de entrega
      message += `*⚠️ IMPORTANTE:* Pedidos com entrega devem ser feitos com pelo menos 1 dia de antecedência.\n`;
      message += `*📅 ENTREGA:* A entrega será realizada no dia seguinte ao pagamento confirmado.\n`;
      
      if (deliveryDate) {
        message += `*📅 PREVISÃO DE ENTREGA:* ${deliveryDate}\n`;
      }
      
      if (deliveryAddress) {
        message += `*📍 ENDEREÇO:*\n`;
        message += `• ${deliveryAddress.street || ''}, ${deliveryAddress.number || ''}\n`;
        if (deliveryAddress.complement) {
          message += `• Complemento: ${deliveryAddress.complement}\n`;
        }
        message += `• Bairro: ${deliveryAddress.neighborhood || ''}\n`;
        if (deliveryAddress.reference) {
          message += `• Ponto de referência: ${deliveryAddress.reference}\n`;
        }
        message += `• Buritama/SP\n`;
      } else {
        message += `*📍 ENDEREÇO:* Informado durante o pedido\n`;
      }
      message += `\n`;
    }
    
    // Itens do pedido
    message += `*🛒 ITENS DO PEDIDO:*\n`;
    if (currentOrder.items && currentOrder.items.length > 0) {
      currentOrder.items.forEach((item, index) => {
        if (index < 5) {
          message += `• ${item.quantity || 1}x ${item.name || 'Produto'}\n`;
        }
      });
      if (currentOrder.items.length > 5) {
        message += `• ... e mais ${currentOrder.items.length - 5} itens\n`;
      }
    } else {
      message += `• Nenhum item listado\n`;
    }
    
    message += `\n`;
    
    // Valor total (incluindo taxa de entrega se houver)
    const totalText = deliveryOption === 'entrega' 
      ? `*Subtotal:* R$ ${currentOrder.subtotal?.toFixed(2) || (currentOrder.total - 3).toFixed(2)}\n*Taxa de entrega:* R$ 3,00\n*TOTAL:* R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`
      : `*TOTAL:* R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`;
    
    message += totalText;
    
    // Instrução para anexar comprovante ou confirmar pagamento
    if (paymentMethod === 'pix') {
      message += `*📎 ANEXE A FOTO DO COMPROVANTE PIX*`;
    } else {
      message += `*💵 CONFIRMAÇÃO DE PAGAMENTO EM DINHEIRO*\n`;
      message += `Por favor, confirme que está com o valor correto para ${deliveryOption === 'retirada' ? 'retirada' : 'entrega'}`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleOpenWhatsApp = () => {
    setLoading(true);
    const url = generateWhatsAppMessage();
    
    if (url === '#') {
      alert('Erro: WhatsApp não configurado');
      setLoading(false);
      return;
    }
    
    window.open(url, '_blank');
    
    setTimeout(() => {
      setLoading(false);
      handleCloseModal();
    }, 1000);
  };

  const handleDownloadReceipt = () => {
    const deliveryOption = currentOrder.deliveryOption || 'retirada';
    const deliveryAddress = currentOrder.deliveryAddress || null;
    const deliveryDate = currentOrder.deliveryDate || null;
    const paymentMethod = currentOrder.paymentMethod || 'pix';
    const cashAmount = currentOrder.cashAmount || null;
    const cashChange = currentOrder.cashChange || 0;
    
    const receiptText = `
🎓 COMPROVANTE DE PEDIDO - TERCEIRÃO 2026
==========================================

Pedido #${currentOrder.id}
Data: ${currentOrder.date}

DADOS DO CLIENTE:
Nome: ${currentOrder.customer?.name || 'Não informado'}
Telefone: ${currentOrder.customer?.phone || 'Não informado'}
Email: ${currentOrder.customer?.email || 'Não informado'}

INFORMAÇÕES DE PAGAMENTO:
${paymentMethod === 'pix' ? 
  `Forma de pagamento: PIX
Valor: R$ ${currentOrder.total?.toFixed(2) || '0.00'}
Chave PIX: ${vendorInfo?.pixKey || 'Será enviada após confirmação'}` : 
  `Forma de pagamento: DINHEIRO
Valor a pagar: R$ ${currentOrder.total?.toFixed(2) || '0.00'}
${cashAmount ? `Valor informado: R$ ${cashAmount.toFixed(2)}
${cashChange > 0 ? `Troco necessário: R$ ${cashChange.toFixed(2)}` : 'Valor exato - Sem troco'}` : 'Valor será informado no momento'}
Pagamento será realizado na ${deliveryOption === 'retirada' ? 'retirada' : 'entrega'}`}

INFORMAÇÕES DE ENTREGA:
${deliveryOption === 'retirada' ? 
  `Tipo: Retirada na Escola
Local: Escola Estadual
Horário: Combinar via WhatsApp` : 
  `Tipo: Entrega a Domicílio
${deliveryAddress ? `Endereço: ${deliveryAddress.street || ''}, ${deliveryAddress.number || ''}
${deliveryAddress.complement ? `Complemento: ${deliveryAddress.complement}\n` : ''}Bairro: ${deliveryAddress.neighborhood || ''}
${deliveryAddress.reference ? `Referência: ${deliveryAddress.reference}\n` : ''}` : 'Endereço: Informado durante o pedido\n'}
${deliveryDate ? `Previsão de entrega: ${deliveryDate}\n` : ''}
⚠️ IMPORTANTE: Pedidos com entrega devem ser feitos com pelo menos 1 dia de antecedência.
A entrega será realizada no dia seguinte ao pagamento confirmado.
Taxa de entrega: R$ 3,00`}

ITENS DO PEDIDO:
${currentOrder.items?.map(item => 
  `• ${item.quantity || 1}x ${item.name || 'Produto'} - R$ ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
).join('\n') || '• Nenhum item listado'}

${deliveryOption === 'entrega' ? `
RESUMO FINANCEIRO:
Subtotal: R$ ${currentOrder.subtotal?.toFixed(2) || (currentOrder.total - 3).toFixed(2)}
Taxa de entrega: R$ 3,00
TOTAL: R$ ${currentOrder.total?.toFixed(2) || '0.00'}` : `
TOTAL: R$ ${currentOrder.total?.toFixed(2) || '0.00'}`}

${paymentMethod === 'pix' ? `
DADOS PARA PAGAMENTO PIX:
Chave PIX: ${vendorInfo?.pixKey || 'Não configurada'}
Nome: ${vendorInfo?.pixName || 'Não configurado'}
Banco: ${vendorInfo?.bankName || 'Não configurado'}
Valor: R$ ${currentOrder.total?.toFixed(2) || '0.00'}

INSTRUÇÕES:
1. Faça o pagamento via PIX usando os dados acima
2. Tire uma foto do comprovante
3. Clique em "Enviar Comprovante"
4. Anexe a foto no WhatsApp que abrir
5. Aguarde a confirmação (1-2 horas úteis)` : `
INSTRUÇÕES PARA PAGAMENTO EM DINHEIRO:
1. Prepare o valor de R$ ${currentOrder.total?.toFixed(2) || '0.00'} em dinheiro
${cashAmount ? `2. Você informou que pagará com: R$ ${cashAmount.toFixed(2)}\n${cashChange > 0 ? `3. Prepare troco de: R$ ${cashChange.toFixed(2)}` : '3. Valor exato - sem troco necessário'}` : '2. Informe o valor que pagará quando receber o pedido'}
4. O pagamento será realizado no momento da ${deliveryOption === 'retirada' ? 'retirada' : 'entrega'}
5. Aguarde a confirmação do agendamento`}

==========================================
Guarde este comprovante para referência.
    `;

    try {
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pedido_${currentOrder.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
      alert('Erro ao baixar comprovante. Tente novamente.');
    }
  };

  const deliveryOption = currentOrder.deliveryOption || 'retirada';
  const deliveryAddress = currentOrder.deliveryAddress || null;
  const deliveryDate = currentOrder.deliveryDate || null;
  const paymentMethod = currentOrder.paymentMethod || 'pix';
  const cashAmount = currentOrder.cashAmount || null;
  const cashChange = currentOrder.cashChange || 0;

  // Formatar data para exibição
  const formatDeliveryDate = (dateString) => {
    if (!dateString) return null;
    return dateString;
  };

  return (
    <div 
      className="payment-overlay" 
      onClick={handleOverlayClick}
      ref={modalRef}
      tabIndex="-1"
      style={{ display: 'flex' }}
    >
      <div className="payment-container" onClick={e => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="payment-header">
          <div className="header-content">
            <h2 className="payment-title">
              {paymentMethod === 'pix' ? 'Pagamento via PIX' : 'Pagamento em Dinheiro'}
            </h2>
            <p className="payment-subtitle">Pedido #{currentOrder.id} • R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
            <p className="delivery-info-preview">
              📦 {deliveryOption === 'retirada' ? 'Retirada na Escola' : `Entrega a Domicílio (+R$ 3,00)`}
              {deliveryOption === 'entrega' && deliveryAddress && deliveryAddress.neighborhood && (
                <span> • {deliveryAddress.neighborhood}</span>
              )}
            </p>
          </div>
          <button 
            className="close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('Botão X clicado');
              handleCloseModal();
            }}
            aria-label="Fechar"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Aviso sobre entrega */}
        {deliveryOption === 'entrega' && (
          <div className="delivery-notice">
            <div className="notice-icon">⚠️</div>
            <div className="notice-content">
              <strong>Pedidos com entrega:</strong> Devem ser feitos com pelo menos 1 dia de antecedência. 
              A entrega será realizada no dia seguinte ao pagamento confirmado.
              {deliveryDate && (
                <span className="delivery-date-info">
                  Previsão de entrega: <strong>{formatDeliveryDate(deliveryDate)}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        <div className="payment-content">
          {/* Etapas */}
          <div className="steps-container">
            <div className="step active">
              <div className="step-icon">1</div>
              <div className="step-text">
                <h4>{paymentMethod === 'pix' ? 'Copie os dados PIX' : 'Verifique o valor'}</h4>
                <p>{paymentMethod === 'pix' ? 'Use a chave abaixo para pagar' : 'Confirme o valor total'}</p>
              </div>
            </div>
            
            <div className="step-line"></div>
            
            <div className={`step ${showProofForm ? 'active' : ''}`}>
              <div className="step-icon">2</div>
              <div className="step-text">
                <h4>{paymentMethod === 'pix' ? 'Faça o pagamento' : 'Prepare o dinheiro'}</h4>
                <p>{paymentMethod === 'pix' ? 'Use seu app de banco' : 'Com troco se necessário'}</p>
              </div>
            </div>
            
            <div className="step-line"></div>
            
            <div className="step">
              <div className="step-icon">3</div>
              <div className="step-text">
                <h4>{paymentMethod === 'pix' ? 'Envie comprovante' : 'Confirme pagamento'}</h4>
                <p>{paymentMethod === 'pix' ? 'Confirme o pagamento' : 'Aguarde a entrega'}</p>
              </div>
            </div>
          </div>

          {/* Seção de Pagamento - PIX ou Dinheiro */}
          {paymentMethod === 'pix' ? (
            <div className="pix-section">
              <div className="pix-header">
                <QrCode size={24} />
                <h3>Pagamento Instantâneo PIX</h3>
              </div>
              
              <div className="qr-code-container">
                {/* QR Code REAL */}
                <div className="qr-code-real-container">
                  <div className="qr-code-wrapper">
                    <QRCodeGenerator 
                      pixKey={vendorInfo?.pixKey || ''}
                      amount={currentOrder.total?.toString() || '0'}
                      name={vendorInfo?.pixName || ''}
                    />
                  </div>
                  <div className="qr-code-info">
                    <p className="qr-code-amount">R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
                    <p className="qr-code-name">{vendorInfo?.pixName || 'Vendedor'}</p>
                    <p className="qr-code-hint">Escaneie com seu app bancário</p>
                  </div>
                </div>
                
                <div className="pix-instructions">
                  <p className="instruction-title">Como pagar:</p>
                  <ol className="instruction-list">
                    <li>Abra o app do seu banco</li>
                    <li>Acesse a função PIX</li>
                    <li>Escolha "Pix Copia e Cola"</li>
                    <li>Cole a chave abaixo</li>
                    <li>Confirme o pagamento</li>
                  </ol>
                  
                  <div className="scan-instruction">
                    <QrCode size={16} />
                    <span>Ou escaneie o QR Code acima</span>
                  </div>
                </div>
              </div>

              {/* Chave PIX */}
              <div className="pix-key-container">
                <div className="pix-key-header">
                  <Smartphone size={20} />
                  <span>Chave PIX (copia e cola)</span>
                </div>
                
                <div className="pix-key-wrapper">
                  <code className="pix-key">{vendorInfo?.pixKey || 'Chave PIX não configurada'}</code>
                  <button 
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopyPixKey}
                    type="button"
                    disabled={!vendorInfo?.pixKey}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                
                <div className="pix-details">
                  <div className="detail">
                    <Banknote size={16} />
                    <span>Valor: <strong>R$ {currentOrder.total?.toFixed(2) || '0.00'}</strong></span>
                  </div>
                  <div className="detail">
                    <Shield size={16} />
                    <span>Destinatário: <strong>{vendorInfo?.pixName || 'Vendedor'}</strong></span>
                  </div>
                  <div className="detail">
                    <Banknote size={16} />
                    <span>Banco: <strong>{vendorInfo?.bankName || 'Banco'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="cash-payment-section">
              <div className="cash-header">
                <Wallet size={24} />
                <h3>Pagamento em Dinheiro</h3>
              </div>
              
              <div className="cash-details-container">
                <div className="cash-detail-card">
                  <div className="cash-detail-header">
                    <Calculator size={20} />
                    <h4>Detalhes do Pagamento</h4>
                  </div>
                  
                  <div className="cash-detail-content">
                    <div className="cash-detail-item">
                      <div className="cash-detail-label">
                        <DollarSign size={16} /> {/* CORRIGIDO: Agora DollarSign está importado */}
                        <span>Valor a pagar:</span>
                      </div>
                      <div className="cash-detail-value total">R$ {currentOrder.total?.toFixed(2)}</div>
                    </div>
                    
                    {cashAmount && (
                      <>
                        <div className="cash-detail-item">
                          <div className="cash-detail-label">
                            <Wallet size={16} />
                            <span>Valor informado:</span>
                          </div>
                          <div className="cash-detail-value given">R$ {cashAmount.toFixed(2)}</div>
                        </div>
                        
                        <div className="cash-detail-item change">
                          <div className="cash-detail-label">
                            <Calculator size={16} />
                            <span>Troco necessário:</span>
                          </div>
                          <div className="cash-detail-value change">
                            {cashChange > 0 ? `R$ ${cashChange.toFixed(2)}` : '✅ Valor exato'}
                          </div>
                        </div>
                        
                        <div className="cash-instruction-box">
                          <div className="instruction-icon">💵</div>
                          <div className="instruction-text">
                            <strong>Prepare o valor em dinheiro:</strong>
                            <p>Tenha R$ {cashAmount.toFixed(2)} pronto para o pagamento na {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}</p>
                            {cashChange > 0 && (
                              <p className="change-instruction">O vendedor precisará ter R$ {cashChange.toFixed(2)} de troco</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {!cashAmount && (
                      <div className="cash-no-amount-info">
                        <div className="no-amount-icon">ℹ️</div>
                        <div className="no-amount-text">
                          <p><strong>Valor não informado:</strong></p>
                          <p>Você não especificou o valor em dinheiro que pagará.</p>
                          <p>Por favor, tenha o valor total de <strong>R$ {currentOrder.total?.toFixed(2)}</strong> pronto para a {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="cash-instructions">
                  <div className="instructions-header">
                    <Shield size={20} />
                    <h4>Instruções para Pagamento em Dinheiro</h4>
                  </div>
                  <ol className="instructions-list">
                    <li>Prepare o valor correto em dinheiro</li>
                    <li>Se informou valor maior, avise que precisará de troco</li>
                    <li>O pagamento será realizado no momento da {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}</li>
                    <li>Confirme o pagamento via WhatsApp</li>
                    <li>Aguarde o agendamento da {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}</li>
                  </ol>
                  
                  <div className="cash-warning">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-text">
                      <strong>Importante:</strong> Certifique-se de ter o valor correto. 
                      Em caso de dúvidas sobre o troco, entre em contato antes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comprovante de pagamento */}
          {!showProofForm ? (
            <div className="proof-section">
              <div className="proof-header">
                <Clock size={24} />
                <h3>
                  {paymentMethod === 'pix' ? 'Enviar Comprovante' : 'Confirmar Pagamento'}
                </h3>
              </div>
              
              <div className="proof-options">
                <button 
                  className="option-btn"
                  onClick={() => setShowProofForm(true)}
                  type="button"
                >
                  <span className="option-icon">
                    {paymentMethod === 'pix' ? '📱' : '💵'}
                  </span>
                  <div className="option-text">
                    <h4>{paymentMethod === 'pix' ? 'Enviar comprovante' : 'Confirmar pagamento'}</h4>
                    <p>
                      {paymentMethod === 'pix' 
                        ? 'Clique após fazer o pagamento' 
                        : 'Clique para confirmar que está com o valor'}
                    </p>
                  </div>
                </button>
                
                <div className="whatsapp-preview">
                  <div className="preview-header">
                    <span className="whatsapp-icon">💬</span>
                    <h4>Mensagem Automática</h4>
                  </div>
                  <div className="preview-content">
                    <p><strong>{paymentMethod === 'pix' ? '📋 ENVIAR COMPROVANTE PIX' : '💵 CONFIRMAR PAGAMENTO EM DINHEIRO'}</strong></p>
                    <p><strong>🧾 PEDIDO:</strong> {currentOrder.id}</p>
                    <p><strong>👤 CLIENTE:</strong> {currentOrder.customer?.name || 'Não informado'}</p>
                    <p><strong>💰 VALOR PAGO:</strong> R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
                    <p><strong>💳 PAGAMENTO:</strong> {paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}</p>
                    {paymentMethod === 'dinheiro' && cashAmount && (
                      <p><strong>💸 VALOR INFORMADO:</strong> R$ {cashAmount.toFixed(2)}</p>
                    )}
                    <p><strong>📦 ENTREGA:</strong> {deliveryOption === 'retirada' ? 'Retirada na Escola' : 'Entrega a Domicílio (+R$ 3,00)'}</p>
                    {deliveryOption === 'entrega' && (
                      <>
                        <p><strong>⚠️ ATENÇÃO:</strong> Entrega no dia seguinte ao pagamento confirmado</p>
                        <p><strong>📅 PREVISÃO:</strong> {deliveryDate ? deliveryDate : 'Próximo dia útil'}</p>
                      </>
                    )}
                    <p className="preview-note">
                      {paymentMethod === 'pix' 
                        ? '📎 Anexe a foto do comprovante quando o WhatsApp abrir'
                        : '✅ Confirme que está com o valor correto para pagamento'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="security-note">
                <Shield size={20} />
                <p>
                  <strong>Importante:</strong> {paymentMethod === 'pix' 
                    ? 'Só envie o comprovante após o pagamento ser realizado. Nunca compartilhe dados sensíveis.'
                    : 'Só confirme o pagamento se estiver com o valor correto em mãos. Combine detalhes pelo WhatsApp.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="proof-form">
              <div className="form-header">
                <h3>{paymentMethod === 'pix' ? 'Enviar Comprovante' : 'Confirmar Pagamento'}</h3>
                <p>
                  {paymentMethod === 'pix' 
                    ? 'Após realizar o pagamento PIX, clique no botão abaixo para enviar o comprovante'
                    : 'Confirme que está com o valor correto em dinheiro para pagamento'}
                </p>
              </div>
              
              {/* Detalhes do pedido */}
              <div className="order-details">
                <h4>📋 Detalhes do Pedido:</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Pedido:</span>
                    <span className="detail-value">#{currentOrder.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Cliente:</span>
                    <span className="detail-value">{currentOrder.customer?.name || 'Não informado'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Valor:</span>
                    <span className="detail-value">R$ {currentOrder.total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Entrega:</span>
                    <span className="detail-value">
                      {deliveryOption === 'retirada' ? '🏫 Retirada na Escola' : '🚚 Entrega a Domicílio'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pagamento:</span>
                    <span className="detail-value">
                      {paymentMethod === 'pix' ? '💳 PIX' : '💵 Dinheiro'}
                      {paymentMethod === 'dinheiro' && cashAmount && ` (R$ ${cashAmount.toFixed(2)})`}
                    </span>
                  </div>
                  {paymentMethod === 'dinheiro' && cashChange > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Troco:</span>
                      <span className="detail-value">R$ {cashChange.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de entrega detalhadas */}
              {deliveryOption === 'entrega' && (
                <div className="delivery-details-card">
                  <div className="delivery-header">
                    <span className="delivery-icon">📍</span>
                    <h4>Endereço de Entrega</h4>
                  </div>
                  <div className="delivery-info">
                    {deliveryAddress ? (
                      <>
                        <p><strong>Rua:</strong> {deliveryAddress.street || ''}, {deliveryAddress.number || ''}</p>
                        {deliveryAddress.complement && (
                          <p><strong>Complemento:</strong> {deliveryAddress.complement}</p>
                        )}
                        <p><strong>Bairro:</strong> {deliveryAddress.neighborhood || ''}</p>
                        {deliveryAddress.reference && (
                          <p><strong>Referência:</strong> {deliveryAddress.reference}</p>
                        )}
                        <p><strong>Cidade:</strong> Buritama/SP</p>
                      </>
                    ) : (
                      <p><strong>Endereço:</strong> Informado durante o pedido</p>
                    )}
                    
                    {/* Aviso sobre prazo de entrega */}
                    <div className="delivery-deadline-notice">
                      <div className="deadline-icon">⏰</div>
                      <div className="deadline-text">
                        <strong>Prazo de entrega:</strong> Pedidos devem ser feitos com 1 dia de antecedência. 
                        A entrega será realizada no dia seguinte ao pagamento confirmado.
                        {deliveryDate && (
                          <span className="deadline-date">
                            <strong>Previsão:</strong> {formatDeliveryDate(deliveryDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="delivery-fee-notice">💰 Taxa de entrega: R$ 3,00 (já incluída no valor)</p>
                  </div>
                </div>
              )}

              {/* Mensagem WhatsApp Preview */}
              <div className="whatsapp-message-preview">
                <div className="whatsapp-header">
                  <div className="whatsapp-contact">
                    <span className="contact-icon">📱</span>
                    <div>
                      <strong>Enviar para:</strong>
                      <p>{vendorInfo?.whatsapp || 'Não configurado'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="message-bubble">
                  <div className="message-header">
                    <strong>{paymentMethod === 'pix' ? '📋 ENVIAR COMPROVANTE PIX' : '💵 CONFIRMAR PAGAMENTO EM DINHEIRO'}</strong>
                  </div>
                  <div className="message-content">
                    <p><strong>🧾 PEDIDO:</strong> {currentOrder.id}</p>
                    <p><strong>👤 CLIENTE:</strong> {currentOrder.customer?.name || 'Não informado'}</p>
                    <p><strong>💰 VALOR PAGO:</strong> R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
                    
                    <div className="message-divider"></div>
                    
                    <p><strong>💳 INFORMAÇÕES DE PAGAMENTO</strong></p>
                    
                    {paymentMethod === 'pix' ? (
                      <>
                        <p><strong>🔑 FORMA DE PAGAMENTO:</strong> PIX</p>
                        <p><strong>💰 VALOR:</strong> R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
                        <p><strong>📱 CHAVE PIX:</strong> {vendorInfo?.pixKey || 'Será enviada após confirmação'}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>💵 FORMA DE PAGAMENTO:</strong> DINHEIRO</p>
                        <p><strong>💰 VALOR A PAGAR:</strong> R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
                        {cashAmount && (
                          <>
                            <p><strong>💸 VALOR INFORMADO:</strong> R$ {cashAmount.toFixed(2)}</p>
                            {cashChange > 0 ? (
                              <p><strong>🔄 TROCO NECESSÁRIO:</strong> R$ {cashChange.toFixed(2)}</p>
                            ) : (
                              <p><strong>✅ VALOR EXATO - SEM TROCO</strong></p>
                            )}
                          </>
                        )}
                        <p><strong>📝 OBS:</strong> Pagamento será realizado na {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}</p>
                      </>
                    )}
                    
                    <div className="message-divider"></div>
                    
                    <p><strong>📦 INFORMAÇÕES DE ENTREGA</strong></p>
                    
                    {deliveryOption === 'retirada' ? (
                      <>
                        <p><strong>🏫 TIPO:</strong> Retirada na Escola</p>
                        <p><strong>📍 LOCAL:</strong> Escola Estadual</p>
                        <p><strong>⏰ HORÁRIO:</strong> Combinar via WhatsApp</p>
                      </>
                    ) : (
                      <>
                        <p><strong>🚚 TIPO:</strong> Entrega a Domicílio</p>
                        <p><strong>💰 TAXA DE ENTREGA:</strong> R$ 3,00 (já incluída)</p>
                        
                        {/* Aviso sobre prazo */}
                        <p><strong>⚠️ IMPORTANTE:</strong> Pedidos com entrega devem ser feitos com pelo menos 1 dia de antecedência. A entrega será realizada no dia seguinte ao pagamento confirmado.</p>
                        
                        {deliveryDate && (
                          <p><strong>📅 PREVISÃO DE ENTREGA:</strong> {formatDeliveryDate(deliveryDate)}</p>
                        )}
                        
                        {deliveryAddress ? (
                          <>
                            <p><strong>📍 ENDEREÇO:</strong></p>
                            <p>• {deliveryAddress.street || ''}, {deliveryAddress.number || ''}</p>
                            {deliveryAddress.complement && (
                              <p>• Complemento: {deliveryAddress.complement}</p>
                            )}
                            <p>• Bairro: {deliveryAddress.neighborhood || ''}</p>
                            {deliveryAddress.reference && (
                              <p>• Referência: {deliveryAddress.reference}</p>
                            )}
                            <p>• Buritama/SP</p>
                          </>
                        ) : (
                          <p><strong>📍 ENDEREÇO:</strong> Informado durante o pedido</p>
                        )}
                      </>
                    )}
                    
                    <div className="message-divider"></div>
                    
                    <p><strong>🛒 ITENS DO PEDIDO:</strong></p>
                    {currentOrder.items?.slice(0, 3).map((item, index) => (
                      <p key={index}>• {item.quantity || 1}x {item.name || 'Produto'}</p>
                    ))}
                    {currentOrder.items && currentOrder.items.length > 3 && (
                      <p>... e mais {currentOrder.items.length - 3} itens</p>
                    )}
                    
                    <div className="message-divider"></div>
                    
                    {/* Mostrar detalhes financeiros se for entrega */}
                    {deliveryOption === 'entrega' ? (
                      <>
                        <p><strong>💰 RESUMO FINANCEIRO</strong></p>
                        <p><strong>Subtotal:</strong> R$ {currentOrder.subtotal?.toFixed(2) || (currentOrder.total - 3).toFixed(2)}</p>
                        <p><strong>Taxa de entrega:</strong> R$ 3,00</p>
                        <p><strong>TOTAL FINAL:</strong> R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
                      </>
                    ) : (
                      <p><strong>💰 VALOR TOTAL:</strong> R$ {currentOrder.total?.toFixed(2) || '0.00'}</p>
                    )}
                    
                    <div className="message-divider"></div>
                    
                    {paymentMethod === 'pix' ? (
                      <p><strong>📎 ANEXE A FOTO DO COMPROVANTE PIX</strong></p>
                    ) : (
                      <>
                        <p><strong>💵 CONFIRMAÇÃO DE PAGAMENTO EM DINHEIRO</strong></p>
                        <p>Por favor, confirme que está com o valor correto para {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="whatsapp-hint">
                  <span>
                    {paymentMethod === 'pix' 
                      ? '📎 Anexe a foto do comprovante quando o WhatsApp abrir'
                      : '✅ Confirme que está com o valor correto para pagamento'}
                  </span>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowProofForm(false)}
                  type="button"
                >
                  Voltar
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleOpenWhatsApp}
                  disabled={loading || !vendorInfo?.whatsapp}
                  style={{ minWidth: '200px' }}
                  type="button"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Abrindo WhatsApp...
                    </>
                  ) : (
                    <>
                      <span className="whatsapp-btn-icon">💬</span>
                      {paymentMethod === 'pix' ? 'Abrir WhatsApp e Enviar' : 'Confirmar Pagamento'}
                    </>
                  )}
                </button>
              </div>
              
              <div className="instructions">
                <h4>📝 Como proceder:</h4>
                <ol>
                  <li>Clique em "{paymentMethod === 'pix' ? 'Abrir WhatsApp e Enviar' : 'Confirmar Pagamento'}"</li>
                  <li>O WhatsApp abrirá com a mensagem pronta</li>
                  {paymentMethod === 'pix' ? (
                    <>
                      <li><strong>Anexe a foto do comprovante PIX</strong></li>
                      <li>Envie a mensagem com o comprovante</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Confirme que está com o valor correto</strong></li>
                      <li>Combine detalhes da {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}</li>
                    </>
                  )}
                  <li>Aguarde nossa confirmação</li>
                </ol>
              </div>
            </div>
          )}

          {/* Ações extras */}
          <div className="extra-actions">
            <button 
              className="btn btn-outline"
              onClick={handleDownloadReceipt}
              type="button"
            >
              <Download size={18} />
              Baixar Comprovante
            </button>
          </div>

          {/* Informações importantes */}
          <div className="important-info">
            <h4>📌 Informações Importantes:</h4>
            <ul>
              {paymentMethod === 'pix' ? (
                <>
                  <li><strong>Envio obrigatório:</strong> É necessário enviar o comprovante pelo WhatsApp</li>
                  <li><strong>Tempo de confirmação:</strong> 1-2 horas úteis após envio do comprovante</li>
                  <li><strong>Validação:</strong> Seu pedido será processado apenas após confirmação do pagamento</li>
                </>
              ) : (
                <>
                  <li><strong>Confirmação necessária:</strong> É necessário confirmar o pagamento via WhatsApp</li>
                  <li><strong>Pagamento no ato:</strong> O pagamento será realizado na {deliveryOption === 'retirada' ? 'retirada' : 'entrega'}</li>
                  <li><strong>Prepare o valor:</strong> Tenha o valor correto em mãos {cashChange > 0 && 'com troco se necessário'}</li>
                </>
              )}
              <li><strong>Taxa de entrega:</strong> R$ 3,00 para entregas a domicílio (já incluída no valor)</li>
              <li><strong>Prazo de entrega:</strong> Pedidos devem ser feitos com 1 dia de antecedência</li>
              <li><strong>Entrega domicílio:</strong> Realizada no dia seguinte ao pagamento confirmado</li>
              <li><strong>Comprovante:</strong> Mantenha o comprovante até a entrega/retirada do pedido</li>
              {paymentMethod === 'dinheiro' && cashChange > 0 && (
                <li><strong>Troco:</strong> O vendedor precisará ter R$ {cashChange.toFixed(2)} de troco</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;