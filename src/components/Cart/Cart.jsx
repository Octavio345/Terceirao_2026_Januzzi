import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, MessageCircle, Copy, 
  Package, ShoppingCart, ChevronRight, User, Phone, Mail,
  MapPin, Home, School, Truck, CheckCircle, DollarSign, ArrowLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    getCartCount,
    createOrder
  } = useCart();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [deliveryOption, setDeliveryOption] = useState('retirada');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    reference: ''
  });

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  
  // Constantes para taxas
  const DELIVERY_FEE = 3.00;
  const [subtotal, setSubtotal] = useState(0);
  const [totalWithDelivery, setTotalWithDelivery] = useState(0);

  // Calcula totais sempre que cart ou deliveryOption mudar
  useEffect(() => {
    const cartSubtotal = getCartTotal();
    setSubtotal(cartSubtotal);
    
    if (deliveryOption === 'entrega') {
      setTotalWithDelivery(cartSubtotal + DELIVERY_FEE);
    } else {
      setTotalWithDelivery(cartSubtotal);
    }
  }, [cart, deliveryOption, getCartTotal]);

  if (!isCartOpen) return null;

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliveryOptionChange = (option) => {
    setDeliveryOption(option);
  };

  const validateForm = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      return false;
    }
    
    if (deliveryOption === 'entrega') {
      if (!deliveryAddress.street || !deliveryAddress.number || !deliveryAddress.neighborhood) {
        return false;
      }
    }
    
    return true;
  };

  // FUNÇÃO NOVA: Calcular data de entrega
  const getDeliveryDate = () => {
    if (deliveryOption !== 'entrega') return null;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    return tomorrow.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateOrderText = () => {
    const itemsText = cart.map(item => 
      `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    let customerText = '';
    if (customerInfo.name) customerText += `Nome: ${customerInfo.name}\n`;
    if (customerInfo.phone) customerText += `Telefone: ${customerInfo.phone}\n`;
    if (customerInfo.email) customerText += `Email: ${customerInfo.email}\n`;
    
    let deliveryText = '';
    if (deliveryOption === 'retirada') {
      deliveryText = `🏫 *RETIRADA NA ESCOLA*\n📍 Local: Escola Estadual\n⏰ Horário: Combinar via WhatsApp\n`;
    } else {
      const deliveryDate = getDeliveryDate();
      deliveryText = `🚚 *ENTREGA A DOMICÍLIO*\n`;
      deliveryText += `📍 Endereço: ${deliveryAddress.street}, ${deliveryAddress.number}\n`;
      if (deliveryAddress.complement) deliveryText += `Complemento: ${deliveryAddress.complement}\n`;
      deliveryText += `Bairro: ${deliveryAddress.neighborhood}\n`;
      if (deliveryAddress.reference) deliveryText += `Ponto de referência: ${deliveryAddress.reference}\n`;
      deliveryText += `💰 Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}\n`;
      if (deliveryDate) {
        deliveryText += `📅 *Previsão de entrega:* ${deliveryDate} (próximo dia útil)\n`;
      }
      deliveryText += `⚠️ *ATENÇÃO:* Entrega realizada apenas no dia seguinte ao pagamento confirmado\n`;
    }
    
    return `🎓 *PEDIDO - TERCEIRÃO 2026*\n\n` +
           `*Dados do Cliente:*\n${customerText}\n` +
           `*Informações de Entrega:*\n${deliveryText}\n` +
           `*Itens do Pedido:*\n${itemsText}\n\n` +
           `*Subtotal:* R$ ${subtotal.toFixed(2)}\n` +
           (deliveryOption === 'entrega' ? `*Taxa de entrega:* R$ ${DELIVERY_FEE.toFixed(2)}\n` : '') +
           `*Total do Pedido:* R$ ${totalWithDelivery.toFixed(2)}\n\n` +
           `_Aguardando confirmação do pagamento via PIX_`;
  };

  const handleShareOrderViaWhatsApp = () => {
    if (cart.length === 0) return;
    
    if (!validateForm()) {
      setShowCustomerForm(true);
      setFormStep(1);
      return;
    }
    
    const deliveryDate = getDeliveryDate();
    
    const orderData = {
      ...customerInfo,
      deliveryOption,
      deliveryAddress: deliveryOption === 'entrega' ? deliveryAddress : null,
      deliveryDate: deliveryDate,
      subtotal: subtotal,
      deliveryFee: deliveryOption === 'entrega' ? DELIVERY_FEE : 0,
      total: totalWithDelivery
    };
    
    const order = createOrder(orderData);
  };

  const handleCopyOrderWithInfo = () => {
    if (!validateForm()) {
      alert('Por favor, preencha todos os dados obrigatórios primeiro.');
      return;
    }
    
    const orderText = generateOrderText();
    navigator.clipboard.writeText(orderText)
      .then(() => {
        alert('Pedido copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar: ', err);
        alert('Erro ao copiar pedido. Tente novamente.');
      });
  };

  // FUNÇÃO NOVA: Scroll para produtos
  const handleViewProducts = () => {
    // Fecha o carrinho
    toggleCart();
    
    // Pequeno delay para garantir que o carrinho fechou
    setTimeout(() => {
      // Tenta encontrar a seção de produtos
      const productsSection = document.querySelector('#produtos, .products-section, section[data-products]');
      
      if (productsSection) {
        // Scroll suave para os produtos
        productsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        
        // Adiciona um highlight visual temporário
        productsSection.style.transition = 'box-shadow 0.3s ease';
        productsSection.style.boxShadow = '0 0 0 4px rgba(255, 209, 102, 0.4)';
        
        setTimeout(() => {
          productsSection.style.boxShadow = '';
        }, 1500);
      } else {
        // Se não encontrar na mesma página, rola para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 300);
  };

  const renderFormStep = () => {
    switch(formStep) {
      case 1:
        return (
          <>
            <div className="form-section">
              <h4 className="form-section-title">
                <User size={20} />
                Dados Pessoais
              </h4>
              <div className="form-fields">
                <div className="form-group">
                  <div className="input-icon">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Seu nome completo *"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <div className="input-icon">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="WhatsApp (com DDD) *"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <div className="input-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="E-mail para contato (opcional)"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-navigation">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCustomerForm(false)}
              >
                <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                Voltar
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setFormStep(2)}
                disabled={!customerInfo.name || !customerInfo.phone}
              >
                Próximo → Entrega
              </button>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <div className="form-section">
              <h4 className="form-section-title">
                <Truck size={20} />
                Opção de Entrega
              </h4>
              
              {/* Aviso sobre prazo de entrega */}
              {deliveryOption === 'entrega' && (
                <div className="delivery-deadline-notice">
                  <div className="deadline-icon">⚠️</div>
                  <div className="deadline-text">
                    <strong>ATENÇÃO:</strong> Pedidos com entrega devem ser feitos com 1 dia de antecedência. 
                    A entrega será realizada no dia seguinte ao pagamento confirmado.
                    {getDeliveryDate() && (
                      <span className="deadline-date">
                        <strong>Previsão de entrega:</strong> {getDeliveryDate()}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Exibir valor total atualizado */}
              <div className="price-summary-form">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span className="price-value">R$ {subtotal.toFixed(2)}</span>
                </div>
                {deliveryOption === 'entrega' && (
                  <>
                    <div className="price-row delivery-fee">
                      <span>Taxa de entrega:</span>
                      <span className="price-value">+ R$ {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                    <div className="price-row delivery-total">
                      <span>Total com entrega:</span>
                      <span className="price-value delivery-total-value">R$ {totalWithDelivery.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="price-row total">
                  <span>Valor Final:</span>
                  <span className="price-value total">R$ {totalWithDelivery.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="delivery-options">
                <div 
                  className={`delivery-option ${deliveryOption === 'retirada' ? 'selected' : ''}`}
                  onClick={() => handleDeliveryOptionChange('retirada')}
                >
                  <div className="option-icon">
                    <School size={24} />
                  </div>
                  <div className="option-content">
                    <h5>Retirada na Escola</h5>
                    <p>Busque seu pedido na escola</p>
                    <div className="option-benefits">
                      <span>• Sem taxa de entrega</span>
                      <span>• Retire quando quiser</span>
                      <span>• Horário combinado</span>
                    </div>
                  </div>
                  {deliveryOption === 'retirada' && (
                    <CheckCircle size={20} className="check-icon" />
                  )}
                </div>
                
                <div 
                  className={`delivery-option ${deliveryOption === 'entrega' ? 'selected' : ''}`}
                  onClick={() => handleDeliveryOptionChange('entrega')}
                >
                  <div className="option-icon">
                    <Home size={24} />
                  </div>
                  <div className="option-content">
                    <h5>Entrega em Casa</h5>
                    <p>Receba no conforto do seu lar</p>
                    <div className="option-price">
                      <span className="fee-badge">+ R$ {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                    <div className="option-benefits">
                      <span>• Entrega rápida</span>
                      <span>• Praticidade total</span>
                      <span>• Segurança garantida</span>
                    </div>
                  </div>
                  {deliveryOption === 'entrega' && (
                    <CheckCircle size={20} className="check-icon" />
                  )}
                </div>
              </div>
              
              {deliveryOption === 'entrega' && (
                <div className="address-form">
                  <h5 className="address-title">
                    <MapPin size={18} />
                    Endereço de Entrega
                  </h5>
                  <div className="form-fields">
                    <div className="form-group">
                      <input
                        type="text"
                        name="street"
                        placeholder="Rua/Avenida *"
                        value={deliveryAddress.street}
                        onChange={handleAddressChange}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group half">
                        <input
                          type="text"
                          name="number"
                          placeholder="Número *"
                          value={deliveryAddress.number}
                          onChange={handleAddressChange}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group half">
                        <input
                          type="text"
                          name="complement"
                          placeholder="Complemento"
                          value={deliveryAddress.complement}
                          onChange={handleAddressChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <input
                        type="text"
                        name="neighborhood"
                        placeholder="Bairro *"
                        value={deliveryAddress.neighborhood}
                        onChange={handleAddressChange}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <input
                        type="text"
                        name="reference"
                        placeholder="Ponto de referência (opcional)"
                        value={deliveryAddress.reference}
                        onChange={handleAddressChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-navigation">
              <button 
                className="btn btn-secondary"
                onClick={() => setFormStep(1)}
              >
                <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                ← Voltar
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (validateForm()) {
                    handleShareOrderViaWhatsApp();
                  } else {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                  }
                }}
                disabled={!validateForm()}
              >
                <MessageCircle size={18} style={{ marginRight: '8px' }} />
                Finalizar Pedido
              </button>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="cart-overlay" onClick={toggleCart}>
      <div className="cart-container" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <div className="header-left">
            <div className="header-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="header-text">
              <h2 className="cart-title">Meu Carrinho</h2>
              <p className="cart-subtitle">{getCartCount()} {getCartCount() === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <button className="close-cart" onClick={toggleCart} aria-label="Fechar carrinho">
            <X size={24} />
          </button>
        </div>

        <div className="cart-scroll">
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <Package size={48} className="empty-icon" />
                </div>
                <h3 className="empty-title">Carrinho vazio</h3>
                <p className="empty-description">
                  Adicione produtos para começar suas compras
                </p>
                <button 
                  className="btn btn-primary btn-large" 
                  onClick={handleViewProducts}
                >
                  <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                  Ver Produtos
                </button>
              </div>
            ) : (
              <>
                {showCustomerForm && (
                  <div className="customer-form-container">
                    <div className="form-header">
                      <h3 className="form-title">📝 Finalizar Pedido</h3>
                      <p className="form-subtitle">
                        Passo {formStep} de 2 • {formStep === 1 ? 'Dados Pessoais' : 'Opção de Entrega'}
                      </p>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: formStep === 1 ? '50%' : '100%' }}
                        ></div>
                      </div>
                    </div>
                    
                    {renderFormStep()}
                  </div>
                )}
                
                {!showCustomerForm && cart.map(item => (
                  <div key={item.id} className="cart-item-card">
                    <div className="item-image-wrapper">
                      <div className="item-image">
                        <span className="item-emoji">{item.emoji}</span>
                      </div>
                    </div>
                    
                    <div className="item-content">
                      <div className="item-header">
                        <h4 className="item-name">{item.name}</h4>
                        <button 
                          className="remove-item-btn"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {item.description && (
                        <p className="item-description">{item.description}</p>
                      )}
                      
                      <div className="item-controls-wrapper">
                        <div className="quantity-control">
                          <button 
                            className="qty-btn decrease"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button 
                            className="qty-btn increase"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Aumentar quantidade"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="item-price-info">
                          <span className="item-price-unit">R$ {item.price.toFixed(2)} un</span>
                          <span className="item-price-total">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {cart.length > 0 && !showCustomerForm && (
            <div className="cart-summary">
              <div className="summary-header">
                <h3 className="summary-title">Resumo do Pedido</h3>
                <ChevronRight size={20} className="summary-arrow" />
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-value">R$ {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span className="summary-label">Quantidade de itens</span>
                  <span className="summary-value">{getCartCount()}</span>
                </div>
                
                {deliveryOption === 'entrega' && (
                  <>
                    <div className="summary-row delivery-fee">
                      <span className="summary-label">
                        <Truck size={14} style={{ marginRight: '6px' }} />
                        Taxa de entrega
                      </span>
                      <span className="summary-value">+ R$ {DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                    <div className="summary-row delivery-total">
                      <span className="summary-label">Total com entrega</span>
                      <span className="summary-value delivery-total-value">R$ {totalWithDelivery.toFixed(2)}</span>
                    </div>
                  </>
                )}
                
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span className="total-label">Total Final</span>
                  <span className="total-value">R$ {totalWithDelivery.toFixed(2)}</span>
                </div>
                
                {/* Aviso sobre entrega */}
                {deliveryOption === 'entrega' && (
                  <div className="delivery-warning-summary">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-text">
                      <strong>ATENÇÃO:</strong> Entrega apenas no dia seguinte ao pagamento confirmado. 
                      Previsão: {getDeliveryDate()}
                    </div>
                  </div>
                )}
              </div>

              <div className="customer-info-preview">
                <div className="info-header">
                  <User size={18} />
                  <h4>Seus Dados</h4>
                </div>
                <div className="info-fields">
                  <div className="info-field">
                    <span className="info-label">Nome:</span>
                    <span className="info-value">{customerInfo.name || 'Não informado'}</span>
                  </div>
                  <div className="info-field">
                    <span className="info-label">Telefone:</span>
                    <span className="info-value">{customerInfo.phone || 'Não informado'}</span>
                  </div>
                  <div className="info-field">
                    <span className="info-label">Entrega:</span>
                    <span className="info-value">
                      {deliveryOption === 'retirada' ? '🏫 Retirada' : '🚚 Entrega (+R$ 3,00)'}
                    </span>
                  </div>
                </div>
                <button 
                  className="btn-edit-info"
                  onClick={() => {
                    setShowCustomerForm(true);
                    setFormStep(1);
                  }}
                >
                  {customerInfo.name ? 'Editar dados' : 'Adicionar dados'}
                </button>
              </div>

              <div className="cart-actions">
                <button 
                  className="btn btn-secondary action-btn btn-mobile-fix btn-danger-mobile"
                  onClick={clearCart}
                >
                  <Trash2 size={20} />
                  Limpar Tudo
                </button>
                
                <button 
                  className="btn btn-primary action-btn btn-mobile-fix btn-copy-mobile"
                  onClick={handleCopyOrderWithInfo}
                  disabled={!validateForm()}
                >
                  <Copy size={20} />
                  Copiar Pedido
                </button>
              </div>

              <button 
                className="btn btn-whatsapp"
                onClick={handleShareOrderViaWhatsApp}
                disabled={cart.length === 0}
              >
                <MessageCircle size={20} style={{ marginRight: '12px' }} />
                <span className="whatsapp-text">
                  {validateForm() ? 'Finalizar Pedido' : 'Preencher Dados'}
                </span>
              </button>

              <div className="instructions-card">
                <div className="instructions-header">
                  <span className="instructions-icon">📋</span>
                  <h4 className="instructions-title">Como Finalizar o Pedido</h4>
                </div>
                <ol className="instructions-steps">
                  <li className="step">
                    <span className="step-number">1</span>
                    <span className="step-text">Preencha seus dados e escolha a entrega</span>
                  </li>
                  <li className="step">
                    <span className="step-number">2</span>
                    <span className="step-text">Clique em "Finalizar Pedido"</span>
                  </li>
                  <li className="step">
                    <span className="step-number">3</span>
                    <span className="step-text">Faça o pagamento PIX pelo valor total</span>
                  </li>
                  <li className="step">
                    <span className="step-number">4</span>
                    <span className="step-text">Envie o comprovante via WhatsApp</span>
                  </li>
                </ol>
                
                <div className="delivery-notice">
                  <DollarSign size={16} />
                  <p><strong>Taxa de entrega:</strong> R$ 3,00 para entregas a domicílio. Retirada na escola é gratuita.</p>
                  {deliveryOption === 'entrega' && (
                    <p className="delivery-warning">
                      ⚠️ <strong>ATENÇÃO:</strong> Entrega realizada apenas no dia seguinte ao pagamento confirmado.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cart-container {
          width: 100%;
          max-width: 480px;
          height: 100%;
          background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* Cabeçalho MOBILE FRIENDLY */
        .cart-header {
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, #1A1C2E 0%, #2D3047 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          min-height: 70px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .header-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .header-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }

        .cart-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.2;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cart-subtitle {
          font-size: 0.8rem;
          opacity: 0.8;
          margin: 0.125rem 0 0 0;
          font-weight: 500;
        }

        .close-cart {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 0.5rem;
          padding: 0;
        }

        .close-cart:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        /* Área de rolagem MOBILE OPTIMIZED */
        .cart-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          -webkit-overflow-scrolling: touch;
        }

        /* Estado vazio MOBILE FRIENDLY */
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .empty-icon {
          color: #94A3B8;
          opacity: 0.7;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1A1C2E;
          margin: 0 0 0.5rem 0;
        }

        .empty-description {
          font-size: 0.95rem;
          color: #64748B;
          margin: 0 0 1.5rem 0;
          max-width: 250px;
          line-height: 1.4;
        }

        /* Botões gerais */
        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          min-height: 44px;
        }

        .btn-secondary {
          background: #F1F5F9;
          color: #1A1C2E;
        }

        .btn-secondary:hover {
          background: #E2E8F0;
          transform: translateY(-1px);
        }

        .btn-primary {
          background: #FFD166;
          color: #1A1C2E;
          font-weight: 700;
        }

        .btn-primary:hover {
          background: #E5BC59;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 209, 102, 0.2);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-large {
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          min-height: 48px;
        }

        /* Botões de ação - FIXED FOR MOBILE */
        .cart-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          width: 100%;
        }

        /* Botão fixo para mobile */
        .btn-mobile-fix {
          position: relative;
          min-height: 56px !important;
          padding: 1rem 1.5rem !important;
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          border-radius: 14px !important;
          width: 100%;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          border: 2px solid transparent !important;
        }

        /* Para o botão de limpar */
        .btn-danger-mobile {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.1)) !important;
          color: #EF4444 !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
        }

        .btn-danger-mobile:active {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.2)) !important;
          transform: scale(0.98) !important;
        }

        /* Para o botão de copiar */
        .btn-copy-mobile {
          background: linear-gradient(135deg, rgba(255, 209, 102, 0.15), rgba(255, 209, 102, 0.1)) !important;
          color: #1A1C2E !important;
          border-color: rgba(255, 209, 102, 0.3) !important;
        }

        .btn-copy-mobile:active {
          background: linear-gradient(135deg, rgba(255, 209, 102, 0.25), rgba(255, 209, 102, 0.2)) !important;
          transform: scale(0.98) !important;
        }

        /* Botão do WhatsApp MOBILE */
        .btn-whatsapp {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.25);
          min-height: 52px;
        }

        .btn-whatsapp:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
        }

        .btn-whatsapp:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .whatsapp-text {
          font-size: 1.05rem;
          font-weight: 700;
        }

        /* Formulário de cliente MOBILE OPTIMIZED */
        .customer-form-container {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }

        .form-header {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .form-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1A1C2E;
          margin: 0 0 0.5rem 0;
        }

        .form-subtitle {
          font-size: 0.85rem;
          color: #64748B;
          margin: 0 0 1rem 0;
        }

        .progress-bar {
          height: 4px;
          background: #E2E8F0;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          transition: width 0.3s ease;
        }

        .form-section {
          margin-bottom: 1.5rem;
        }

        .form-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          color: #1A1C2E;
          margin-bottom: 1.25rem;
        }

        /* Aviso sobre prazo de entrega MOBILE */
        .delivery-deadline-notice {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 10px;
          border: 1px solid #F59E0B;
          margin-bottom: 1.25rem;
          align-items: flex-start;
        }

        .deadline-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .deadline-text {
          flex: 1;
          font-size: 0.85rem;
          line-height: 1.4;
          color: #92400E;
        }

        .deadline-text strong {
          color: #D97706;
        }

        .deadline-date {
          display: block;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(245, 158, 11, 0.3);
          font-size: 0.8rem;
        }

        /* Aviso sobre entrega no summary MOBILE */
        .delivery-warning-summary {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 10px;
          border: 1px solid #F59E0B;
          margin-top: 0.75rem;
          align-items: flex-start;
        }

        .warning-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .warning-text {
          flex: 1;
          font-size: 0.8rem;
          line-height: 1.3;
          color: #92400E;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          z-index: 1;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 0.875rem 0.875rem 3rem;
          border: 2px solid #E2E8F0;
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.2s ease;
          background: white;
          -webkit-appearance: none;
          appearance: none;
        }

        .form-input:focus {
          outline: none;
          border-color: #FFD166;
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.15);
        }

        .form-input::placeholder {
          color: #94A3B8;
          opacity: 0.8;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .form-group.half {
          flex: 1;
        }

        .price-summary-form {
          background: #F8FAFC;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          border: 1px solid #E2E8F0;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .price-row.delivery-fee {
          color: #10B981;
          font-weight: 600;
        }

        .price-row.delivery-total {
          color: #92400E;
          font-weight: 600;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #E2E8F0;
        }

        .price-row.total {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #E2E8F0;
          font-size: 1rem;
          font-weight: 700;
          color: #1A1C2E;
        }

        .price-value {
          font-weight: 600;
        }

        .price-value.delivery-total-value {
          color: #92400E;
          font-size: 0.95rem;
        }

        .price-value.total {
          color: #FFD166;
          font-size: 1.125rem;
        }

        .delivery-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .delivery-option {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          -webkit-tap-highlight-color: transparent;
        }

        .delivery-option:hover {
          background: #F1F5F9;
        }

        .delivery-option.selected {
          background: white;
          border-color: #FFD166;
          box-shadow: 0 4px 12px rgba(255, 209, 102, 0.15);
        }

        .option-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1A1C2E;
          flex-shrink: 0;
        }

        .option-content {
          flex: 1;
          min-width: 0;
        }

        .option-content h5 {
          font-size: 1rem;
          font-weight: 700;
          color: #1A1C2E;
          margin: 0 0 0.25rem 0;
        }

        .option-content p {
          font-size: 0.85rem;
          color: #64748B;
          margin: 0 0 0.5rem 0;
        }

        .option-price {
          margin-bottom: 0.5rem;
        }

        .fee-badge {
          display: inline-block;
          background: #10B981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .option-benefits {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: #64748B;
        }

        .check-icon {
          color: #10B981;
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
        }

        .address-form {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #E2E8F0;
        }

        .address-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          color: #1A1C2E;
          margin-bottom: 1rem;
        }

        .form-navigation {
          display: flex;
          gap: 0.75rem;
        }

        .form-navigation .btn {
          flex: 1;
          padding: 0.875rem;
          font-weight: 600;
          font-size: 0.95rem;
          min-height: 44px;
        }

        /* Informações do cliente preview MOBILE */
        .customer-info-preview {
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .info-header h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #1A1C2E;
          margin: 0;
        }

        .info-fields {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .info-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 24px;
        }

        .info-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748B;
          flex-shrink: 0;
        }

        .info-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1A1C2E;
          text-align: right;
          margin-left: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }

        .btn-edit-info {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 209, 102, 0.1);
          border: 1px solid #FFD166;
          border-radius: 8px;
          color: #1A1C2E;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 40px;
        }

        .btn-edit-info:hover {
          background: #FFD166;
        }

        /* Itens do carrinho MOBILE OPTIMIZED */
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cart-item-card {
          background: white;
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .cart-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }

        .item-image-wrapper {
          flex-shrink: 0;
        }

        .item-image {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .item-emoji {
          font-size: 2rem;
        }

        .item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          min-width: 0;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 700;
          color: #1A1C2E;
          margin: 0;
          line-height: 1.3;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .remove-item-btn {
          width: 30px;
          height: 30px;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          border-radius: 8px;
          color: #EF4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          padding: 0;
        }

        .remove-item-btn:hover {
          background: #EF4444;
          color: white;
          transform: scale(1.1);
        }

        .item-description {
          font-size: 0.85rem;
          color: #64748B;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-controls-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          gap: 1rem;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #F8FAFC;
          border-radius: 10px;
          padding: 0.25rem;
        }

        .qty-btn {
          width: 30px;
          height: 30px;
          border: none;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 600;
          color: #1A1C2E;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          padding: 0;
        }

        .qty-btn:hover {
          background: #FFD166;
          transform: scale(1.1);
        }

        .qty-btn.decrease:hover {
          background: #FECACA;
          color: #DC2626;
        }

        .qty-btn.increase:hover {
          background: #BBF7D0;
          color: #16A34A;
        }

        .qty-display {
          font-weight: 700;
          font-size: 0.95rem;
          min-width: 26px;
          text-align: center;
          color: #1A1C2E;
        }

        .item-price-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .item-price-unit {
          font-size: 0.8rem;
          color: #64748B;
        }

        .item-price-total {
          font-size: 1.125rem;
          font-weight: 800;
          color: #1A1C2E;
        }

        /* Resumo do pedido MOBILE */
        .cart-summary {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.04);
          margin-top: 0.5rem;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .summary-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1A1C2E;
          margin: 0;
        }

        .summary-arrow {
          color: #94A3B8;
        }

        .summary-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          min-height: 24px;
        }

        .summary-row.delivery-fee {
          color: #10B981;
          font-weight: 600;
        }

        .summary-row.delivery-total {
          color: #92400E;
          font-weight: 600;
        }

        .summary-label {
          font-size: 0.95rem;
          color: #64748B;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .summary-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1A1C2E;
        }

        .summary-value.delivery-total-value {
          color: #92400E;
          font-size: 0.9rem;
        }

        .summary-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #E2E8F0, transparent);
          margin: 0.5rem 0;
        }

        .summary-row.total {
          border-top: 2px solid #FFD166;
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }

        .total-label {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1A1C2E;
        }

        .total-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #FFD166;
        }

        /* Instruções MOBILE */
        .instructions-card {
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 14px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .instructions-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .instructions-icon {
          font-size: 1.25rem;
        }

        .instructions-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1A1C2E;
          margin: 0;
        }

        .instructions-steps {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .step-number {
          width: 26px;
          height: 26px;
          background: #FFD166;
          color: #1A1C2E;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .step-text {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.4;
          padding-top: 0.125rem;
        }

        .delivery-notice {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
          border-left: 4px solid #10B981;
        }

        .delivery-notice p {
          margin: 0;
          font-size: 0.85rem;
          color: #064E3B;
          line-height: 1.4;
        }

        .delivery-notice strong {
          color: #047857;
        }

        .delivery-warning {
          margin-top: 0.5rem !important;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(245, 158, 11, 0.3);
          color: #92400E !important;
        }

        /* Responsividade MOBILE FOCUSED */
        @media (max-width: 768px) {
          .cart-container {
            max-width: 100%;
          }
          
          .cart-header {
            padding: 0.875rem 1rem;
            min-height: 64px;
          }
          
          .cart-scroll {
            padding: 1rem;
            gap: 1rem;
          }
          
          .cart-item-card {
            flex-direction: row;
            padding: 1rem;
            gap: 0.875rem;
          }
          
          .item-image {
            width: 60px;
            height: 60px;
          }
          
          .item-emoji {
            font-size: 1.75rem;
          }
          
          .item-name {
            font-size: 0.95rem;
          }
          
          .item-price-total {
            font-size: 1rem;
          }
          
          .cart-actions {
            flex-direction: column;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .form-group.half {
            width: 100%;
          }
          
          .cart-summary {
            padding: 1.25rem;
          }
          
          .btn-whatsapp {
            padding: 0.875rem;
            font-size: 0.95rem;
            min-height: 48px;
          }
          
          .whatsapp-text {
            font-size: 1rem;
          }
          
          .customer-form-container {
            padding: 1.25rem;
          }
          
          .delivery-option {
            padding: 1rem;
          }
          
          .instructions-card {
            padding: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .cart-title {
            font-size: 1.125rem;
          }
          
          .header-icon {
            width: 36px;
            height: 36px;
          }
          
          .cart-subtitle {
            font-size: 0.75rem;
          }
          
          .close-cart {
            width: 36px;
            height: 36px;
          }
          
          .cart-item-card {
            padding: 0.875rem;
          }
          
          .item-image {
            width: 55px;
            height: 55px;
          }
          
          .item-emoji {
            font-size: 1.5rem;
          }
          
          .cart-summary {
            padding: 1rem;
          }
          
          .summary-title {
            font-size: 1.125rem;
          }
          
          .total-value {
            font-size: 1.25rem;
          }
          
          .btn-whatsapp {
            padding: 0.75rem;
            font-size: 0.9rem;
            min-height: 44px;
          }
          
          .whatsapp-text {
            font-size: 0.95rem;
          }
          
          .customer-form-container {
            padding: 1rem;
          }
          
          .delivery-option {
            padding: 0.875rem;
            gap: 0.75rem;
          }
          
          .option-icon {
            width: 40px;
            height: 40px;
          }
          
          .option-content h5 {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 360px) {
          .cart-header {
            padding: 0.75rem;
          }
          
          .cart-scroll {
            padding: 0.875rem;
          }
          
          .cart-item-card {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }
          
          .item-header {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .item-controls-wrapper {
            flex-direction: column;
            gap: 0.75rem;
            align-items: stretch;
          }
          
          .item-price-info {
            align-items: center;
          }
          
          .form-navigation {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }
        }

        /* Touch optimizations */
        @media (hover: none) and (pointer: coarse) {
          .cart-item-card:hover {
            transform: none;
          }
          
          .btn:hover, .action-btn:hover, .btn-whatsapp:hover, .btn-edit-info:hover {
            transform: none;
          }
          
          .qty-btn:hover {
            transform: none;
          }
          
          .remove-item-btn:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;