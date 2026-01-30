import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X, ShoppingBag, Trash2, Plus, Minus, MessageCircle, Copy,
  Package, ShoppingCart, ChevronRight, User, Phone, Mail,
   Home, School, Truck, CheckCircle,  ArrowLeft,
  CreditCard, Wallet, Calculator, AlertCircle, Clock, Calendar
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CashWhatsAppHandler from '../CashWhatsAppHandler/CashWhatsAppHandler';
import './Cart.css'

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
    </div>
  );
};

export default Cart;