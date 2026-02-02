import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  X, Trash2, Plus, Minus,
  Package, ShoppingCart, ChevronRight, User,
  Home, School, Truck, CheckCircle,
  CreditCard, Wallet, AlertCircle, Clock, Calendar,
  Banknote, Check, Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Cart.css';

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
    closeCart,
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

  // Refs
  const cashInputRef = useRef(null);

  // =======================
  // UTILITÁRIOS
  // =======================
  const parseCashAmount = useCallback((value) => {
    if (!value) return 0;
    
    // Remove tudo que não é número
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return 0;
    
    // Converte para centavos e depois para reais
    return parseFloat(numbers) / 100;
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

    // Verificar se há rifas
    const hasRaffles = items.some(item => item.isRaffle);
    const raffleItems = items.filter(item => item.isRaffle);
    
    // Informações importantes sobre as rifas
    let rafflesInfo = '';
    if (hasRaffles && raffleItems.length > 0) {
      rafflesInfo = `\n*🎟️ RIFAS SELECIONADAS:*\n`;
      raffleItems.forEach((item, index) => {
        if (index < 5) {
          rafflesInfo += `• ${item.selectedClass || ''} Nº ${item.selectedNumber?.toString().padStart(3, '0') || ''}\n`;
        }
      });
      if (raffleItems.length > 5) {
        rafflesInfo += `• ... e mais ${raffleItems.length - 5} rifa(s)\n`;
      }
      
      rafflesInfo += `\n*⚠️ INFORMAÇÃO IMPORTANTE SOBRE AS RIFAS:*\n`;
      
      if (paymentMethod === 'pix') {
        rafflesInfo += `• As rifas estão RESERVADAS LOCALMENTE\n`;
        rafflesInfo += `• Elas serão enviadas para o sistema SOMENTE quando você:\n`;
        rafflesInfo += `   1. Enviar o comprovante PIX\n`;
        rafflesInfo += `   2. Clicar em "Já enviei o comprovante"\n`;
        rafflesInfo += `• Até lá, o administrador NÃO VÊ suas rifas!\n`;
      } else {
        rafflesInfo += `• As rifas serão enviadas para o sistema como RESERVADAS PENDENTES\n`;
        rafflesInfo += `• O administrador verá sua reserva (status: aguardando pagamento)\n`;
        rafflesInfo += `• Após pagamento físico, serão marcadas como PAGAS\n`;
      }
      
      rafflesInfo += `\n`;
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
      rafflesInfo + '\n' +
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

  // CORREÇÃO PRINCIPAL: Função otimizada para digitação do valor em dinheiro
  const handleCashAmountChange = (e) => {
    const value = e.target.value;
    
    // Remove tudo que não é número
    let numbers = value.replace(/[^\d]/g, '');
    
    // Se estiver vazio, seta vazio
    if (!numbers) {
      setCashAmount('');
      return;
    }
    
    // Limita a 10 dígitos (até 99 milhões)
    numbers = numbers.substring(0, 10);
    
    // Se o valor for apenas "0", mantém "0"
    if (numbers === '0') {
      setCashAmount('0');
      return;
    }
    
    // Converte para número
    const numericValue = parseInt(numbers, 10);
    
    // Se for NaN, seta vazio
    if (isNaN(numericValue)) {
      setCashAmount('');
      return;
    }
    
    // Converte para reais (dividindo por 100)
    const amountInReais = numericValue / 100;
    
    // Formata para exibição
    const formatted = amountInReais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    setCashAmount(formatted);
    
    // Mantém o cursor na posição correta
    requestAnimationFrame(() => {
      if (cashInputRef.current) {
        // Salva a posição do cursor
        const cursorPosition = cashInputRef.current.selectionStart;
        
        // Restaura o foco se o elemento ainda existir
        if (document.activeElement !== cashInputRef.current) {
          cashInputRef.current.focus();
        }
        
        // Restaura a posição do cursor
        cashInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  };

  const handleCashAmountBlur = () => {
    if (cashAmount && cashAmount.trim() !== '') {
      const cash = parseCashAmount(cashAmount);
      if (!isNaN(cash) && cash > 0) {
        // Formata novamente para garantir 2 casas decimais
        const formatted = cash.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        setCashAmount(formatted);
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
    
    const formatted = amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    setCashAmount(formatted);
    setCashValidationError('');
    
    // Foca no input após selecionar sugestão
    setTimeout(() => {
      if (cashInputRef.current) {
        cashInputRef.current.focus();
        // Coloca o cursor no final
        cashInputRef.current.setSelectionRange(
          formatted.length,
          formatted.length
        );
      }
    }, 100);
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
  const handleFinalizeOrder = useCallback(() => {
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
      console.log('🛒 FINALIZANDO PEDIDO:', {
        id: 'A SER GERADO',
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        hasRaffles: cart.some(item => item.isRaffle),
        raffleCount: cart.filter(item => item.isRaffle).length
      });
      
      console.log('⚠️ ATENÇÃO: As rifas ainda NÃO foram para o Firebase!');
      console.log('📋 Para PIX: Serão enviadas quando clicar em "Já enviei comprovante"');
      console.log('💰 Para DINHEIRO: Serão enviadas quando clicar em "Enviar para WhatsApp"');
      
      const createdOrder = createOrder(orderData);
      console.log('✅ Pedido criado com sucesso:', createdOrder);
      
      // Feedback visual para o usuário
      if (createdOrder) {
        alert('✅ Pedido criado com sucesso! Agora é só enviar o comprovante.');
      }
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    }
  }, [cart, validateForm, customerInfo, deliveryOption, deliveryAddress, deliveryDate, subtotal, totalWithDelivery, paymentMethod, cashAmount, cashChange, parseCashAmount, createOrder]);

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
    closeCart();
    
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
  // ENVIAR PARA WHATSAPP
  // =======================
  const handleSendToWhatsApp = () => {
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

    const message = formatWhatsAppMessage(orderData);
    const whatsappNumber = '5518996349330';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  // =======================
  // COMPONENTE DE PAGAMENTO EM DINHEIRO OTIMIZADO
  // =======================
  const CashPaymentSection = () => (
    <div className="cash-payment-section">
      <div className="section-header">
        <div className="section-title-icon">
          <div className="icon-wrapper success">
            <Banknote size={20} />
          </div>
          <h4>Pagamento em Dinheiro</h4>
        </div>
        <p className="section-subtitle">Informe o valor para calcularmos o troco</p>
      </div>
      
      <div className="cash-input-section">
        <label className="input-label">
          Valor entregue
          <span className="hint">(digite apenas números)</span>
        </label>
        
        <div className="amount-input-wrapper">
          <div className="currency-prefix">R$</div>
          <input
            ref={cashInputRef}
            type="text"
            placeholder="0,00"
            value={cashAmount}
            onChange={handleCashAmountChange}
            onBlur={handleCashAmountBlur}
            className="amount-input"
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
        
        {cashValidationError && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{cashValidationError}</span>
          </div>
        )}
        
        <div className="quick-suggestions">
          <p className="suggestions-title">Sugestões rápidas</p>
          <div className="suggestion-buttons">
            <button
              type="button"
              className="suggestion-btn primary"
              onClick={() => handleQuickCashSuggestion('exact')}
            >
              <Check size={14} />
              Valor exato
            </button>
            <button
              type="button"
              className="suggestion-btn"
              onClick={() => handleQuickCashSuggestion('round-up')}
            >
              <Sparkles size={14} />
              Arredondar
            </button>
            <button
              type="button"
              className="suggestion-btn"
              onClick={() => handleQuickCashSuggestion('+5')}
            >
              + R$ 5
            </button>
            <button
              type="button"
              className="suggestion-btn"
              onClick={() => handleQuickCashSuggestion('+10')}
            >
              + R$ 10
            </button>
          </div>
        </div>
        
        <div className="calculation-summary">
          <div className="summary-item">
            <span className="summary-label">Total a pagar</span>
            <span className="summary-value">{formatCurrency(totalWithDelivery)}</span>
          </div>
          
          {cashAmount && (
            <>
              <div className="summary-item">
                <span className="summary-label">Valor entregue</span>
                <span className="summary-value success">
                  {formatCurrency(parseCashAmount(cashAmount))}
                </span>
              </div>
              
              <div className="divider"></div>
              
              <div className="summary-item highlight">
                <span className="summary-label">Troco necessário</span>
                <span className={`summary-value ${cashChange > 0 ? 'accent' : 'success'}`}>
                  {cashChange > 0 ? (
                    <>
                      {formatCurrency(cashChange)}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      Valor exato
                    </>
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

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
                <span>Voltar ao Carrinho</span>
              </button>
              <button
                className="btn btn-primary btn-full"
                onClick={() => setFormStep(2)}
                disabled={!customerInfo.name.trim() || !customerInfo.phone.replace(/\D/g, '').length >= 10}
                type="button"
              >
                <span>Continuar</span>
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

              {/* Aviso sobre Rifas (se houver) */}
              {cart.some(item => item.isRaffle) && (
                <div className="important-raffle-notice">
                  <div className="notice-header">
                    <AlertCircle size={20} />
                    <h5>ATENÇÃO - RIFAS NO CARRINHO</h5>
                  </div>
                  <div className="notice-content">
                    <p><strong>Seu carrinho contém {cart.filter(item => item.isRaffle).length} rifa(s).</strong></p>
                    <p>As rifas estão apenas RESERVADAS no seu navegador.</p>
                    <p><strong>Para confirmar a compra:</strong></p>
                    <ul>
                      <li>💳 <strong>PIX:</strong> Envie comprovante + Clique em "Já enviei"</li>
                      <li>💰 <strong>DINHEIRO:</strong> Clique em "Enviar para WhatsApp"</li>
                    </ul>
                    <p className="critical-warning">
                      ⚠️ O administrador só vê suas rifas após a confirmação final!
                    </p>
                  </div>
                </div>
              )}

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
                <div className="section-header">
                  <div className="section-title-icon">
                    <div className="icon-wrapper accent">
                      <CreditCard size={20} />
                    </div>
                    <h3 className="forma_de_pagamento">Forma de Pagamento</h3>
                  </div>
                  <p className="section-subtitle">Escolha como deseja realizar o pagamento</p>
                </div>
                
                <div className="options-grid">
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`option-card ${paymentMethod === option.id ? 'selected' : ''}`}
                      onClick={() => handlePaymentMethodChange(option.id)}
                    >
                      <div className="option-header">
                        <div className="option-icon-wrapper">
                          <div className="icon-circle accent">
                            <option.icon size={22} />
                          </div>
                        </div>
                        
                        <div className="option-title-wrapper">
                          <h4>{option.label}</h4>
                          {paymentMethod === option.id && (
                            <div className="selected-badge">
                              <CheckCircle size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="option-description">{option.description}</p>
                      
                      <div className="benefits-container">
                        {option.benefits.map((benefit, index) => (
                          <div key={index} className="benefit-item">
                            <div className="benefit-icon">
                              <CheckCircle size={12} />
                            </div>
                            <span className="benefit-text">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Seção de Dinheiro (condicional) */}
                {paymentMethod === 'dinheiro' && <CashPaymentSection />}
              </div>
            </div>

            <div className="form-navigation">
              <button
                className="btn btn-secondary btn-full"
                onClick={() => setFormStep(1)}
                type="button"
              >
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
                    <span>Finalizar com PIX</span>
                  </>
                ) : (
                  <>
                    <span>Finalizar com <br /> Dinheiro</span>
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
  if (!isCartOpen) {
    console.log('Cart is closed, not rendering');
    return null;
  }

  // =======================
  // RENDER PRINCIPAL
  // =======================
  return (
    <div className="cart-overlay" onClick={closeCart}>
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
            onClick={closeCart}
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
                            
                            {/* MOSTRAR INFORMAÇÕES DA RIFA */}
                            {item.isRaffle && (
                              <div className="raffle-details">
                                <div className="raffle-detail">
                                  <span className="detail-label">Turma:</span>
                                  <span className="detail-value">{item.classInfo?.name || item.selectedClass}</span>
                                </div>
                                <div className="raffle-detail">
                                  <span className="detail-label">Número:</span>
                                  <span className="detail-value raffle-number">
                                    {item.selectedNumber?.toString().padStart(3, '0') || 'Não especificado'}
                                  </span>
                                </div>
                                <div className="raffle-detail">
                                  <span className="detail-label">Tipo:</span>
                                  <span className="detail-value">Rifa Hot Planet</span>
                                </div>
                                <div className="raffle-status-notice">
                                  <span>
                                    <strong>Status:</strong> {item.status === 'reservado_local' ? 'Reservada localmente' : 'Reservada'}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {item.description && !item.isRaffle && (
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
                    
                    {/* Aviso sobre Rifas */}
                    {cart.some(item => item.isRaffle) && (
                      <div className="raffle-cart-notice">
                        <div className="notice-header">
                          <AlertCircle size={18} />
                          <h4>ATENÇÃO - RIFAS NO CARRINHO</h4>
                        </div>
                        <div className="notice-content">
                          <p>Você tem <strong>{cart.filter(item => item.isRaffle).length} rifa(s)</strong> no carrinho.</p>
                          <p><strong>As rifas estão apenas RESERVADAS no seu navegador.</strong></p>
                          <p>Para confirmar a compra e enviar as rifas para o sistema:</p>
                          <ul>
                            <li>💳 <strong>PIX:</strong> Envie comprovante + Clique em "Já enviei"</li>
                            <li>💰 <strong>DINHEIRO:</strong> Clique em "Enviar para WhatsApp"</li>
                          </ul>
                          <p className="warning-note">
                            ⚠️ O administrador só vê suas rifas após a confirmação final do pagamento!
                          </p>
                        </div>
                      </div>
                    )}
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
                    <span>Copiar Pedido</span>
                  </button>
                  
                  <button
                    className="btn btn-secondary btn-action"
                    onClick={handleSendToWhatsApp}
                    disabled={!isFormValid}
                    type="button"
                  >
                    <span>Enviar WhatsApp</span>
                  </button>
                </div>

                <div className="action-row">
                  <button
                    className="btn btn-primary btn-full"
                    onClick={handleFinalizeOrder}
                    disabled={!isFormValid}
                    type="button"
                  >
                    {paymentMethod === 'pix' ? (
                      <>
                        <span>Finalizar com PIX</span>
                      </>
                    ) : (
                      <>
                        <span>Finalizar com Dinheiro</span>
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
                          ? 'CLIQUE EM "JÁ ENVIEI COMPROVANTE" para confirmar' 
                          : 'CLIQUE EM "ENVIAR PARA WHATSAPP" para reservar'}
                      </span>
                    </li>
                  </ol>
                  
                  {/* Aviso específico para Rifas */}
                  {cart.some(item => item.isRaffle) && (
                    <div className="raffle-payment-notice">
                      <AlertCircle size={16} />
                      <div>
                        <p><strong>⚠️ ATENÇÃO - RIFAS NO CARRINHO:</strong></p>
                        <p>As rifas estão <strong>APENAS RESERVADAS NO SEU NAVEGADOR</strong>.</p>
                        <p>Elas só serão enviadas para o sistema após a confirmação final do pagamento.</p>
                        <p><strong>O administrador NÃO VÊ suas rifas até você confirmar!</strong></p>
                      </div>
                    </div>
                  )}
                  
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