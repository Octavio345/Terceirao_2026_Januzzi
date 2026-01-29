import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X, ShoppingBag, Trash2, Plus, Minus, MessageCircle, Copy,
  Package, ShoppingCart, ChevronRight, User, Phone, Mail,
  MapPin, Home, School, Truck, CheckCircle, DollarSign, ArrowLeft,
  CreditCard, Wallet, Calculator, AlertCircle, Clock, Calendar
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CashWhatsAppHandler from '../CashWhatsAppHandler/CashWhatsAppHandler';

const DELIVERY_FEE = 3.00;

const PAYMENT_OPTIONS = [
  {
    id: 'pix',
    label: '💳 PIX',
    description: 'Pagamento instantâneo',
    icon: CreditCard,
    benefits: [
      'Sem taxas adicionais',
      'Pagamento instantâneo',
      'Mais seguro',
      'Comprovante automático'
    ]
  },
  {
    id: 'dinheiro',
    label: '💵 Dinheiro',
    description: 'Pagamento na entrega',
    icon: Wallet,
    benefits: [
      'Pague quando receber',
      'Sem necessidade de app',
      'Ideal para quem prefere cash',
      'Troco calculado automaticamente'
    ]
  }
];

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

  // Estados
  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('terceirao_customer_info');
      return saved ? JSON.parse(saved) : { name: '', phone: '', email: '' };
    } catch {
      return { name: '', phone: '', email: '' };
    }
  });

  const [deliveryOption, setDeliveryOption] = useState(() => {
    return localStorage.getItem('terceirao_delivery_option') || 'retirada';
  });

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('terceirao_delivery_address');
      return saved ? JSON.parse(saved) : {
        street: '', number: '', complement: '', neighborhood: '', reference: ''
      };
    } catch {
      return { street: '', number: '', complement: '', neighborhood: '', reference: '' };
    }
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('terceirao_payment_method') || 'pix';
  });

  const [cashAmount, setCashAmount] = useState(() => {
    return localStorage.getItem('terceirao_cash_amount') || '';
  });

  const [cashChange, setCashChange] = useState(0);
  const [cashValidationError, setCashValidationError] = useState('');

  const [subtotal, setSubtotal] = useState(0);
  const [totalWithDelivery, setTotalWithDelivery] = useState(0);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const [showCashWhatsAppHandler, setShowCashWhatsAppHandler] = useState(false);
  const [orderDataForWhatsApp, setOrderDataForWhatsApp] = useState(null);

  // =======================
  // DETECTAR RETORNO DO WHATSAPP
  // =======================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && showCashWhatsAppHandler) {
        setTimeout(() => {
          setShowCashWhatsAppHandler(false);
          setOrderDataForWhatsApp(null);
        }, 300);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [showCashWhatsAppHandler]);

  // =======================
  // UTILITÁRIOS
  // =======================
  const parseCashAmount = useCallback((value) => {
    if (!value) return 0;
    
    const clean = value.replace(/[^\d,]/g, '');
    if (!clean) return 0;

    if (!clean.includes(',')) {
      return parseFloat(clean) / 100;
    }

    const [inteiro, decimal = ''] = clean.split(',');
    const intPart = inteiro === '' ? '0' : inteiro;
    const decPart = decimal.padEnd(2, '0').slice(0, 2);
    
    return parseFloat(`${intPart}.${decPart}`) || 0;
  }, []);

  const formatCurrency = useCallback((value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  // Data de entrega
  const deliveryDate = useMemo(() => {
    if (deliveryOption !== 'entrega') return null;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    return tomorrow.toLocaleDateString('pt-BR', options);
  }, [deliveryOption]);

  // =======================
  // FORMATAR MENSAGEM WHATSAPP
  // =======================
  const formatWhatsAppMessage = useCallback((orderData) => {
    const {
      customerInfo,
      deliveryOption,
      deliveryAddress = {},
      deliveryDate = '',
      subtotal = 0,
      deliveryFee = 0,
      total = 0,
      paymentMethod,
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
    let paymentText = '';
    if (paymentMethod === 'dinheiro') {
      paymentText = `💵 *PAGAMENTO EM DINHEIRO*\n` +
        `💰 Valor total: ${formatBRL(total)}\n` +
        `💸 Valor em dinheiro: ${formatBRL(cashAmount)}\n` +
        (cashChange > 0 
          ? `🔄 Troco necessário: ${formatBRL(cashChange)}\n` 
          : `✅ Valor exato (sem troco)\n`);
    } else {
      paymentText = `💳 *PAGAMENTO POR PIX*\n` +
        `💰 Valor total: ${formatBRL(total)}\n` +
        `📱 Chave PIX será enviada após confirmação\n`;
    }

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
      `📞 *CONTATO*\n` +
      `Vendedor: Terceirão 2026\n` +
      `WhatsApp: (18) 99634-9330`;

    return message;
  }, []);

  // =======================
  // TOTAIS
  // =======================
  useEffect(() => {
    const sub = getCartTotal();
    setSubtotal(sub);
    setTotalWithDelivery(deliveryOption === 'entrega' ? sub + DELIVERY_FEE : sub);
  }, [cart, deliveryOption, getCartTotal]);

  // =======================
  // SALVAR NO LOCALSTORAGE
  // =======================
  useEffect(() => {
    localStorage.setItem('terceirao_customer_info', JSON.stringify(customerInfo));
  }, [customerInfo]);

  useEffect(() => {
    localStorage.setItem('terceirao_delivery_option', deliveryOption);
  }, [deliveryOption]);

  useEffect(() => {
    localStorage.setItem('terceirao_delivery_address', JSON.stringify(deliveryAddress));
  }, [deliveryAddress]);

  useEffect(() => {
    localStorage.setItem('terceirao_payment_method', paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    if (cashAmount) {
      localStorage.setItem('terceirao_cash_amount', cashAmount);
    }
  }, [cashAmount]);

  // =======================
  // TROCO
  // =======================
  useEffect(() => {
    if (paymentMethod !== 'dinheiro') {
      setCashChange(0);
      setCashValidationError('');
      return;
    }

    if (!cashAmount || cashAmount.trim() === '') {
      setCashChange(0);
      setCashValidationError('');
      return;
    }

    const cash = parseCashAmount(cashAmount);

    if (isNaN(cash) || cash <= 0) {
      setCashChange(0);
      setCashValidationError('Digite um valor válido');
      return;
    }

    if (cash < totalWithDelivery) {
      setCashChange(0);
      setCashValidationError(
        `Falta ${formatCurrency(totalWithDelivery - cash)}`
      );
      return;
    }

    setCashValidationError('');
    setCashChange(parseFloat((cash - totalWithDelivery).toFixed(2)));
  }, [cashAmount, totalWithDelivery, paymentMethod, parseCashAmount, formatCurrency]);

  // =======================
  // VALIDAÇÃO PARA UI
  // =======================
  const isFormValid = useMemo(() => {
    // Dados básicos
    if (!customerInfo.name?.trim() || !customerInfo.phone?.trim()) return false;

    // Validação de telefone
    const phoneDigits = customerInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) return false;

    // Endereço se for entrega
    if (deliveryOption === 'entrega') {
      if (!deliveryAddress.street?.trim() || 
          !deliveryAddress.number?.trim() || 
          !deliveryAddress.neighborhood?.trim()) {
        return false;
      }
    }

    // Dinheiro
    if (paymentMethod === 'dinheiro') {
      const cash = parseCashAmount(cashAmount);
      if (!cash || cash < totalWithDelivery) return false;
    }

    return true;
  }, [
    customerInfo,
    deliveryOption,
    deliveryAddress,
    paymentMethod,
    cashAmount,
    totalWithDelivery,
    parseCashAmount
  ]);

  // =======================
  // FUNÇÕES HANDLERS
  // =======================
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      let formatted = value.replace(/\D/g, '');
      formatted = formatted.substring(0, 11);
      
      if (formatted.length > 2) {
        formatted = `(${formatted.substring(0, 2)}) ${formatted.substring(2)}`;
      }
      if (formatted.length > 10) {
        formatted = `${formatted.substring(0, 10)}-${formatted.substring(10)}`;
      }
      
      setCustomerInfo(prev => ({ ...prev, [name]: formatted }));
    } else {
      setCustomerInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryOptionChange = (option) => {
    setDeliveryOption(option);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method !== 'dinheiro') {
      setCashAmount('');
      setCashValidationError('');
      setCashChange(0);
    }
  };

  const handleCashAmountChange = (e) => {
    const value = e.target.value;
    
    let numbers = value.replace(/\D/g, '');
    numbers = numbers.substring(0, 10);
    
    if (!numbers) {
      setCashAmount('');
      return;
    }
    
    const amount = parseInt(numbers, 10) / 100;
    
    const formatted = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    setCashAmount(formatted);
  };

  const handleCashAmountBlur = () => {
    if (cashAmount) {
      const cash = parseCashAmount(cashAmount);
      if (!isNaN(cash) && cash > 0) {
        setCashAmount(cash.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }));
      }
    }
  };

  const handleQuickCashSuggestion = (suggestion) => {
    let amount = totalWithDelivery;
    
    switch(suggestion) {
      case 'exact':
        amount = totalWithDelivery;
        break;
      case 'round-up':
        amount = Math.ceil(totalWithDelivery);
        break;
      case '+5':
        amount = Math.ceil(totalWithDelivery) + 5;
        break;
      case '+10':
        amount = Math.ceil(totalWithDelivery) + 10;
        break;
      default:
        amount = totalWithDelivery;
    }
    
    setCashAmount(amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
    setCashValidationError('');
  };

  // =======================
  // VALIDAÇÃO COMPLETA
  // =======================
  const validateForm = useCallback(() => {
    // Nome
    if (!customerInfo.name?.trim()) {
      alert('Por favor, informe seu nome completo.');
      return false;
    }

    // Telefone
    const phoneDigits = customerInfo.phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      alert('Por favor, informe um telefone válido com DDD.');
      return false;
    }

    // Endereço para entrega
    if (deliveryOption === 'entrega') {
      if (!deliveryAddress.street?.trim()) {
        alert('Por favor, informe a rua/avenida do endereço.');
        return false;
      }
      if (!deliveryAddress.number?.trim()) {
        alert('Por favor, informe o número do endereço.');
        return false;
      }
      if (!deliveryAddress.neighborhood?.trim()) {
        alert('Por favor, informe o bairro do endereço.');
        return false;
      }
    }

    // Dinheiro
    if (paymentMethod === 'dinheiro') {
      const cash = parseCashAmount(cashAmount);
      if (!cash || cash <= 0) {
        alert('Por favor, informe o valor em dinheiro.');
        setCashValidationError('Informe o valor em dinheiro');
        return false;
      }
      
      if (cash < totalWithDelivery) {
        const missing = formatCurrency(totalWithDelivery - cash);
        alert(`Valor insuficiente! Adicione mais ${missing}`);
        setCashValidationError(`Falta ${missing}`);
        return false;
      }
    }

    return true;
  }, [customerInfo, deliveryOption, deliveryAddress, paymentMethod, cashAmount, totalWithDelivery, parseCashAmount, formatCurrency]);

  // =======================
  // FINALIZAR PEDIDO
  // =======================
  const handleFinalizeOrder = () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    if (!validateForm()) {
      setShowCustomerForm(true);
      setFormStep(2);
      
      setTimeout(() => {
        const formContainer = document.querySelector('.customer-form-container');
        if (formContainer) {
          formContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
      return;
    }

    const orderData = {
      customerInfo: {
        ...customerInfo,
        phone: customerInfo.phone.replace(/\D/g, '')
      },
      deliveryOption,
      deliveryAddress: deliveryOption === 'entrega' ? deliveryAddress : {},
      deliveryDate,
      subtotal,
      deliveryFee: deliveryOption === 'entrega' ? DELIVERY_FEE : 0,
      total: totalWithDelivery,
      paymentMethod,
      cashAmount: paymentMethod === 'dinheiro' ? parseCashAmount(cashAmount) : 0,
      cashChange: paymentMethod === 'dinheiro' ? cashChange : 0,
      items: [...cart]
    };

    try {
      if (paymentMethod === 'pix') {
        createOrder(orderData);
      } else {
        // Formatar a mensagem corretamente
        const whatsAppMessage = formatWhatsAppMessage(orderData);
        
        // Criar URL do WhatsApp
        const phoneNumber = "5518996349330";
        const encodedMessage = encodeURIComponent(whatsAppMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Limpar carrinho e abrir WhatsApp
        clearCart();
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    }
  };

  // =======================
  // COPIA DO PEDIDO
  // =======================
  const handleCopyOrderWithInfo = () => {
    if (!isFormValid) {
      alert('Por favor, preencha todos os dados obrigatórios primeiro.');
      return;
    }

    const orderData = {
      customerInfo: {
        ...customerInfo,
        phone: customerInfo.phone.replace(/\D/g, '')
      },
      deliveryOption,
      deliveryAddress: deliveryOption === 'entrega' ? deliveryAddress : {},
      deliveryDate,
      subtotal,
      deliveryFee: deliveryOption === 'entrega' ? DELIVERY_FEE : 0,
      total: totalWithDelivery,
      paymentMethod,
      cashAmount: paymentMethod === 'dinheiro' ? parseCashAmount(cashAmount) : 0,
      cashChange: paymentMethod === 'dinheiro' ? cashChange : 0,
      items: [...cart]
    };

    const orderText = formatWhatsAppMessage(orderData);

    navigator.clipboard.writeText(orderText)
      .then(() => {
        alert('✅ Pedido copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar: ', err);
        alert('❌ Erro ao copiar pedido. Tente novamente.');
      });
  };

  // =======================
  // VIEW PRODUCTS
  // =======================
  const handleViewProducts = () => {
    toggleCart();
    
    setTimeout(() => {
      const productsSection = document.querySelector('#produtos, .products-section, section[data-products]');
      
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        
        productsSection.style.transition = 'box-shadow 0.3s ease';
        productsSection.style.boxShadow = '0 0 0 4px rgba(255, 209, 102, 0.4)';
        
        setTimeout(() => {
          productsSection.style.boxShadow = '';
        }, 1500);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 300);
  };

  // =======================
  // FUNÇÃO PARA FECHAR WHATSAPP HANDLER
  // =======================
  const handleCloseWhatsAppHandler = () => {
    setShowCashWhatsAppHandler(false);
    setOrderDataForWhatsApp(null);
  };

  // =======================
  // RENDER FORM STEPS
  // =======================
  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <>
            <div className="form-section">
              <h4 className="form-section-title">
                <User size={20} />
                Dados Pessoais
              </h4>
              <p className="form-instruction">
                Preencha seus dados para finalizar o pedido
              </p>
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
                    maxLength={50}
                    required
                  />
                  <div className="char-counter">
                    {customerInfo.name.length}/50
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-icon">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(11) 99999-9999 *"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className="form-input"
                    maxLength={15}
                    required
                  />
                  <div className="input-hint">
                    WhatsApp para contato
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com (opcional)"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className="form-input"
                    maxLength={100}
                  />
                  <div className="input-hint">
                    Para receber atualizações
                  </div>
                </div>
              </div>
            </div>

            <div className="form-navigation">
              <button
                className="btn btn-secondary btn-full"
                onClick={() => setShowCustomerForm(false)}
                type="button"
              >
                <ArrowLeft size={18} />
                <span>Voltar ao Carrinho</span>
              </button>
              <button
                className="btn btn-primary btn-full"
                onClick={() => setFormStep(2)}
                disabled={!customerInfo.name.trim() || !customerInfo.phone.replace(/\D/g, '').length >= 10}
                type="button"
              >
                <span>Continuar</span>
                <ChevronRight size={18} />
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
                Entrega e Pagamento
              </h4>

              {/* Aviso de Entrega */}
              {deliveryOption === 'entrega' && (
                <div className="info-card warning">
                  <AlertCircle size={18} />
                  <div>
                    <strong>Entrega no dia seguinte</strong>
                    <p>Pedidos com entrega são processados no próximo dia útil após confirmação do pagamento.</p>
                    {deliveryDate && (
                      <div className="delivery-date-info">
                        <Calendar size={14} />
                        <span>Previsão: <strong>{deliveryDate}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="price-summary-card">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span className="price-value">{formatCurrency(subtotal)}</span>
                </div>
                
                {deliveryOption === 'entrega' && (
                  <div className="price-row accent">
                    <span>
                      <Truck size={14} />
                      Taxa de entrega
                    </span>
                    <span className="price-value accent">+ {formatCurrency(DELIVERY_FEE)}</span>
                  </div>
                )}
                
                <div className="price-divider"></div>
                
                <div className="price-row total">
                  <span>Total a pagar</span>
                  <span className="price-value total">{formatCurrency(totalWithDelivery)}</span>
                </div>
              </div>

              {/* Opções de Entrega */}
              <div className="section-title-sm">
                <span className="section-icon">📍</span>
                <span>Como você prefere receber?</span>
              </div>
              
              <div className="delivery-options-grid">
                <div
                  className={`delivery-option-card ${deliveryOption === 'retirada' ? 'selected' : ''}`}
                  onClick={() => handleDeliveryOptionChange('retirada')}
                >
                  <div className="option-icon">
                    <School size={24} />
                  </div>
                  <div className="option-content">
                    <h5>Retirada na Escola</h5>
                    <p className="option-desc">Busque seu pedido na escola</p>
                    <div className="option-price-badge">
                      <span>GRÁTIS</span>
                    </div>
                    <div className="option-details">
                      <div className="detail-item">
                        <Clock size={12} />
                        <span>Horários disponíveis:</span>
                      </div>
                      <div className="time-slots">
                        <span className="time-slot">Manhã: 09:30-09:45</span>
                        <span className="time-slot">Manhã: 11:25-12:25</span>
                        <span className="time-slot">Tarde: 15:55-16:10</span>
                        <span className="time-slot">Noite: 18:40-19:40</span>
                      </div>
                    </div>
                  </div>
                  {deliveryOption === 'retirada' && (
                    <CheckCircle size={20} className="option-check" />
                  )}
                </div>

                <div
                  className={`delivery-option-card ${deliveryOption === 'entrega' ? 'selected' : ''}`}
                  onClick={() => handleDeliveryOptionChange('entrega')}
                >
                  <div className="option-icon">
                    <Home size={24} />
                  </div>
                  <div className="option-content">
                    <h5>Entrega em Casa</h5>
                    <p className="option-desc">Receba no conforto do seu lar</p>
                    <div className="option-price-badge fee">
                      <span>+ {formatCurrency(DELIVERY_FEE)}</span>
                    </div>
                    <div className="option-details">
                      <div className="detail-item">
                        <Calendar size={12} />
                        <span>Próximo dia útil</span>
                      </div>
                      <div className="detail-item">
                        <Truck size={12} />
                        <span>Entrega rápida e segura</span>
                      </div>
                    </div>
                  </div>
                  {deliveryOption === 'entrega' && (
                    <CheckCircle size={20} className="option-check" />
                  )}
                </div>
              </div>

              {/* Formulário de Endereço */}
              {deliveryOption === 'entrega' && (
                <div className="address-section">
                  <div className="section-title-sm">
                    <span className="section-icon">🏠</span>
                    <span>Endereço de Entrega</span>
                  </div>
                  
                  <div className="address-form-grid">
                    <div className="form-group">
                      <label>Rua/Avenida *</label>
                      <input
                        type="text"
                        name="street"
                        placeholder="Ex: Rua das Flores"
                        value={deliveryAddress.street}
                        onChange={handleAddressChange}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Número *</label>
                        <input
                          type="text"
                          name="number"
                          placeholder="Ex: 123"
                          value={deliveryAddress.number}
                          onChange={handleAddressChange}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Complemento</label>
                        <input
                          type="text"
                          name="complement"
                          placeholder="Ex: Apt 45, Bloco B"
                          value={deliveryAddress.complement}
                          onChange={handleAddressChange}
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Bairro *</label>
                      <input
                        type="text"
                        name="neighborhood"
                        placeholder="Ex: Centro"
                        value={deliveryAddress.neighborhood}
                        onChange={handleAddressChange}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Ponto de referência</label>
                      <input
                        type="text"
                        name="reference"
                        placeholder="Ex: Próximo ao mercado"
                        value={deliveryAddress.reference}
                        onChange={handleAddressChange}
                        className="form-input"
                      />
                      <div className="input-hint">
                        Opcional, mas ajuda na entrega
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Forma de Pagamento */}
              <div className="payment-section">
                <div className="section-title-sm">
                  <span className="section-icon">💳</span>
                  <span>Forma de Pagamento</span>
                </div>
                
                <div className="payment-options-grid">
                  {PAYMENT_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className={`payment-option-card ${paymentMethod === option.id ? 'selected' : ''}`}
                      onClick={() => handlePaymentMethodChange(option.id)}
                    >
                      <div className="payment-icon-wrapper">
                        <option.icon size={28} className="payment-icon" />
                      </div>
                      
                      <div className="payment-content">
                        <div className="payment-header">
                          <h5 className="payment-title">{option.label}</h5>
                          {paymentMethod === option.id && (
                            <CheckCircle size={18} className="payment-check" />
                          )}
                        </div>
                        
                        <p className="payment-desc">{option.description}</p>
                        
                        <div className="benefits-list">
                          {option.benefits.map((benefit, index) => (
                            <div key={index} className="benefit-item">
                              <CheckCircle size={12} />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Campo para valor em dinheiro */}
                {paymentMethod === 'dinheiro' && (
                  <div className="cash-section">
                    <div className="cash-header">
                      <div className="cash-title-wrapper">
                        <Calculator size={20} />
                        <div>
                          <h5>Pagamento em dinheiro</h5>
                          <p className="cash-subtitle">
                            Informe o valor para calcularmos o troco
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cash-input-container">
                      <div className="cash-input-group">
                        <span className="cash-prefix">R$</span>
                        <input
                          type="text"
                          placeholder="0,00"
                          value={cashAmount}
                          onChange={handleCashAmountChange}
                          onBlur={handleCashAmountBlur}
                          className="cash-input"
                          inputMode="decimal"
                          autoComplete="off"
                        />
                      </div>
                      
                      {/* Mensagem de erro */}
                      {cashValidationError && (
                        <div className="cash-error-message">
                          <AlertCircle size={16} />
                          <span>{cashValidationError}</span>
                        </div>
                      )}
                      
                      {/* Sugestões rápidas */}
                      <div className="cash-suggestions">
                        <p className="suggestions-title">Sugestões rápidas:</p>
                        <div className="suggestion-buttons">
                          <button
                            type="button"
                            className="suggestion-btn exact"
                            onClick={() => handleQuickCashSuggestion('exact')}
                          >
                            Valor exato
                          </button>
                          <button
                            type="button"
                            className="suggestion-btn"
                            onClick={() => handleQuickCashSuggestion('round-up')}
                          >
                            Arredondar
                          </button>
                          <button
                            type="button"
                            className="suggestion-btn"
                            onClick={() => handleQuickCashSuggestion('+5')}
                          >
                            + R$ 5,00
                          </button>
                          <button
                            type="button"
                            className="suggestion-btn"
                            onClick={() => handleQuickCashSuggestion('+10')}
                          >
                            + R$ 10,00
                          </button>
                        </div>
                      </div>
                      
                      {/* Resumo do cálculo */}
                      <div className="cash-summary">
                        <div className="summary-row">
                          <span>Total a pagar:</span>
                          <span className="summary-value">{formatCurrency(totalWithDelivery)}</span>
                        </div>
                        
                        {cashAmount && (
                          <>
                            <div className="summary-row">
                              <span>Valor informado:</span>
                              <span className="summary-value given">
                                {formatCurrency(parseCashAmount(cashAmount))}
                              </span>
                            </div>
                            
                            <div className="summary-divider-light"></div>
                            
                            <div className="summary-row change-row">
                              <span>Troco necessário:</span>
                              <span className={`summary-value change ${cashChange > 0 ? 'positive' : 'exact'}`}>
                                {cashChange > 0 ? formatCurrency(cashChange) : '✅ Valor exato'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-navigation">
              <button
                className="btn btn-secondary btn-full"
                onClick={() => setFormStep(1)}
                type="button"
              >
                <ArrowLeft size={18} />
                <span>Voltar</span>
              </button>
              <button
                className="btn btn-primary btn-full"
                onClick={handleFinalizeOrder}
                disabled={!isFormValid}
                type="button"
              >
                {paymentMethod === 'pix' ? (
                  <>
                    <CreditCard size={18} />
                    <span>Finalizar com PIX</span>
                  </>
                ) : (
                  <>
                    <MessageCircle size={18} />
                    <span>Enviar para WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // =======================
  // RENDER CONDICIONAL
  // =======================
  if (!isCartOpen) return null;

  if (showCashWhatsAppHandler && orderDataForWhatsApp) {
    return (
      <div className="cart-overlay" onClick={handleCloseWhatsAppHandler}>
        <div className="cart-container" onClick={e => e.stopPropagation()}>
          <div className="whatsapp-handler-wrapper">
            <CashWhatsAppHandler
              orderData={orderDataForWhatsApp}
              vendorWhatsApp="5518996349330"
              onClose={handleCloseWhatsAppHandler}
            />
          </div>
        </div>
      </div>
    );
  }

  // =======================
  // RENDER PRINCIPAL
  // =======================
  return (
    <div className="cart-overlay" onClick={toggleCart}>
      <div className="cart-container" onClick={e => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="cart-header">
          <div className="header-content">
            <div className="header-icon-wrapper">
              <ShoppingCart size={24} />
              <div className="cart-badge">{getCartCount()}</div>
            </div>
            <div className="header-text">
              <h2 className="cart-title">Meu Carrinho</h2>
              <p className="cart-subtitle">
                {getCartCount()} {getCartCount() === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>
          <button
            className="close-button"
            onClick={toggleCart}
            aria-label="Fechar carrinho"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="cart-scroll-area">
          <div className="cart-content">
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Package size={64} />
                </div>
                <h3 className="empty-title">Carrinho vazio</h3>
                <p className="empty-description">
                  Adicione produtos deliciosos para começar suas compras
                </p>
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleViewProducts}
                  type="button"
                >
                  <ShoppingBag size={20} />
                  <span>Ver Produtos Disponíveis</span>
                </button>
              </div>
            ) : (
              <>
                {/* Formulário do Cliente */}
                {showCustomerForm && (
                  <div className="form-container">
                    <div className="form-progress">
                      <div className="progress-steps">
                        <div className={`step ${formStep >= 1 ? 'active' : ''}`}>
                          <div className="step-number">1</div>
                          <span className="step-label">Dados</span>
                        </div>
                        <div className="step-connector"></div>
                        <div className={`step ${formStep >= 2 ? 'active' : ''}`}>
                          <div className="step-number">2</div>
                          <span className="step-label">Entrega</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-wrapper">
                      {renderFormStep()}
                    </div>
                  </div>
                )}

                {/* Lista de Itens */}
                {!showCustomerForm && (
                  <div className="items-section">
                    <div className="section-header">
                      <h3 className="section-title">Seus Itens</h3>
                      <button
                        className="btn-clear-all"
                        onClick={clearCart}
                        type="button"
                      >
                        <Trash2 size={16} />
                        <span>Limpar Tudo</span>
                      </button>
                    </div>
                    
                    <div className="items-list">
                      {cart.map(item => (
                        <div key={item.id} className="cart-item">
                          <div className="item-image">
                            <span className="item-emoji">{item.emoji || '📦'}</span>
                          </div>
                          
                          <div className="item-details">
                            <div className="item-header">
                              <h4 className="item-name">{item.name}</h4>
                              <button
                                className="btn-remove"
                                onClick={() => removeFromCart(item.id)}
                                type="button"
                                aria-label="Remover item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            {item.description && (
                              <p className="item-desc">{item.description}</p>
                            )}
                            
                            <div className="item-footer">
                              <div className="quantity-control">
                                <button
                                  className="qty-btn minus"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  type="button"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="qty-value">{item.quantity}</span>
                                <button
                                  className="qty-btn plus"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  type="button"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              
                              <div className="item-pricing">
                                <span className="unit-price">
                                  {formatCurrency(item.price)}/un
                                </span>
                                <span className="total-price">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Resumo e Ações */}
          {cart.length > 0 && !showCustomerForm && (
            <div className="summary-section">
              <div className="summary-card">
                <div className="summary-header">
                  <h3 className="summary-title">Resumo do Pedido</h3>
                  <ChevronRight size={20} />
                </div>
                
                <div className="summary-body">
                  <div className="summary-row">
                    <span>Itens ({getCartCount()})</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {deliveryOption === 'entrega' && (
                    <div className="summary-row delivery">
                      <span>
                        <Truck size={14} />
                        Entrega
                      </span>
                      <span className="delivery-fee">+ {formatCurrency(DELIVERY_FEE)}</span>
                    </div>
                  )}
                  
                  <div className="summary-row payment-info">
                    <span>
                      {paymentMethod === 'pix' ? <CreditCard size={14} /> : <Wallet size={14} />}
                      Pagamento
                    </span>
                    <span className="payment-method">
                      {paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}
                    </span>
                  </div>
                  
                  {paymentMethod === 'dinheiro' && cashAmount && (
                    <>
                      <div className="summary-row cash-info">
                        <span>Valor em dinheiro</span>
                        <span>{formatCurrency(parseCashAmount(cashAmount))}</span>
                      </div>
                      
                      {cashChange > 0 && (
                        <div className="summary-row change-info">
                          <span>Troco necessário</span>
                          <span className="change-amount">
                            {formatCurrency(cashChange)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span className="total-amount">
                      {formatCurrency(totalWithDelivery)}
                    </span>
                  </div>
                </div>
                
                {/* Preview dos Dados */}
                <div className="customer-preview">
                  <div className="preview-header">
                    <User size={18} />
                    <h4>Seus Dados</h4>
                  </div>
                  <div className="preview-info">
                    <div className="info-row">
                      <span className="info-label">Nome:</span>
                      <span className="info-value">
                        {customerInfo.name || 'Não informado'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Telefone:</span>
                      <span className="info-value">
                        {customerInfo.phone || 'Não informado'}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Entrega:</span>
                      <span className="info-value">
                        {deliveryOption === 'retirada' ? (
                          <>
                            <School size={14} />
                            <span>Retirada</span>
                          </>
                        ) : (
                          <>
                            <Home size={14} />
                            <span>Entrega (+{formatCurrency(DELIVERY_FEE)})</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Pagamento:</span>
                      <span className="info-value">
                        {paymentMethod === 'pix' ? (
                          <>
                            <CreditCard size={14} />
                            <span>PIX</span>
                          </>
                        ) : (
                          <>
                            <Wallet size={14} />
                            <span>Dinheiro</span>
                            {cashAmount && (
                              <span className="cash-amount">
                                ({formatCurrency(parseCashAmount(cashAmount))})
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    className="btn-edit-data"
                    onClick={() => {
                      setShowCustomerForm(true);
                      setFormStep(1);
                    }}
                    type="button"
                  >
                    {customerInfo.name ? 'Editar dados' : 'Adicionar dados'}
                  </button>
                </div>
              </div>
              
              {/* Ações do Carrinho */}
              <div className="action-buttons">
                <div className="action-row">
                  <button
                    className="btn btn-secondary btn-action"
                    onClick={handleCopyOrderWithInfo}
                    disabled={!isFormValid}
                    type="button"
                  >
                    <Copy size={20} />
                    <span>Copiar Pedido</span>
                  </button>
                  
                  <button
                    className="btn btn-primary btn-action"
                    onClick={handleFinalizeOrder}
                    disabled={!isFormValid}
                    type="button"
                  >
                    {paymentMethod === 'pix' ? (
                      <>
                        <CreditCard size={20} />
                        <span>Finalizar com PIX</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle size={20} />
                        <span>Enviar para WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="instructions">
                  <div className="instructions-header">
                    <span className="instructions-icon">📋</span>
                    <h4>Como funciona</h4>
                  </div>
                  <ol className="steps-list">
                    <li className="step">
                      <span className="step-num">1</span>
                      <span>Preencha seus dados e escolha a entrega</span>
                    </li>
                    <li className="step">
                      <span className="step-num">2</span>
                      <span>Escolha a forma de pagamento</span>
                    </li>
                    <li className="step">
                      <span className="step-num">3</span>
                      <span>
                        {paymentMethod === 'pix' 
                          ? 'Faça o pagamento PIX e anexe o comprovante' 
                          : 'Prepare o valor em dinheiro com o troco necessário'}
                      </span>
                    </li>
                    <li className="step">
                      <span className="step-num">4</span>
                      <span>
                        {paymentMethod === 'pix' 
                          ? 'Aguarde a confirmação do seu pedido' 
                          : 'Envie o pedido pelo WhatsApp para confirmar'}
                      </span>
                    </li>
                  </ol>
                  
                  {deliveryOption === 'entrega' && (
                    <div className="delivery-notice">
                      <AlertCircle size={16} />
                      <p>
                        <strong>Entrega:</strong> Realizada apenas no dia seguinte 
                        ao pagamento confirmado.
                      </p>
                    </div>
                  )}
                  
                  {paymentMethod === 'dinheiro' && (
                    <div className="cash-notice">
                      <Wallet size={16} />
                      <p>
                        <strong>Dinheiro:</strong> Certifique-se de ter o valor 
                        correto para pagamento na retirada/entrega.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      <style jsx>{`
        /* ==================== */
        /* VARIÁVEIS E RESET */
        /* ==================== */
        :global(*) {
          box-sizing: border-box;
        }
        
        .cart-overlay {
          --primary: #FFD166;
          --primary-dark: #E5BC59;
          --secondary: #3B82F6;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --light: #F8FAFC;
          --dark: #1A1C2E;
          --gray-100: #F1F5F9;
          --gray-200: #E2E8F0;
          --gray-300: #CBD5E1;
          --gray-400: #94A3B8;
          --gray-500: #64748B;
          --gray-600: #475569;
          --gray-700: #334155;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
          --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* ==================== */
        /* OVERLAY E CONTAINER */
        /* ==================== */
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
          animation: overlayIn 0.3s ease;
        }
        
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .cart-container {
          width: 100%;
          max-width: 480px;
          height: 100%;
          background: linear-gradient(180deg, #FFFFFF 0%, var(--light) 100%);
          display: flex;
          flex-direction: column;
          animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
        }
        
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        /* ==================== */
        /* WHATSAPP HANDLER WRAPPER */
        /* ==================== */
        .whatsapp-handler-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        /* ==================== */
        /* CABEÇALHO */
        /* ==================== */
        .cart-header {
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, var(--dark) 0%, #2D3047 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }
        
        .header-icon-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 22px;
          height: 22px;
          background: var(--primary);
          color: var(--dark);
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0 6px;
          border: 2px solid var(--dark);
        }
        
        .header-text {
          flex: 1;
          min-width: 0;
        }
        
        .cart-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          line-height: 1.2;
          background: linear-gradient(135deg, var(--primary) 0%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .cart-subtitle {
          font-size: 0.875rem;
          opacity: 0.9;
          margin: 0.25rem 0 0 0;
          font-weight: 500;
          color: var(--gray-300);
        }
        
        .close-button {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          flex-shrink: 0;
          margin-left: 0.5rem;
          padding: 0;
        }
        
        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }
        
        /* ==================== */
        /* ÁREA DE ROLAGEM */
        /* ==================== */
        .cart-scroll-area {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .cart-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        /* ==================== */
        /* ESTADO VAZIO */
        /* ==================== */
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        
        .empty-icon {
          width: 96px;
          height: 96px;
          background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .empty-icon svg {
          color: var(--gray-400);
          opacity: 0.8;
        }
        
        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 0.75rem 0;
        }
        
        .empty-description {
          font-size: 1rem;
          color: var(--gray-500);
          margin: 0 0 2rem 0;
          max-width: 280px;
          line-height: 1.5;
        }
        
        /* ==================== */
        /* BOTÕES GERAIS */
        /* ==================== */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition);
          border: 2px solid transparent;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          min-height: 48px;
          width: 100%;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .btn svg {
          flex-shrink: 0;
        }
        
        .btn span {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .btn-secondary {
          background: var(--gray-100);
          color: var(--dark);
          border-color: var(--gray-200);
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: var(--gray-200);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: var(--dark);
          font-weight: 700;
          border: none;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 209, 102, 0.3);
        }
        
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        
        .btn-large {
          padding: 1rem 1.75rem;
          font-size: 1.125rem;
          min-height: 56px;
        }
        
        .btn-full {
          width: 100%;
        }
        
        .btn-action {
          flex: 1;
          min-width: 0;
        }
        
        /* ==================== */
        /* LISTA DE ITENS */
        /* ==================== */
        .items-section {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        
        .section-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }
        
        .btn-clear-all {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-sm);
          color: var(--danger);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .btn-clear-all:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        
        .items-list {
          padding: 1rem;
        }
        
        .cart-item {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: white;
          border-radius: var(--radius-md);
          margin-bottom: 0.75rem;
          border: 1px solid var(--gray-200);
          transition: var(--transition);
        }
        
        .cart-item:last-child {
          margin-bottom: 0;
        }
        
        .cart-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }
        
        .item-image {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .item-emoji {
          font-size: 2rem;
        }
        
        .item-details {
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
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
          line-height: 1.3;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-height: 2.6em;
        }
        
        .btn-remove {
          width: 32px;
          height: 32px;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--danger);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          flex-shrink: 0;
          padding: 0;
        }
        
        .btn-remove:hover {
          background: var(--danger);
          color: white;
          transform: scale(1.1);
        }
        
        .item-desc {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .item-footer {
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
          background: var(--gray-100);
          border-radius: var(--radius-md);
          padding: 0.25rem;
        }
        
        .qty-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: white;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 600;
          color: var(--dark);
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          padding: 0;
        }
        
        .qty-btn:hover:not(:disabled) {
          transform: scale(1.1);
        }
        
        .qty-btn.minus:hover:not(:disabled) {
          background: #FECACA;
          color: #DC2626;
        }
        
        .qty-btn.plus:hover:not(:disabled) {
          background: #BBF7D0;
          color: #16A34A;
        }
        
        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .qty-value {
          font-weight: 700;
          font-size: 1rem;
          min-width: 28px;
          text-align: center;
          color: var(--dark);
        }
        
        .item-pricing {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          flex-shrink: 0;
        }
        
        .unit-price {
          font-size: 0.875rem;
          color: var(--gray-500);
        }
        
        .total-price {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        /* ==================== */
        /* FORMULÁRIO */
        /* ==================== */
        .form-container {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        
        .form-progress {
          padding: 1.5rem 1.5rem 1rem;
          background: linear-gradient(135deg, var(--dark) 0%, #2D3047 100%);
        }
        
        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .step-number {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          transition: var(--transition);
        }
        
        .step.active .step-number {
          background: var(--primary);
          color: var(--dark);
          box-shadow: 0 0 0 4px rgba(255, 209, 102, 0.3);
        }
        
        .step-label {
          font-size: 0.875rem;
          color: var(--gray-300);
          font-weight: 500;
          transition: var(--transition);
        }
        
        .step.active .step-label {
          color: var(--primary);
          font-weight: 600;
        }
        
        .step-connector {
          width: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.2);
          margin: 0 0.5rem;
        }
        
        .form-wrapper {
          padding: 1.5rem;
        }
        
        .form-section {
          margin-bottom: 1.5rem;
        }
        
        .form-section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          color: var(--dark);
          margin: 0 0 1rem 0;
        }
        
        .form-instruction {
          color: var(--gray-500);
          font-size: 0.95rem;
          margin: 0 0 1.5rem 0;
          line-height: 1.5;
        }
        
        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-group {
          position: relative;
        }
        
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-600);
          margin-bottom: 0.5rem;
        }
        
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-400);
          z-index: 1;
        }
        
        .form-input {
          width: 100%;
          padding: 0.875rem 0.875rem 0.875rem 3rem;
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-family: inherit;
          transition: var(--transition);
          background: white;
          -webkit-appearance: none;
          appearance: none;
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.15);
        }
        
        .form-input::placeholder {
          color: var(--gray-400);
          opacity: 0.8;
        }
        
        .char-counter {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          color: var(--gray-400);
        }
        
        .input-hint {
          font-size: 0.75rem;
          color: var(--gray-400);
          margin-top: 0.25rem;
          font-style: italic;
        }
        
        .form-navigation {
          display: flex;
          gap: 0.75rem;
          margin-top: 2rem;
        }
        
        /* ==================== */
        /* CARDS DE INFORMAÇÃO */
        /* ==================== */
        .info-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--gray-100);
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          border-left: 4px solid var(--warning);
        }
        
        .info-card.warning {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: var(--warning);
        }
        
        .info-card svg {
          color: var(--warning);
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .info-card strong {
          display: block;
          color: var(--gray-700);
          margin-bottom: 0.25rem;
        }
        
        .info-card p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--gray-600);
          line-height: 1.4;
        }
        
        .delivery-date-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(245, 158, 11, 0.3);
          font-size: 0.875rem;
          color: var(--gray-700);
        }
        
        /* ==================== */
        /* RESUMO FINANCEIRO */
        /* ==================== */
        .price-summary-card {
          background: white;
          border-radius: var(--radius-md);
          padding: 1.5rem;
          border: 1px solid var(--gray-200);
          margin-bottom: 1.5rem;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }
        
        .price-row:last-child {
          margin-bottom: 0;
        }
        
        .price-row.accent {
          color: var(--success);
          font-weight: 600;
        }
        
        .price-row.total {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 2px solid var(--primary);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--dark);
        }
        
        .price-value {
          font-weight: 600;
        }
        
        .price-value.accent {
          color: var(--success);
        }
        
        .price-value.total {
          color: var(--primary);
          font-size: 1.25rem;
        }
        
        .price-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gray-300), transparent);
          margin: 0.75rem 0;
        }
        
        /* ==================== */
        /* OPÇÕES DE ENTREGA */
        /* ==================== */
        .section-title-sm {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--dark);
          margin: 0 0 1rem 0;
        }
        
        .section-icon {
          font-size: 1.25rem;
        }
        
        .delivery-options-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .delivery-option-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--gray-100);
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }
        
        .delivery-option-card:hover {
          background: var(--gray-200);
          transform: translateY(-2px);
        }
        
        .delivery-option-card.selected {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 8px 20px rgba(255, 209, 102, 0.15);
        }
        
        .option-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark);
          flex-shrink: 0;
        }
        
        .option-content {
          flex: 1;
          min-width: 0;
        }
        
        .option-content h5 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 0.25rem 0;
        }
        
        .option-desc {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin: 0 0 0.75rem 0;
        }
        
        .option-price-badge {
          display: inline-block;
          background: var(--success);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        
        .option-price-badge.fee {
          background: var(--warning);
        }
        
        .option-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--gray-600);
        }
        
        .time-slots {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-left: 1.5rem;
        }
        
        .time-slot {
          font-size: 0.75rem;
          color: var(--gray-500);
          padding-left: 0.5rem;
          border-left: 2px solid var(--gray-300);
        }
        
        .option-check {
          color: var(--success);
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
        }
        
        /* ==================== */
        /* FORMULÁRIO DE ENDEREÇO */
        /* ==================== */
        .address-section {
          margin-bottom: 2rem;
        }
        
        .address-form-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        /* ==================== */
        /* PAGAMENTO */
        /* ==================== */
        .payment-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .payment-option-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--gray-100);
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }
        
        .payment-option-card:hover {
          background: var(--gray-200);
          transform: translateY(-2px);
        }
        
        .payment-option-card.selected {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 8px 20px rgba(255, 209, 102, 0.15);
        }
        
        .payment-icon-wrapper {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .payment-icon {
          color: var(--dark);
        }
        
        .payment-content {
          flex: 1;
          min-width: 0;
        }
        
        .payment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .payment-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }
        
        .payment-check {
          color: var(--success);
          flex-shrink: 0;
        }
        
        .payment-desc {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin: 0 0 0.75rem 0;
        }
        
        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--gray-600);
        }
        
        .benefit-item svg {
          color: var(--success);
          flex-shrink: 0;
        }
        
        /* ==================== */
        /* PAGAMENTO EM DINHEIRO */
        /* ==================== */
        .cash-section {
          background: white;
          border-radius: var(--radius-md);
          padding: 1.5rem;
          border: 1px solid var(--gray-200);
          margin-bottom: 1.5rem;
        }
        
        .cash-header {
          margin-bottom: 1.5rem;
        }
        
        .cash-title-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .cash-title-wrapper h5 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0 0 0.25rem 0;
        }
        
        .cash-subtitle {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin: 0;
        }
        
        .cash-input-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .cash-input-group {
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: var(--transition);
        }
        
        .cash-input-group:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.15);
        }
        
        .cash-prefix {
          padding: 0 1rem;
          font-weight: 700;
          color: var(--dark);
          background: var(--gray-100);
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 2px solid var(--gray-200);
          font-size: 1.25rem;
        }
        
        .cash-input {
          flex: 1;
          padding: 1rem;
          border: none;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--dark);
          background: white;
          outline: none;
          text-align: right;
          font-family: inherit;
          width: 100%;
        }
        
        .cash-input::placeholder {
          color: var(--gray-300);
        }
        
        .cash-error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: var(--radius-sm);
          border: 1px solid var(--danger);
          color: #B91C1C;
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }
        
        .cash-error-message svg {
          flex-shrink: 0;
        }
        
        .cash-suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .suggestions-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-600);
          margin: 0;
        }
        
        .suggestion-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        @media (min-width: 360px) {
          .suggestion-buttons {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .suggestion-btn {
          padding: 0.75rem 0.5rem;
          background: white;
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-sm);
          font-weight: 600;
          color: var(--gray-600);
          cursor: pointer;
          transition: var(--transition);
          font-size: 0.875rem;
          border: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .suggestion-btn:hover {
          background: var(--gray-100);
          border-color: var(--gray-300);
          transform: translateY(-2px);
        }
        
        .suggestion-btn.exact {
          background: var(--success);
          color: white;
          border-color: var(--success);
        }
        
        .suggestion-btn.exact:hover {
          background: #059669;
          border-color: #059669;
        }
        
        .cash-summary {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.5rem;
          background: var(--gray-100);
          border-radius: var(--radius-md);
          border: 1px solid var(--gray-200);
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }
        
        .summary-row.change-row {
          padding-top: 1rem;
          border-top: 2px solid var(--gray-200);
        }
        
        .summary-value {
          font-weight: 700;
          color: var(--dark);
        }
        
        .summary-value.given {
          color: var(--success);
        }
        
        .summary-value.change.positive {
          color: #9333EA;
        }
        
        .summary-value.change.exact {
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
        }
        
        .summary-divider-light {
          height: 1px;
          background: var(--gray-200);
          margin: 0.25rem 0;
        }
        
        /* ==================== */
        /* RESUMO DO PEDIDO */
        /* ==================== */
        .summary-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .summary-card {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        
        .summary-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .summary-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }
        
        .summary-body {
          padding: 1.5rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--gray-100);
        }
        
        .summary-row:last-child {
          border-bottom: none;
        }
        
        .summary-row.delivery {
          color: var(--success);
          font-weight: 600;
        }
        
        .delivery-fee {
          color: var(--success);
          font-weight: 600;
        }
        
        .summary-row.payment-info {
          color: var(--gray-600);
        }
        
        .payment-method {
          font-weight: 600;
          color: var(--dark);
        }
        
        .summary-row.cash-info {
          color: var(--gray-600);
        }
        
        .summary-row.change-info {
          color: #9333EA;
          font-weight: 600;
        }
        
        .change-amount {
          color: #9333EA;
          font-weight: 700;
        }
        
        .summary-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          margin: 1rem 0;
        }
        
        .summary-row.total-row {
          padding-top: 1rem;
          border-top: 2px solid var(--primary);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dark);
        }
        
        .total-amount {
          color: var(--primary);
          font-size: 1.5rem;
          font-weight: 800;
        }
        
        /* ==================== */
        /* PREVIEW DO CLIENTE */
        /* ==================== */
        .customer-preview {
          padding: 1.5rem;
          border-top: 1px solid var(--gray-200);
          background: var(--gray-100);
        }
        
        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .preview-header h4 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }
        
        .preview-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 24px;
        }
        
        .info-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-600);
          flex-shrink: 0;
        }
        
        .info-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--dark);
          text-align: right;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 0;
          justify-content: flex-end;
        }
        
        .info-value span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .cash-amount {
          font-size: 0.75rem;
          color: var(--gray-500);
          font-weight: 500;
        }
        
        .btn-edit-data {
          width: 100%;
          padding: 0.875rem;
          background: rgba(255, 209, 102, 0.1);
          border: 1px solid var(--primary);
          border-radius: var(--radius-md);
          color: var(--dark);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition);
          min-height: 44px;
        }
        
        .btn-edit-data:hover {
          background: var(--primary);
        }
        
        /* ==================== */
        /* BOTÕES DE AÇÃO */
        /* ==================== */
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .action-row {
          display: flex;
          gap: 0.75rem;
        }
        
        /* ==================== */
        /* INSTRUÇÕES */
        /* ==================== */
        .instructions {
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
        }
        
        .instructions-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        
        .instructions-icon {
          font-size: 1.5rem;
        }
        
        .instructions-header h4 {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }
        
        .steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          counter-reset: step-counter;
        }
        
        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          counter-increment: step-counter;
        }
        
        .step-num {
          width: 28px;
          height: 28px;
          background: var(--primary);
          color: var(--dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        
        .step span:last-child {
          font-size: 0.95rem;
          color: var(--gray-600);
          line-height: 1.4;
          padding-top: 0.25rem;
        }
        
        .delivery-notice,
        .cash-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--warning);
        }
        
        .cash-notice {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: var(--secondary);
        }
        
        .cash-notice svg {
          color: var(--secondary);
        }
        
        .delivery-notice p,
        .cash-notice p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--gray-700);
          line-height: 1.4;
        }
        
        .delivery-notice strong,
        .cash-notice strong {
          color: var(--gray-800);
        }
        
        /* ==================== */
        /* RESPONSIVIDADE MOBILE */
        /* ==================== */
        @media (max-width: 768px) {
          .cart-container {
            max-width: 100%;
            border-radius: 0;
          }
          
          .cart-header {
            padding: 1rem;
            min-height: 70px;
            position: relative;
          }
          
          .header-icon-wrapper {
            width: 44px;
            height: 44px;
          }
          
          .cart-badge {
            min-width: 20px;
            height: 20px;
            font-size: 0.7rem;
          }
          
          .cart-title {
            font-size: 1.25rem;
          }
          
          .cart-subtitle {
            font-size: 0.8125rem;
          }
          
          .cart-scroll-area {
            padding: 1rem;
            gap: 1rem;
          }
          
          .cart-item {
            flex-direction: row;
            padding: 1rem;
            gap: 0.875rem;
          }
          
          .item-image {
            width: 64px;
            height: 64px;
          }
          
          .item-emoji {
            font-size: 1.75rem;
          }
          
          .item-name {
            font-size: 1.125rem;
          }
          
          .total-price {
            font-size: 1.125rem;
          }
          
          .form-row-2 {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .suggestion-buttons {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .action-row {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .btn {
            padding: 0.875rem 1rem;
            font-size: 0.95rem;
            min-height: 44px;
          }
          
          .btn-large {
            padding: 1rem 1.5rem;
            font-size: 1rem;
            min-height: 52px;
          }
          
          .cash-input {
            font-size: 1.25rem;
            padding: 0.875rem;
          }
          
          .cash-prefix {
            font-size: 1.125rem;
            height: 52px;
            padding: 0 0.875rem;
          }
          
          /* Melhorias para touch em mobile */
          .qty-btn,
          .btn-remove,
          .close-button {
            min-height: 44px;
            min-width: 44px;
          }
          
          .form-input {
            padding: 0.875rem 0.875rem 0.875rem 3rem;
            min-height: 44px;
          }
          
          .input-icon {
            left: 0.875rem;
          }
        }
        
        @media (max-width: 480px) {
          .cart-header {
            padding: 0.875rem;
          }
          
          .header-icon-wrapper {
            width: 40px;
            height: 40px;
          }
          
          .cart-title {
            font-size: 1.125rem;
          }
          
          .cart-scroll-area {
            padding: 0.875rem;
          }
          
          .cart-item {
            padding: 0.875rem;
          }
          
          .item-image {
            width: 56px;
            height: 56px;
          }
          
          .item-emoji {
            font-size: 1.5rem;
          }
          
          .item-name {
            font-size: 1rem;
          }
          
          .item-desc {
            font-size: 0.8125rem;
          }
          
          .total-price {
            font-size: 1rem;
          }
          
          .form-navigation {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .suggestion-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          
          .suggestion-btn {
            flex: 1;
            min-width: calc(50% - 0.25rem);
            font-size: 0.8125rem;
            padding: 0.625rem 0.5rem;
          }
          
          /* Otimizações para telas muito pequenas */
          .cart-container {
            max-width: 100vw;
          }
          
          .summary-card {
            margin: 0 -0.875rem;
            border-radius: 0;
            box-shadow: none;
            border-bottom: 1px solid var(--gray-200);
          }
          
          .instructions {
            margin: 0 -0.875rem;
            border-radius: 0;
            box-shadow: none;
            border-top: 1px solid var(--gray-200);
          }
        }
        
        @media (max-width: 360px) {
          .cart-item {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }
          
          .item-header {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .item-footer {
            flex-direction: column;
            gap: 0.75rem;
            align-items: stretch;
          }
          
          .item-pricing {
            align-items: center;
          }
          
          .suggestion-buttons {
            flex-direction: column;
          }
          
          .suggestion-btn {
            width: 100%;
            min-width: 100%;
          }
        }
        
        /* ==================== */
        /* OTIMIZAÇÕES TOUCH */
        /* ==================== */
        @media (hover: none) and (pointer: coarse) {
          .cart-item:hover {
            transform: none;
          }
          
          .btn:hover:not(:disabled),
          .btn-action:hover:not(:disabled),
          .btn-edit-data:hover,
          .btn-clear-all:hover,
          .qty-btn:hover:not(:disabled),
          .btn-remove:hover,
          .payment-option-card:hover,
          .delivery-option-card:hover,
          .suggestion-btn:hover {
            transform: none;
          }
          
          .close-button:hover {
            transform: none;
            background: rgba(255, 255, 255, 0.15);
          }
          
          /* Melhor feedback visual para touch */
          .btn:active:not(:disabled) {
            transform: scale(0.98);
          }
          
          .cart-item:active {
            transform: scale(0.99);
          }
        }
        
        /* ==================== */
        /* ANIMAÇÕES */
        /* ==================== */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .cart-item {
          animation: fadeInUp 0.3s ease backwards;
        }
        
        .cart-item:nth-child(1) { animation-delay: 0.1s; }
        .cart-item:nth-child(2) { animation-delay: 0.2s; }
        .cart-item:nth-child(3) { animation-delay: 0.3s; }
        .cart-item:nth-child(4) { animation-delay: 0.4s; }
        .cart-item:nth-child(5) { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
};

export default Cart;