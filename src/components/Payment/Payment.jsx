import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Copy, Check, QrCode, Smartphone, Banknote, Shield, Clock, 
  Download, X, Wallet, Calculator, DollarSign 
} from 'lucide-react'; // Adicionei DollarSign aqui
import { useCart } from '../../context/CartContext';
import QRCodeGenerator from '../QRCodeGenerator/QRCodeGenerator';

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

      <style jsx>{`
        .payment-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
          padding: 20px;
          outline: none;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .payment-container {
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          position: relative;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .payment-header {
          background: linear-gradient(135deg, #2D3047 0%, #1A1C2E 100%);
          color: white;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .header-content {
          flex: 1;
        }

        .payment-title {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .payment-subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }

        .delivery-info-preview {
          font-size: 14px;
          color: #FFD166;
          margin: 8px 0 0 0;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          padding: 0;
          margin-left: 16px;
          flex-shrink: 0;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }

        /* Aviso sobre entrega */
        .delivery-notice {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          padding: 16px 24px;
          border-bottom: 1px solid #FCD34D;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .notice-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notice-content {
          flex: 1;
          font-size: 14px;
          line-height: 1.5;
          color: #92400E;
        }

        .notice-content strong {
          color: #D97706;
        }

        .delivery-date-info {
          display: block;
          margin-top: 6px;
          padding: 6px 10px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 6px;
          border-left: 3px solid #F59E0B;
        }

        .payment-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        /* Etapas */
        .steps-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          position: relative;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .step-icon {
          width: 40px;
          height: 40px;
          background: #E2E8F0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #64748B;
          transition: all 0.3s ease;
        }

        .step.active .step-icon {
          background: #FFD166;
          color: #2D3047;
          box-shadow: 0 4px 12px rgba(255, 209, 102, 0.3);
        }

        .step-text {
          text-align: center;
        }

        .step-text h4 {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #2D3047;
        }

        .step-text p {
          font-size: 12px;
          color: #64748B;
          margin: 0;
        }

        .step-line {
          flex: 1;
          height: 2px;
          background: #E2E8F0;
          margin: 0 8px;
          position: relative;
          top: -20px;
        }

        /* PIX Section */
        .pix-section {
          background: #F8FAFC;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #E2E8F0;
        }

        .pix-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .pix-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #2D3047;
          margin: 0;
        }

        .qr-code-container {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .qr-code-container {
            flex-direction: column;
            text-align: center;
          }
        }

        .qr-code-real-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          border: 1px solid #E2E8F0;
          min-width: 280px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .qr-code-wrapper {
          padding: 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
        }

        .qr-code-info {
          text-align: center;
        }

        .qr-code-amount {
          font-size: 24px;
          font-weight: 800;
          color: #FFD166;
          margin: 0 0 8px 0;
        }

        .qr-code-name {
          font-size: 14px;
          font-weight: 600;
          color: #2D3047;
          margin: 0 0 4px 0;
        }

        .qr-code-hint {
          font-size: 12px;
          color: #64748B;
          margin: 0;
        }

        .pix-instructions {
          flex: 1;
        }

        .instruction-title {
          font-weight: 700;
          color: #2D3047;
          margin-bottom: 12px;
        }

        .instruction-list {
          margin: 0;
          padding-left: 20px;
          margin-bottom: 16px;
        }

        .instruction-list li {
          margin-bottom: 8px;
          color: #475569;
          line-height: 1.4;
        }

        .scan-instruction {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #E0F2FE;
          border-radius: 8px;
          color: #0369A1;
          font-size: 14px;
        }

        /* Chave PIX */
        .pix-key-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #E2E8F0;
        }

        .pix-key-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-weight: 600;
          color: #2D3047;
        }

        .pix-key-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .pix-key-wrapper {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .pix-key {
          flex: 1;
          background: #F1F5F9;
          padding: 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          word-break: break-all;
          color: #2D3047;
          border: 1px solid #E2E8F0;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #FFD166;
          color: #2D3047;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .copy-btn:hover {
          background: #E5BC59;
          transform: translateY(-2px);
        }

        .copy-btn.copied {
          background: #10B981;
          color: white;
        }

        .copy-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pix-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #F8FAFC;
          border-radius: 8px;
          font-size: 14px;
        }

        .detail strong {
          color: #2D3047;
        }

        /* Pagamento em Dinheiro */
        .cash-payment-section {
          background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 2px solid #BAE6FD;
          animation: fadeIn 0.5s ease;
        }

        .cash-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .cash-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #0369A1;
          margin: 0;
        }

        .cash-details-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cash-detail-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #BAE6FD;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.1);
        }

        .cash-detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #F0F9FF;
        }

        .cash-detail-header h4 {
          font-size: 18px;
          color: #0369A1;
          margin: 0;
          font-weight: 700;
        }

        .cash-detail-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cash-detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #F8FAFC;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s ease;
        }

        .cash-detail-item:hover {
          background: #F1F5F9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }

        .cash-detail-item.change {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.05), rgba(147, 51, 234, 0.02));
          border-color: #9333EA;
        }

        .cash-detail-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #0369A1;
        }

        .cash-detail-value {
          font-weight: 700;
          font-size: 18px;
          color: #1A1C2E;
        }

        .cash-detail-value.total {
          color: #FFD166;
          font-size: 20px;
        }

        .cash-detail-value.given {
          color: #10B981;
        }

        .cash-detail-value.change {
          color: #9333EA;
          background: rgba(147, 51, 234, 0.1);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 16px;
          border: 1px solid rgba(147, 51, 234, 0.2);
        }

        .cash-instruction-box {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(255, 209, 102, 0.05));
          border-radius: 12px;
          border: 1px solid #FFD166;
          margin-top: 16px;
          align-items: flex-start;
        }

        .instruction-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .instruction-text {
          flex: 1;
        }

        .instruction-text strong {
          color: #92400E;
          font-size: 16px;
          display: block;
          margin-bottom: 8px;
        }

        .instruction-text p {
          color: #92400E;
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .change-instruction {
          background: rgba(16, 185, 129, 0.1);
          padding: 8px 12px;
          border-radius: 6px;
          border-left: 3px solid #10B981;
          margin-top: 8px !important;
          color: #047857 !important;
          font-weight: 600;
        }

        .cash-no-amount-info {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05));
          border-radius: 12px;
          border: 1px solid #FBBF24;
          margin-top: 16px;
          align-items: flex-start;
        }

        .no-amount-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .no-amount-text {
          flex: 1;
        }

        .no-amount-text p {
          color: #92400E;
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .no-amount-text strong {
          color: #92400E;
        }

        .cash-instructions {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #BAE6FD;
        }

        .instructions-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .instructions-header h4 {
          color: #0369A1;
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .instructions-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #0369A1;
          font-size: 14px;
          line-height: 1.4;
        }

        .instructions-list li:before {
          content: "•";
          color: #FFD166;
          font-weight: bold;
          font-size: 18px;
          flex-shrink: 0;
          margin-top: -2px;
        }

        .cash-warning {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 10px;
          border: 1px solid #F59E0B;
          align-items: flex-start;
        }

        .cash-warning .warning-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .cash-warning .warning-text {
          flex: 1;
          font-size: 14px;
          color: #92400E;
          line-height: 1.4;
        }

        .cash-warning .warning-text strong {
          color: #D97706;
        }

        /* Comprovante Section */
        .proof-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #E2E8F0;
        }

        .proof-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .proof-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #2D3047;
          margin: 0;
        }

        .proof-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .proof-options {
            grid-template-columns: 1fr;
          }
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          border: none;
          width: 100%;
        }

        .option-btn:hover {
          background: white;
          border-color: #FFD166;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .option-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .option-text h4 {
          font-size: 16px;
          font-weight: 700;
          color: #2D3047;
          margin: 0 0 4px 0;
        }

        .option-text p {
          font-size: 14px;
          color: #64748B;
          margin: 0;
        }

        .whatsapp-preview {
          padding: 20px;
          background: #F0F9FF;
          border-radius: 12px;
          border: 1px solid #BAE6FD;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .whatsapp-icon {
          font-size: 24px;
        }

        .preview-header h4 {
          color: #0369A1;
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .preview-content {
          font-size: 13px;
          color: #0369A1;
          line-height: 1.4;
        }

        .preview-content p {
          margin: 0 0 4px 0;
        }

        .preview-note {
          font-size: 12px;
          color: #64748B;
          margin-top: 8px !important;
          font-style: italic;
        }

        .security-note {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #FEF3C7;
          border-radius: 8px;
          border-left: 4px solid #F59E0B;
        }

        .security-note p {
          margin: 0;
          color: #92400E;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Formulário do comprovante */
        .proof-form {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #E2E8F0;
        }

        .form-header {
          margin-bottom: 20px;
        }

        .form-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #2D3047;
          margin: 0 0 8px 0;
        }

        .form-header p {
          color: #64748B;
          margin: 0;
          font-size: 14px;
        }

        .order-details {
          background: #F8FAFC;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .order-details h4 {
          color: #2D3047;
          margin: 0 0 16px 0;
          font-size: 16px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 12px;
          color: #64748B;
          font-weight: 500;
        }

        .detail-value {
          font-size: 14px;
          color: #2D3047;
          font-weight: 600;
        }

        /* Detalhes da entrega */
        .delivery-details-card {
          background: #F0F9FF;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #BAE6FD;
        }

        .delivery-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .delivery-icon {
          font-size: 20px;
        }

        .delivery-header h4 {
          color: #0369A1;
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .delivery-info p {
          margin: 0 0 8px 0;
          color: #0369A1;
          font-size: 14px;
        }

        .delivery-info strong {
          color: #064E3B;
          margin-right: 8px;
        }

        /* Aviso sobre prazo dentro do card de entrega */
        .delivery-deadline-notice {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(251, 191, 36, 0.1);
          border-radius: 8px;
          border: 1px solid #FBBF24;
          margin: 16px 0;
          align-items: flex-start;
        }

        .deadline-icon {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .deadline-text {
          flex: 1;
          font-size: 13px;
          line-height: 1.4;
          color: #92400E;
        }

        .deadline-date {
          display: block;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(251, 191, 36, 0.3);
        }

        .delivery-fee-notice {
          background: rgba(16, 185, 129, 0.1);
          padding: 10px;
          border-radius: 8px;
          border-left: 3px solid #10B981;
          margin-top: 12px !important;
          color: #047857 !important;
          font-weight: 600;
        }

        /* WhatsApp Message Preview */
        .whatsapp-message-preview {
          background: #F7F8FA;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid #E6E6E6;
        }

        .whatsapp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #E6E6E6;
        }

        .whatsapp-contact {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-icon {
          font-size: 24px;
          color: #25D366;
        }

        .whatsapp-contact div {
          font-size: 14px;
        }

        .whatsapp-contact strong {
          color: #2D3047;
          display: block;
          margin-bottom: 2px;
        }

        .whatsapp-contact p {
          color: #666;
          margin: 0;
          font-size: 13px;
        }

        .message-bubble {
          background: #E1F7CB;
          border-radius: 12px;
          padding: 16px;
          position: relative;
          margin-bottom: 12px;
        }

        .message-bubble:before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 20px;
          border: 8px solid transparent;
          border-bottom-color: #E1F7CB;
        }

        .message-header {
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .message-content {
          font-size: 13px;
          line-height: 1.4;
        }

        .message-content p {
          margin: 0 0 6px 0;
        }

        .message-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 12px 0;
        }

        .whatsapp-hint {
          text-align: center;
          font-size: 12px;
          color: #666;
          padding: 8px;
          background: rgba(37, 211, 102, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(37, 211, 102, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin: 24px 0;
        }

        .instructions {
          background: #F0F9FF;
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
          border: 1px solid #BAE6FD;
        }

        .instructions h4 {
          color: #0369A1;
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .instructions ol {
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
          color: #0369A1;
        }

        .instructions li {
          margin-bottom: 8px;
          line-height: 1.4;
        }

        /* Ações extras */
        .extra-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .extra-actions {
            flex-direction: column;
          }
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 15px;
          flex: 1;
        }

        .btn-outline {
          background: white;
          border: 2px solid #E2E8F0;
          color: #2D3047;
        }

        .btn-outline:hover {
          background: #F8FAFC;
          border-color: #2D3047;
        }

        .btn-secondary {
          background: #F1F5F9;
          color: #2D3047;
        }

        .btn-secondary:hover {
          background: #E2E8F0;
        }

        .btn-primary {
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
          font-weight: 700;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .whatsapp-btn-icon {
          font-size: 18px;
          margin-right: 4px;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Informações importantes */
        .important-info {
          background: #F0F9FF;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #BAE6FD;
        }

        .important-info h4 {
          font-size: 16px;
          font-weight: 700;
          color: #0369A1;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .important-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .important-info li {
          margin-bottom: 8px;
          color: #475569;
          line-height: 1.5;
          font-size: 14px;
        }

        .important-info li strong {
          color: #0369A1;
        }

        /* Adiciona scroll suave */
        .payment-content::-webkit-scrollbar {
          width: 8px;
        }

        .payment-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .payment-content::-webkit-scrollbar-thumb {
          background: #FFD166;
          border-radius: 4px;
        }

        .payment-content::-webkit-scrollbar-thumb:hover {
          background: #E5BC59;
        }

        /* Responsividade */
        @media (max-width: 640px) {
          .payment-overlay {
            padding: 10px;
          }
          
          .payment-container {
            max-height: 95vh;
            border-radius: 20px;
          }
          
          .payment-header {
            padding: 20px;
          }
          
          .payment-title {
            font-size: 20px;
          }
          
          .close-btn {
            width: 40px;
            height: 40px;
          }
          
          .delivery-notice {
            padding: 14px 20px;
          }
          
          .notice-content {
            font-size: 13px;
          }
          
          .pix-section,
          .cash-payment-section,
          .proof-section,
          .proof-form,
          .important-info {
            padding: 16px;
          }
          
          .steps-container {
            margin-bottom: 24px;
          }
          
          .step-text h4 {
            font-size: 12px;
          }
          
          .step-text p {
            font-size: 11px;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
          
          .cash-detail-item {
            padding: 12px;
          }
          
          .cash-detail-value {
            font-size: 16px;
          }
          
          .cash-detail-value.total {
            font-size: 18px;
          }
        }

        /* Animações */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Payment;