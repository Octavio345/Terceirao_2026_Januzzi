import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
  Copy, Check, QrCode, Smartphone, Clock, 
  Download, X, Wallet, Calculator, DollarSign, AlertCircle, RefreshCw,
  Send, MessageCircle, Loader2, Shield, Plus, Minus
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import QRCodeGenerator from '../QRCodeGenerator/QRCodeGenerator';
import './Payment.css';

const Payment = () => {
  const { 
    currentOrder, 
    vendorInfo, 
    showPayment,
    setShowPayment,
    closePaymentOnly,
    clearCartAfterConfirmation,
    confirmRafflesInOrder
  } = useCart();
  
  const raffleManager = useRaffleManager();
  
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proofSent, setProofSent] = useState(false);
  const [rafflesConfirmed, setRafflesConfirmed] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const modalRef = useRef(null);
  
  const [persistentSession, setPersistentSession] = useState(null);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [paymentTimestamp, setPaymentTimestamp] = useState(null);
  const [manualSendResults, setManualSendResults] = useState([]);

  // ========== NOVOS STATES PARA DINHEIRO ==========
  const [cashInput, setCashInput] = useState('');
  const [cashError, setCashError] = useState('');
  const [cashSuggestions, setCashSuggestions] = useState([]);
  const [showCashSuggestions, setShowCashSuggestions] = useState(false);
  const cashInputRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // ========== FUNÇÃO TOAST ==========
  const showToast = useCallback((type, message) => {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { 
        type, 
        message, 
        duration: type === 'error' ? 5000 : 4000 
      }
    }));
  }, []);

  // ========== FUNÇÃO PARA FECHAR MODAL ==========
  const handleCloseModal = useCallback(() => {
    console.log('🔒 Fechando modal de pagamento');
    
    if (typeof closePaymentOnly === 'function') {
      closePaymentOnly();
    } else if (typeof setShowPayment === 'function') {
      setShowPayment(false);
    }
  }, [closePaymentOnly, setShowPayment]);

  // ========== FUNÇÃO PARA OBTER NOME DO CLIENTE ==========
  const getCustomerName = useCallback(() => {
    if (!currentOrder) return 'Não informado';
    
    if (currentOrder.customer?.name) {
      return currentOrder.customer.name;
    }
    
    if (currentOrder.customerName) {
      return currentOrder.customerName;
    }
    
    if (currentOrder.customerInfo?.name) {
      return currentOrder.customerInfo.name;
    }
    
    try {
      const savedInfo = JSON.parse(localStorage.getItem('terceirao_customer_info') || '{}');
      if (savedInfo.name) {
        return savedInfo.name;
      }
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
    }
    
    return 'Não informado';
  }, [currentOrder]);

  // ========== FUNÇÃO SALVAR SESSÃO PERSISTENTE ==========
  const savePersistentSession = useCallback(() => {
    if (!currentOrder) return;
    
    const sessionData = {
      orderId: currentOrder.id,
      orderData: currentOrder,
      timestamp: new Date().toISOString(),
      hasSentProof: proofSent,
      paymentTimestamp: paymentTimestamp
    };
    
    localStorage.setItem('terceirao_payment_session', JSON.stringify(sessionData));
  }, [currentOrder, proofSent, paymentTimestamp]);

  // ========== FUNÇÃO PARA LIMPAR SESSÃO PERSISTENTE ==========
  const clearPersistentSession = useCallback(() => {
    localStorage.removeItem('terceirao_payment_session');
    setPersistentSession(null);
    setHasPendingPayment(false);
    setPaymentTimestamp(null);
  }, []);

  // ========== FUNÇÃO loadPersistentSession ==========
  const loadPersistentSession = useCallback(() => {
    try {
      const savedSession = localStorage.getItem('terceirao_payment_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        
        if (sessionData.orderId === currentOrder?.id) {
          setPersistentSession(sessionData);
          
          if (sessionData.hasSentProof) {
            setProofSent(true);
          }
          
          if (sessionData.paymentTimestamp) {
            setPaymentTimestamp(sessionData.paymentTimestamp);
            setHasPendingPayment(true);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    }
  }, [currentOrder?.id]);

  // ========== FUNÇÃO PARA VALIDAR INPUT DE DINHEIRO ==========
  const validateCashInput = useCallback(() => {
    if (!cashInput) {
      setCashError('Por favor, informe o valor em dinheiro que você tem.');
      cashInputRef.current?.focus();
      return false;
    }
    
    const numericValue = parseFloat(
      cashInput
        .replace(/R\$/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .trim()
    );
    
    if (isNaN(numericValue)) {
      setCashError('Valor inválido. Use apenas números.');
      cashInputRef.current?.focus();
      return false;
    }
    
    if (numericValue < (currentOrder?.total || 0)) {
      setCashError(`Valor insuficiente. O total é R$ ${(currentOrder?.total || 0).toFixed(2)}`);
      cashInputRef.current?.focus();
      return false;
    }
    
    return true;
  }, [cashInput, currentOrder]);

  // ========== FUNÇÃO PARA GERAR SUGESTÕES DE TROCO ==========
  const generateChangeSuggestions = useCallback(() => {
    const total = currentOrder?.total || 0;
    if (!total) return [];
    
    // Se não houver input, mostra sugestões baseadas no total
    if (!cashInput) {
      const suggestions = [];
      
      // Sugere o próximo valor "redondo"
      const nextRoundUp = Math.ceil(total);
      if (nextRoundUp > total) {
        suggestions.push({
          value: nextRoundUp,
          label: `R$ ${nextRoundUp.toFixed(2)} (Valor redondo)`,
          change: nextRoundUp - total
        });
      }
      
      // Sugere múltiplos de 5
      const nextMultipleOf5 = Math.ceil(total / 5) * 5;
      if (nextMultipleOf5 > total && nextMultipleOf5 !== nextRoundUp) {
        suggestions.push({
          value: nextMultipleOf5,
          label: `R$ ${nextMultipleOf5.toFixed(2)} (Múltiplo de 5)`,
          change: nextMultipleOf5 - total
        });
      }
      
      // Sugere múltiplos de 10
      const nextMultipleOf10 = Math.ceil(total / 10) * 10;
      if (nextMultipleOf10 > total && nextMultipleOf10 !== nextMultipleOf5 && nextMultipleOf10 !== nextRoundUp) {
        suggestions.push({
          value: nextMultipleOf10,
          label: `R$ ${nextMultipleOf10.toFixed(2)} (Múltiplo de 10)`,
          change: nextMultipleOf10 - total
        });
      }
      
      return suggestions;
    }
    
    // Se houver input, mostra sugestões baseadas no valor digitado
    const inputValue = parseFloat(
      cashInput
        .replace(/R\$/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .trim()
    );
    
    if (isNaN(inputValue) || inputValue < total) return [];
    
    const suggestions = [];
    const change = inputValue - total;
    
    // Se já for um valor bom, não precisa sugerir outros
    if (change === 0) return []; // Valor exato
    
    // Se o troco for "bonito" (múltiplo de 5 ou 10), não sugere
    if (change % 5 === 0 || change % 10 === 0) {
      return [];
    }
    
    // Senão, sugere valores melhores
    const nextRoundUp = Math.ceil(total);
    if (nextRoundUp > total && nextRoundUp !== inputValue) {
      suggestions.push({
        value: nextRoundUp,
        label: `R$ ${nextRoundUp.toFixed(2)} (Valor redondo)`,
        change: nextRoundUp - total
      });
    }
    
    const nextMultipleOf5 = Math.ceil(total / 5) * 5;
    if (nextMultipleOf5 > total && nextMultipleOf5 !== inputValue && nextMultipleOf5 !== nextRoundUp) {
      suggestions.push({
        value: nextMultipleOf5,
        label: `R$ ${nextMultipleOf5.toFixed(2)} (Múltiplo de 5)`,
        change: nextMultipleOf5 - total
      });
    }
    
    const nextMultipleOf10 = Math.ceil(total / 10) * 10;
    if (nextMultipleOf10 > total && nextMultipleOf10 !== inputValue && nextMultipleOf10 !== nextMultipleOf5 && nextMultipleOf10 !== nextRoundUp) {
      suggestions.push({
        value: nextMultipleOf10,
        label: `R$ ${nextMultipleOf10.toFixed(2)} (Múltiplo de 10)`,
        change: nextMultipleOf10 - total
      });
    }
    
    return suggestions;
  }, [currentOrder?.total, cashInput]);

  // ========== FUNÇÃO PARA MENSAGEM DO WHATSAPP ==========
  const generateWhatsAppMessage = useCallback(() => {
    if (!vendorInfo?.whatsapp) {
        console.error('WhatsApp não configurado');
        showToast('error', 'WhatsApp não configurado');
        return '#';
    }
    
    const phone = vendorInfo.whatsapp.replace(/\D/g, '');
    const deliveryOption = currentOrder.deliveryOption || 'retirada';
    const deliveryAddress = currentOrder.deliveryAddress || null;
    const paymentMethod = currentOrder.paymentMethod || 'pix';
    
    const customerName = getCustomerName();
    const customerPhone = currentOrder.customer?.phone || currentOrder.customerInfo?.phone || '';
    
    const hasRaffles = currentOrder.items?.some(item => item.isRaffle) || false;
    
    let message = `*${paymentMethod === 'pix' ? '📋 COMPROVANTE PIX ENVIADO' : '💵 PAGAMENTO EM DINHEIRO'}*\n\n`;
    
    message += `*🧾 PEDIDO:* ${currentOrder.id}\n`;
    message += `*👤 CLIENTE:* ${customerName}\n`;
    message += `*📞 TELEFONE:* ${customerPhone}\n`;
    message += `*💰 VALOR:* R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`;
    
    if (hasRaffles) {
        const raffleItems = currentOrder.items?.filter(item => item.isRaffle) || [];
        message += `*🎟️ RIFAS:*\n`;
        raffleItems.forEach((item, index) => {
            if (index < 5) {
                message += `• ${item.selectedClass || ''} Nº ${item.selectedNumber?.toString().padStart(3, '0') || ''}\n`;
            }
        });
        if (raffleItems.length > 5) {
            message += `• ... e mais ${raffleItems.length - 5} rifa(s)\n`;
        }
        message += `\n`;
        
        if (paymentMethod === 'pix') {
            if (!rafflesConfirmed) {
                message += `*⚠️ ATENÇÃO IMPORTANTE:*\n`;
                message += `As rifas estão APENAS NO CARRINHO e NÃO foram reservadas no sistema ainda.\n`;
                message += `Elas só serão enviadas para o sistema quando você clicar em "Já enviei o comprovante".\n\n`;
            } else {
                message += `*✅ CONFIRMADO:*\n`;
                message += `Rifas já foram enviadas para o sistema como PAGAS.\n\n`;
            }
        } else {
            message += `*⚠️ ATENÇÃO IMPORTANTE:*\n`;
            message += `As rifas foram enviadas para o sistema como RESERVADAS PENDENTES.\n`;
            message += `Status: Aguardando pagamento em dinheiro.\n\n`;
        }
    }
    
    if (paymentMethod === 'dinheiro') {
        const cashAmount = currentOrder.cashAmount || null;
        const cashChange = currentOrder.cashChange || 0;
        
        message += `*💵 PAGAMENTO EM DINHEIRO*\n`;
        if (cashAmount) {
            message += `• Valor informado: R$ ${cashAmount.toFixed(2)}\n`;
            if (cashChange > 0) {
                message += `• Troco necessário: R$ ${cashChange.toFixed(2)}\n`;
            }
        }
        message += `\n`;
    }
    
    message += `*📦 ENTREGA:* ${deliveryOption === 'retirada' ? '🏫 Retirada na Escola' : '🚚 Entrega a Domicílio'}\n`;
    
    if (deliveryOption === 'entrega' && deliveryAddress) {
        message += `📍 ${deliveryAddress.street || ''}, ${deliveryAddress.number || ''}\n`;
        if (deliveryAddress.complement) {
            message += `🏠 Complemento: ${deliveryAddress.complement}\n`;
        }
        message += `🏘️ Bairro: ${deliveryAddress.neighborhood || ''}\n`;
    }
    
    message += `\n`;
    message += `*📞 CONTATO DO CLIENTE:*\n`;
    message += `👤 ${customerName}\n`;
    message += `📱 ${customerPhone}\n\n`;
    
    message += `*📋 INFORMAÇÕES DO PEDIDO:*\n`;
    message += `🔢 Pedido: ${currentOrder.id}\n`;
    message += `⏰ Data: ${currentOrder.date || new Date().toLocaleDateString('pt-BR')}\n`;
    message += `💳 Forma: ${paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}\n`;
    message += `💰 Total: R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`;
    
    message += `*📱 CONTATO DA LOJA:*\n`;
    message += `📞 WhatsApp: ${vendorInfo.whatsapp}\n`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [currentOrder, vendorInfo, rafflesConfirmed, showToast, getCustomerName]);

  // ========== FUNÇÃO PARA CONFIRMAR PAGAMENTO EM DINHEIRO ==========
  const handleConfirmCashPayment = useCallback(async () => {
    if (!currentOrder) {
      showToast('error', 'Pedido não encontrado');
      return;
    }

    // Validar input de dinheiro
    if (!validateCashInput()) {
      return;
    }

    setLoading(true);
    console.log('💵 INICIANDO PAGAMENTO DINHEIRO...');
    
    try {
      // PASSO 1: Enviar para Firebase (usando a função do CartContext)
      const success = await confirmRafflesInOrder(currentOrder.id);
        
      if (!success) {
        console.error('❌ Falha ao enviar para Firebase');
        showToast('error', '❌ Erro ao reservar rifas no sistema. Tente novamente.');
        setLoading(false);
        return;
      }
      
      console.log('✅ Rifas enviadas para Firebase com sucesso!');
      
      // PASSO 2: Gerar link do WhatsApp
      console.log('📱 Gerando link do WhatsApp...');
      const url = generateWhatsAppMessage();
      
      if (url === '#') {
        showToast('error', 'Erro: WhatsApp não configurado');
        setLoading(false);
        return;
      }
      
      // PASSO 3: Abrir WhatsApp
      console.log('📤 Abrindo WhatsApp...');
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        showToast('error', 'Por favor, permita pop-ups para abrir o WhatsApp');
        setLoading(false);
        return;
      }
      
      // PASSO 4: Atualizar estado
      setProofSent(true);
      savePersistentSession();
      
      console.log('🎉 PROCESSO DINHEIRO CONCLUÍDO!');
      console.log('✅ Rifas enviadas para Firebase como PENDENTES');
      console.log('✅ WhatsApp aberto para confirmação');
      
      showToast('success', '✅ Rifas enviadas para o sistema! Admin já vê sua reserva.');
      
      // PASSO 5: Limpar carrinho e fechar modal
      setTimeout(() => {
        if (clearCartAfterConfirmation) {
          clearCartAfterConfirmation();
        }
        handleCloseModal();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro crítico no processo dinheiro:', error);
      showToast('error', '❌ Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [
    currentOrder, 
    validateCashInput, 
    confirmRafflesInOrder, 
    generateWhatsAppMessage, 
    clearCartAfterConfirmation, 
    handleCloseModal,
    showToast,
    savePersistentSession
  ]);

  // ========== FUNÇÃO PARA ALTERAÇÃO DO INPUT DE DINHEIRO ==========
  const handleCashInputChange = useCallback((e) => {
    const rawValue = e.target.value;
    
    // Mantém apenas números
    const numbers = rawValue.replace(/\D/g, '');
    
    // Se for vazio, limpa tudo
    if (!numbers) {
      setCashInput('');
      setCashError('');
      setShowCashSuggestions(false);
      return;
    }
    
    // Converte para número com centavos
    const numericValue = parseFloat(numbers) / 100;
    
    if (isNaN(numericValue)) {
      setCashInput('');
      return;
    }
    
    // Formata como moeda
    const formatted = numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Atualiza estado
    setCashInput(formatted);
    setCashError('');
    
    // Atualiza no contexto se for válido
    if (currentOrder && !isNaN(numericValue)) {
      currentOrder.cashAmount = numericValue;
      currentOrder.cashChange = Math.max(0, (numericValue - (currentOrder.total || 0)));
    }
    
    // Gerar sugestões
    const newSuggestions = generateChangeSuggestions();
    setCashSuggestions(newSuggestions);
    if (newSuggestions.length > 0) {
      setShowCashSuggestions(true);
    }
  }, [currentOrder, generateChangeSuggestions]);

  // ========== FUNÇÃO PARA TECLAS NO INPUT DE DINHEIRO ==========
  const handleCashInputKeyDown = useCallback((e) => {
    // Permite apenas números e teclas de controle
    if (
      e.key.length === 1 && // Caractere único
      !/\d/.test(e.key) && // Não é número
      e.key !== ',' && e.key !== '.' // Não é separador decimal
    ) {
      e.preventDefault();
      return;
    }
    
    // Se for Enter, submeter
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmCashPayment();
    }
  }, [handleConfirmCashPayment]);

  // ========== FUNÇÃO PARA SELECIONAR SUGESTÃO ==========
  const handleSuggestionSelect = useCallback((suggestion) => {
    setCashInput(`R$ ${suggestion.value.toFixed(2)}`);
    setShowCashSuggestions(false);
    
    if (currentOrder) {
      currentOrder.cashAmount = suggestion.value;
      currentOrder.cashChange = suggestion.change;
    }
    
    // Focar no botão de ação
    setTimeout(() => {
      const actionButton = document.querySelector('.main-actions button');
      if (actionButton) actionButton.focus();
    }, 10);
  }, [currentOrder]);

  // ========== FUNÇÃO PARA VALOR RÁPIDO ==========
  const handleQuickAmount = useCallback((amount) => {
    setCashInput(`R$ ${amount.toFixed(2)}`);
    setCashError('');
    setShowCashSuggestions(false);
    
    if (currentOrder) {
      currentOrder.cashAmount = amount;
      currentOrder.cashChange = Math.max(0, amount - (currentOrder.total || 0));
    }
  }, [currentOrder]);

  // ========== FUNÇÃO PARA AJUSTAR VALOR ==========
  const handleAdjustAmount = useCallback((operation) => {
    const currentValue = parseFloat(
      cashInput
        .replace(/R\$/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.')
        .trim()
    ) || 0;
    
    let newValue = currentValue;
    
    if (operation === 'add-1') newValue += 1;
    else if (operation === 'subtract-1') newValue = Math.max(0, currentValue - 1);
    else if (operation === 'add-5') newValue += 5;
    else if (operation === 'subtract-5') newValue = Math.max(0, currentValue - 5);
    
    setCashInput(`R$ ${newValue.toFixed(2)}`);
    setCashError('');
    setShowCashSuggestions(false);
    
    if (currentOrder) {
      currentOrder.cashAmount = newValue;
      currentOrder.cashChange = Math.max(0, newValue - (currentOrder.total || 0));
    }
  }, [cashInput, currentOrder]);

  // ========== FUNÇÃO PARA VALOR EXATO ==========
  const handleExactAmount = useCallback(() => {
    const total = currentOrder?.total || 0;
    setCashInput(`R$ ${total.toFixed(2)}`);
    setCashError('');
    setShowCashSuggestions(false);
    
    if (currentOrder) {
      currentOrder.cashAmount = total;
      currentOrder.cashChange = 0;
    }
  }, [currentOrder]);

  // ========== FUNÇÃO PARA LIMPAR INPUT ==========
  const handleClearCashInput = useCallback(() => {
    setCashInput('');
    setCashError('');
    setShowCashSuggestions(false);
    
    if (currentOrder) {
      currentOrder.cashAmount = null;
      currentOrder.cashChange = 0;
    }
    
    // Focar no input após limpar
    setTimeout(() => {
      if (cashInputRef.current) {
        cashInputRef.current.focus();
        cashInputRef.current.select();
      }
    }, 10);
  }, [currentOrder]);

  // ========== FUNÇÃO PARA COPIAR CHAVE PIX ==========
  const handleCopyPixKey = useCallback(() => {
    if (!vendorInfo?.pixKey) {
      console.error('Chave PIX não disponível');
      showToast('error', 'Chave PIX não disponível');
      return;
    }
    
    navigator.clipboard.writeText(vendorInfo.pixKey)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast('success', 'Chave PIX copiada!');
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        showToast('error', 'Erro ao copiar chave PIX');
      });
  }, [vendorInfo?.pixKey, showToast]);

  // ========== FUNÇÃO PARA ENVIAR COMPROVANTE PIX ==========
  const handleSendProof = useCallback(() => {
    const url = generateWhatsAppMessage();
    if (url !== '#') {
      window.open(url, '_blank');
      setProofSent(true);
      savePersistentSession();
      showToast('info', 'WhatsApp aberto! Envie o comprovante e DEPOIS VOLTE AQUI para clicar em "Já enviei o comprovante".');
    }
  }, [generateWhatsAppMessage, savePersistentSession, showToast]);

  // ========== FUNÇÃO PARA CONFIRMAR PAGAMENTO PIX ==========
  const handleConfirmPixPayment = useCallback(async () => {
    if (!currentOrder) {
      showToast('error', 'Pedido não encontrado');
      return;
    }

    if (loading) return; // Evitar múltiplos cliques
    
    setLoading(true);
    
    try {
      console.log('💰 CONFIRMANDO PAGAMENTO PIX - ENVIANDO PARA FIREBASE...');
      
      // USAR a função do CartContext que já faz todo o processo
      const success = await confirmRafflesInOrder(currentOrder.id);
      
      if (success) {
        setRafflesConfirmed(true);
        setProofSent(true);
        
        // Limpar sessão persistente
        clearPersistentSession();
        
        console.log('✅ PAGAMENTO PIX CONFIRMADO! Rifas enviadas para Firebase como PAGAS.');
        
        // Mostrar sucesso e fechar
        setTimeout(() => {
          showToast('success', '✅ Rifas confirmadas no sistema! Admin já vê como PAGAS.');
          handleCloseModal();
        }, 2000);
        
      } else {
        console.error('❌ Erro ao confirmar pagamento via confirmRafflesInOrder');
        showToast('error', '❌ Erro ao confirmar pagamento. Tente novamente.');
      }
      
    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      showToast('error', '❌ Erro ao processar confirmação');
    } finally {
      setLoading(false);
    }
  }, [
    currentOrder, 
    loading, 
    confirmRafflesInOrder, 
    showToast, 
    handleCloseModal, 
    clearPersistentSession
  ]);

  // ========== FUNÇÃO DE EMERGÊNCIA PARA ENVIO MANUAL ==========
  const handleEmergencyManualSend = useCallback(async () => {
    if (!currentOrder || !raffleManager) return;
    
    setLoading(true);
    setManualSendResults([]);
    
    const raffleItems = currentOrder.items?.filter(item => item.isRaffle) || [];
    const results = [];
    
    try {
      for (const item of raffleItems) {
        try {
          const saleData = {
            turma: item.selectedClass,
            numero: item.selectedNumber,
            nome: getCustomerName(),
            telefone: currentOrder.customer?.phone || '',
            status: currentOrder.paymentMethod === 'pix' ? 'pago' : 'pendente',
            paymentMethod: currentOrder.paymentMethod || 'pix',
            orderId: currentOrder.id,
            price: 15.00,
            source: 'emergency_manual'
          };
          
          console.log('🚨 ENVIO MANUAL DE EMERGÊNCIA:', saleData);
          
          const result = await raffleManager.sendToFirebase(saleData);
          
          results.push({
            item: `${item.selectedClass} Nº ${item.selectedNumber}`,
            success: result.success,
            error: result.error,
            firebaseId: result.firebaseId
          });
          
          if (result.success) {
            console.log('✅ Enviado com sucesso:', result.firebaseId);
            showToast('success', `✅ ${item.selectedClass} Nº ${item.selectedNumber} enviado!`);
          } else {
            console.error('❌ Falha:', result.error);
            showToast('error', `❌ ${item.selectedClass} Nº ${item.selectedNumber}: ${result.error}`);
          }
          
          // Aguardar entre envios
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error('❌ Erro no item:', error);
          results.push({
            item: `${item.selectedClass} Nº ${item.selectedNumber}`,
            success: false,
            error: error.message
          });
        }
      }
      
      setManualSendResults(results);
      
      // Verificar resultados
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        setRafflesConfirmed(true);
        showToast('success', `✅ ${successCount} rifa(s) enviadas manualmente!`);
        
        // Atualizar pedido
        const updatedOrder = {
          ...currentOrder,
          status: 'confirmed',
          rafflesConfirmed: true,
          emergencyManualSent: true,
          manualResults: results
        };
        
        localStorage.setItem('terceirao_last_order', JSON.stringify(updatedOrder));
        
        // Limpar carrinho
        setTimeout(() => {
          if (clearCartAfterConfirmation) {
            clearCartAfterConfirmation();
          }
        }, 2000);
      }
      
      if (failedCount > 0) {
        showToast('error', `❌ ${failedCount} rifa(s) falharam. Verifique console.`);
      }
      
    } catch (error) {
      console.error('❌ Erro crítico no envio manual:', error);
      showToast('error', '❌ Erro crítico no envio manual');
    } finally {
      setLoading(false);
    }
  }, [currentOrder, raffleManager, getCustomerName, showToast, clearCartAfterConfirmation]);

  // ========== FUNÇÃO PARA BAIXAR COMPROVANTE ==========
  const handleDownloadReceipt = useCallback(() => {
    if (!currentOrder) return;
    
    const deliveryOption = currentOrder.deliveryOption || 'retirada';
    const deliveryAddress = currentOrder.deliveryAddress || null;
    const paymentMethod = currentOrder.paymentMethod || 'pix';
    const cashAmount = currentOrder.cashAmount || null;
    const cashChange = currentOrder.cashChange || 0;
    
    const customerName = getCustomerName();
    
    const hasRaffles = currentOrder.items?.some(item => item.isRaffle) || false;
    
    let receiptText = `🎓 COMPROVANTE DE PEDIDO - TERCEIRÃO 2026\n`;
    receiptText += `==========================================\n\n`;
    receiptText += `Pedido #${currentOrder.id}\n`;
    receiptText += `Data: ${currentOrder.date}\n`;
    receiptText += `Status: ${proofSent ? (rafflesConfirmed ? 'PAGO' : 'AGUARDANDO CONFIRMAÇÃO') : 'AGUARDANDO PAGAMENTO'}\n\n`;
    
    // AVISO IMPORTANTE SOBRE AS RIFAS
    receiptText += `⚠️ INFORMAÇÃO CRÍTICA SOBRE AS RIFAS:\n`;
    if (paymentMethod === 'pix' && !rafflesConfirmed) {
      receiptText += `• As rifas estão APENAS NO CARRINHO\n`;
      receiptText += `• O ADMINISTRADOR NÃO VÊ ESTAS RIFAS AINDA\n`;
      receiptText += `• Você DEVE clicar em "Já enviei o comprovante"\n`;
      receiptText += `• Só assim as rifas serão enviadas para o sistema\n\n`;
    } else if (paymentMethod === 'dinheiro' && proofSent) {
      receiptText += `• As rifas foram enviadas como RESERVADAS PENDENTES\n`;
      receiptText += `• O administrador já vê sua reserva no sistema\n`;
      receiptText += `• Status: Aguardando pagamento em dinheiro\n\n`;
    }
    
    receiptText += `DADOS DO CLIENTE:\n`;
    receiptText += `Nome: ${customerName}\n`;
    receiptText += `Telefone: ${currentOrder.customer?.phone || 'Não informado'}\n`;
    receiptText += `Email: ${currentOrder.customer?.email || 'Não informado'}\n\n`;

    if (hasRaffles) {
      const raffleItems = currentOrder.items?.filter(item => item.isRaffle) || [];
      receiptText += `🎟️ RIFAS ${rafflesConfirmed ? 'PAGAS' : proofSent && paymentMethod === 'dinheiro' ? 'RESERVADAS (PENDENTE)' : 'NO CARRINHO'}:\n`;
      raffleItems.forEach((item, index) => {
        receiptText += `• ${item.name || 'Rifa'} - ${item.selectedClass || ''} Nº ${item.selectedNumber?.toString().padStart(3, '0') || ''}\n`;
      });
      receiptText += `\n`;
    }
    
    receiptText += `INFORMAÇÕES DE PAGAMENTO:\n`;
    if (paymentMethod === 'pix') {
      receiptText += `Forma de pagamento: PIX\n`;
      receiptText += `Valor: R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n`;
      receiptText += `Status: ${proofSent ? (rafflesConfirmed ? 'CONFIRMADO' : 'Comprovante enviado (aguardando sua confirmação)') : 'Aguardando pagamento'}\n`;
      receiptText += `Chave PIX: ${vendorInfo?.pixKey || 'Não configurada'}\n\n`;
    } else {
      receiptText += `Forma de pagamento: DINHEIRO\n`;
      receiptText += `Valor a pagar: R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n`;
      if (cashAmount) {
        receiptText += `Valor informado: R$ ${cashAmount.toFixed(2)}\n`;
        if (cashChange > 0) {
          receiptText += `Troco necessário: R$ ${cashChange.toFixed(2)}\n`;
        }
      }
      receiptText += `Pagamento na ${deliveryOption === 'retirada' ? 'retirada' : 'entrega'}\n\n`;
    }

    receiptText += `INFORMAÇÕES DE ENTREGA:\n`;
    if (deliveryOption === 'retirada') {
      receiptText += `Tipo: Retirada na Escola\n`;
      receiptText += `Local: Escola Estadual\n`;
      receiptText += `Horário: Combinar via WhatsApp\n\n`;
    } else {
      receiptText += `Tipo: Entrega a Domicílio\n`;
      if (deliveryAddress) {
        receiptText += `Endereço: ${deliveryAddress.street || ''}, ${deliveryAddress.number || ''}\n`;
        if (deliveryAddress.complement) {
          receiptText += `Complemento: ${deliveryAddress.complement}\n`;
        }
        receiptText += `Bairro: ${deliveryAddress.neighborhood || ''}\n`;
        if (deliveryAddress.reference) {
          receiptText += `Referência: ${deliveryAddress.reference}\n`;
        }
      }
      receiptText += `Taxa de entrega: R$ 3,00\n\n`;
    }

    receiptText += `ITENS DO PEDIDO:\n`;
    if (currentOrder.items?.length > 0) {
      currentOrder.items.forEach(item => {
        if (item.isRaffle) {
          receiptText += `• ${item.quantity || 1}x ${item.name || 'Rifa'} - ${item.selectedClass || ''} Nº ${item.selectedNumber?.toString().padStart(3, '0') || ''} - R$ ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}\n`;
        } else {
          receiptText += `• ${item.quantity || 1}x ${item.name || 'Produto'} - R$ ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}\n`;
        }
      });
    } else {
      receiptText += `• Nenhum item listado\n`;
    }
    receiptText += `\n`;

    if (deliveryOption === 'entrega') {
      receiptText += `RESUMO FINANCEIRO:\n`;
      receiptText += `Subtotal: R$ ${currentOrder.subtotal?.toFixed(2) || (currentOrder.total - 3).toFixed(2)}\n`;
      receiptText += `Taxa de entrega: R$ 3,00\n`;
      receiptText += `TOTAL: R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`;
    } else {
      receiptText += `TOTAL: R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`;
    }

    receiptText += `INSTRUÇÕES:\n`;
    if (paymentMethod === 'pix') {
      if (!proofSent) {
        receiptText += `1. Faça o pagamento PIX\n`;
        receiptText += `2. Envie o comprovante pelo WhatsApp\n`;
        receiptText += `3. Volte aqui e clique em "Já enviei o comprovante"\n`;
        receiptText += `4. Rifas serão enviadas para o sistema como PAGAS\n`;
      } else if (!rafflesConfirmed) {
        receiptText += `⚠️ Comprovante enviado! AGORA CLIQUE NO BOTÃO:\n`;
        receiptText += `"Já enviei o comprovante" para confirmar as rifas.\n`;
        receiptText += `⚠️ ATENÇÃO: O admin NÃO VÊ suas rifas até você clicar!\n`;
      } else {
        receiptText += `✅ Pagamento confirmado! Rifas estão PAGAS no sistema.\n`;
      }
    } else {
      receiptText += `1. Prepare o valor em dinheiro\n`;
      receiptText += `2. Clique em "Enviar para WhatsApp" (já fez)\n`;
      receiptText += `3. Rifas foram enviadas como PENDENTES\n`;
      receiptText += `4. Admin já vê sua reserva no sistema\n`;
      receiptText += `5. Após pagamento físico, admin marcará como PAGAS\n`;
    }

    receiptText += `\n==========================================\n`;
    receiptText += `Guarde este comprovante para referência.`;

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
      showToast('success', 'Comprovante baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error);
      showToast('error', 'Erro ao baixar comprovante');
    }
  }, [
    currentOrder, 
    proofSent, 
    rafflesConfirmed, 
    vendorInfo?.pixKey, 
    getCustomerName, 
    showToast
  ]);

  // ========== FUNÇÃO PARA RESTAURAR SESSÃO ==========
  const handleRestoreSession = useCallback(() => {
    if (persistentSession) {
      setHasPendingPayment(true);
      setPaymentTimestamp(persistentSession.paymentTimestamp);
      setProofSent(persistentSession.hasSentProof || false);
      
      showToast('info', 'Sessão restaurada! Continue de onde parou.');
    }
  }, [persistentSession, showToast]);

  // ========== FUNÇÃO PARA TESTAR CONEXÃO COM FIREBASE ==========
  const testFirebaseConnection = useCallback(async () => {
    setLoading(true);
    try {
      if (raffleManager.debugFirebaseConnection) {
        await raffleManager.debugFirebaseConnection();
      } else {
        showToast('error', 'Função de debug não disponível');
      }
    } finally {
      setLoading(false);
    }
  }, [raffleManager, showToast]);

  // ========== VERIFICAÇÃO DAS RIFAS ==========
  useEffect(() => {
    if (showPayment && currentOrder) {
      console.log('🔄 Payment - Estado atual das rifas:');
      
      const raffleItems = currentOrder.items?.filter(item => item.isRaffle) || [];
      raffleItems.forEach(item => {
        if (item.selectedClass && item.selectedNumber) {
          const isSold = raffleManager?.isNumberSold?.(item.selectedClass, item.selectedNumber);
          const isReserved = raffleManager?.isNumberReserved?.(item.selectedClass, item.selectedNumber);
          
          console.log(`🎟️ ${item.selectedClass} Nº ${item.selectedNumber}:`, {
            vendido: isSold,
            reservado: isReserved,
            status: isSold ? 'VENDIDO' : isReserved ? 'RESERVADO' : 'DISPONÍVEL'
          });
        }
      });
    }
  }, [showPayment, currentOrder, raffleManager]);

  // ========== CARREGAR SESSÃO PERSISTENTE AO ABRIR ==========
  useEffect(() => {
    if (showPayment && currentOrder) {
      loadPersistentSession();
      
      // Inicializar input de dinheiro se houver valor salvo
      if (currentOrder.paymentMethod === 'dinheiro' && currentOrder.cashAmount) {
        setCashInput(`R$ ${currentOrder.cashAmount.toFixed(2)}`);
      }
      
      // Verificar se já confirmou as rifas
      const savedOrder = JSON.parse(localStorage.getItem('terceirao_last_order') || '{}');
      
      if (savedOrder.rafflesConfirmed) {
        setRafflesConfirmed(true);
        setProofSent(true);
      }
      
      // Para dinheiro: verificar se já enviou WhatsApp
      if (currentOrder.paymentMethod === 'dinheiro') {
        if (savedOrder.whatsappSent || savedOrder.status === 'pending_cash') {
          setProofSent(true);
        } else {
          setProofSent(false);
        }
      }
      
      // Verificar debug mode pela URL
      if (window.location.search.includes('debug=true')) {
        setDebugMode(true);
        console.log('🔍 Modo debug ativado');
      }
    }
  }, [showPayment, currentOrder, loadPersistentSession]);

  // ========== FECHAR MODAL COM ESC ==========
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showPayment) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPayment, handleCloseModal]);

  // ========== FOCAR NO MODAL QUANDO ABRIR ==========
  useEffect(() => {
    if (showPayment) {
      document.body.style.overflow = 'hidden';
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPayment]);

  // ========== LIMPAR TIMEOUT AO DESMONTAR ==========
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // ========== CLIQUE NO OVERLAY PARA FECHAR ==========
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('payment-overlay')) {
      handleCloseModal();
    }
  };

  // ========== RENDERIZAÇÃO ==========

  if (!currentOrder || !showPayment) {
    return null;
  }

  const deliveryOption = currentOrder.deliveryOption || 'retirada';
  const deliveryAddress = currentOrder.deliveryAddress || null;
  const paymentMethod = currentOrder.paymentMethod || 'pix';

  const hasRaffles = currentOrder.items?.some(item => item.isRaffle) || false;
  const raffleItems = hasRaffles ? currentOrder.items?.filter(item => item.isRaffle) : [];

  // Use Portal para renderizar no body
  return ReactDOM.createPortal(
    <div 
      className="payment-overlay" 
      onClick={handleOverlayClick}
      ref={modalRef}
      tabIndex="-1"
    >
      <div className="payment-container" onClick={e => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="payment-header">
          <div className="header-content">
            <h2 className="payment-title">
              {paymentMethod === 'pix' ? 'Pagamento via PIX' : 'Pagamento em Dinheiro'}
            </h2>
            <p className="payment-subtitle">
              Pedido #{currentOrder.id} • R$ {currentOrder.total?.toFixed(2) || '0.00'}
            </p>
            
            <p className="delivery-info-preview">
              📦 {deliveryOption === 'retirada' ? 'Retirada na Escola' : `Entrega a Domicílio (+R$ 3,00)`}
              {deliveryOption === 'entrega' && deliveryAddress && deliveryAddress.neighborhood && (
                <span> • {deliveryAddress.neighborhood}</span>
              )}
            </p>
            
            {/* Status do Firebase */}
            <div className="firebase-status-indicator">
              <div className={`status-dot ${raffleManager.firebaseConnected ? 'connected' : 'disconnected'}`}></div>
              <span>Sistema: {raffleManager.firebaseConnected ? '✅ Conectado' : '❌ Offline'}</span>
            </div>
            
            {/* Banner de recuperação de sessão */}
            {persistentSession && !hasPendingPayment && (
              <div className="session-recovery-banner">
                <RefreshCw size={16} />
                <span>Sessão recuperada! 
                  <button onClick={handleRestoreSession} className="recovery-link">
                    Continuar de onde parou
                  </button>
                </span>
              </div>
            )}
            
            {/* Banner de pagamento pendente */}
            {hasPendingPayment && !proofSent && (
              <div className="pending-payment-banner">
                <AlertCircle size={16} />
                <span>⚠️ Você tem um pagamento pendente. Complete o processo abaixo.</span>
              </div>
            )}
            
            {/* Banner de comprovante enviado */}
            {proofSent && !rafflesConfirmed && paymentMethod === 'pix' && (
              <div className="proof-sent-banner">
                <Send size={16} />
                <span>✅ Comprovante enviado! <strong>Agora CONFIRME as rifas clicando no botão abaixo.</strong></span>
              </div>
            )}
            
            {/* Banner de rifas confirmadas */}
            {rafflesConfirmed && (
              <div className="raffles-confirmed-banner">
                <Check size={16} />
                <span>🎉 Rifas confirmadas como PAGAS no sistema! Admin já vê.</span>
              </div>
            )}
            
            {/* Aviso para dinheiro */}
            {paymentMethod === 'dinheiro' && proofSent && (
              <div className="cash-sent-banner">
                <MessageCircle size={16} />
                <span>💬 Mensagem enviada! Rifas foram para o sistema como RESERVADAS PENDENTES.</span>
              </div>
            )}
          </div>
          
          <button 
            className="close-btn" 
            onClick={handleCloseModal}
            aria-label="Fechar"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Aviso sobre entrega */}
        {deliveryOption === 'entrega' && (
          <div className="delivery-notice">
            <div className="notice-icon">🚚</div>
            <div className="notice-content">
              <strong>Entrega a Domicílio:</strong> Taxa de R$ 3,00 incluída no valor total.
            </div>
          </div>
        )}

        <div className="payment-content">
          {/* Etapas do processo */}
          <div className="steps-container">
            <div className={`step ${!proofSent ? 'active' : ''}`}>
              <div className="step-icon">1</div>
              <div className="step-text">
                <h4>{paymentMethod === 'pix' ? 'Pagar PIX' : 'Verificar valor'}</h4>
                <p>{paymentMethod === 'pix' ? 'Faça o pagamento' : 'Confirme o total'}</p>
              </div>
            </div>
            
            <div className="step-line"></div>
            
            <div className={`step ${proofSent && !rafflesConfirmed ? 'active' : ''}`}>
              <div className="step-icon">2</div>
              <div className="step-text">
                <h4>{paymentMethod === 'pix' ? 'Enviar comprovante' : 'Enviar confirmação'}</h4>
                <p>{paymentMethod === 'pix' ? 'Via WhatsApp' : 'Via WhatsApp'}</p>
              </div>
            </div>
            
            <div className="step-line"></div>
            
            <div className={`step ${(rafflesConfirmed || (proofSent && paymentMethod === 'dinheiro')) ? 'active' : ''}`}>
              <div className="step-icon">3</div>
              <div className="step-text">
                <h4>Confirmar Rifas</h4>
                <p>{paymentMethod === 'pix' ? 'Marcar como PAGAS' : 'Reservar no sistema'}</p>
              </div>
            </div>
          </div>

          {/* Informações das Rifas */}
          {hasRaffles && (
            <div className="raffle-info-section">
              <div className="raffle-info-header">
                <span className="raffle-info-icon">🎟️</span>
                <h4>Status das Rifas</h4>
              </div>
              <div className="raffle-info-content">
                <p><strong>Rifas no pedido:</strong> {raffleItems.length} número(s)</p>
                
                <div className="raffle-numbers-list">
                  {raffleItems.slice(0, 5).map((item, index) => (
                    <span key={index} className="raffle-number-badge">
                      {item.selectedClass || ''} Nº {item.selectedNumber?.toString().padStart(3, '0') || ''}
                    </span>
                  ))}
                  {raffleItems.length > 5 && (
                    <span className="raffle-more">+ {raffleItems.length - 5} mais</span>
                  )}
                </div>
                
                <div className={`raffle-status-message ${rafflesConfirmed ? 'confirmed' : proofSent ? 'pending' : 'no-carrinho'}`}>
                  {rafflesConfirmed ? (
                    <>
                      <Check size={16} />
                      <span>✅ <strong>PAGAS NO SISTEMA</strong> - Admin já vê as rifas como vendidas</span>
                    </>
                  ) : proofSent && paymentMethod === 'dinheiro' ? (
                    <>
                      <Clock size={16} />
                      <span>⏳ <strong>RESERVADAS NO SISTEMA</strong> - Admin vê como "aguardando pagamento"</span>
                    </>
                  ) : proofSent && paymentMethod === 'pix' ? (
                    <>
                      <AlertCircle size={16} />
                      <span>⚠️ <strong>AGUARDANDO SUA CONFIRMAÇÃO FINAL</strong> - Clique no botão abaixo para enviar ao sistema</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} />
                      <span>🛒 <strong>APENAS NO CARRINHO</strong> - {paymentMethod === 'pix' ? 'Aguardando pagamento PIX' : 'Aguardando confirmação via WhatsApp'}</span>
                    </>
                  )}
                </div>
                
                {!rafflesConfirmed && paymentMethod === 'pix' && !proofSent && (
                  <p className="raffle-warning critical">
                    ⚠️ <strong>CRÍTICO:</strong> As rifas estão APENAS no seu carrinho. O administrador NÃO VÊ estas rifas. Elas só serão enviadas para o sistema após você clicar em "Já enviei o comprovante".
                  </p>
                )}
                
                {!rafflesConfirmed && paymentMethod === 'dinheiro' && !proofSent && (
                  <p className="raffle-warning">
                    ⚠️ <strong>Importante:</strong> As rifas serão enviadas para o sistema como RESERVADAS PENDENTES ao clicar em "Enviar para WhatsApp". O admin verá sua reserva aguardando pagamento.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Seção de Pagamento PIX */}
          {paymentMethod === 'pix' && (
            <div className="pix-section">
              <div className="pix-header">
                <QrCode size={24} />
                <h3>Pagamento via PIX</h3>
              </div>
              
              {!proofSent ? (
                <>
                  <div className="qr-code-container">
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
                  </div>

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
                  </div>
                  
                  <div className="pix-instructions-card">
                    <h4>📋 COMO PROCEDER (LEIA COM ATENÇÃO):</h4>
                    <ol>
                      <li><strong>Faça o pagamento PIX</strong> usando o QR Code ou chave acima</li>
                      <li><strong>Tire uma foto do comprovante</strong></li>
                      <li>Clique em <strong>"Enviar Comprovante"</strong> abaixo</li>
                      <li>O WhatsApp abrirá com uma mensagem pronta</li>
                      <li><strong>Anexe a foto do comprovante</strong> e envie</li>
                      <li><strong>VOLTE AQUI E CLIQUE EM "JÁ ENVIEI O COMPROVANTE"</strong> (ETAPA FINAL E OBRIGATÓRIA)</li>
                    </ol>
                    <p className="final-warning">
                      ⚠️ <strong>NÃO PULE A ÚLTIMA ETAPA!</strong> As rifas só vão para o sistema quando você clicar no botão final.
                    </p>
                  </div>
                </>
              ) : (
                <div className="proof-sent-container">
                  <div className="proof-sent-icon">📤</div>
                  <h4>Comprovante Enviado</h4>
                  <p>Você já enviou o comprovante pelo WhatsApp. <strong>AGORA É NECESSÁRIO CONFIRMAR AS RIFAS.</strong></p>
                  
                  <div className="whatsapp-preview">
                    <div className="whatsapp-header">
                      <MessageCircle size={20} />
                      <span>Mensagem enviada para:</span>
                    </div>
                    <p className="whatsapp-number">{vendorInfo?.whatsapp || 'Não configurado'}</p>
                  </div>
                  
                  <div className="final-confirmation-notice">
                    <AlertCircle size={20} />
                    <div>
                      <h5>ETAPA FINAL E OBRIGATÓRIA</h5>
                      <p><strong>As rifas ainda não foram para o sistema!</strong> Clique no botão abaixo para confirmar e enviar as rifas como PAGAS.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seção de Pagamento em Dinheiro (MELHORADA) */}
          {paymentMethod === 'dinheiro' && (
            <div className="cash-payment-section">
              <div className="cash-header">
                <Wallet size={24} />
                <h3>Pagamento em Dinheiro</h3>
              </div>
              
              <div className="cash-details-container">
                {/* Cartão de Informações do Pedido */}
                <div className="order-summary-card">
                  <div className="order-summary-header">
                    <Calculator size={20} />
                    <h4>Resumo do Pedido</h4>
                  </div>
                  
                  <div className="order-summary-content">
                    <div className="summary-row">
                      <span>Total a pagar:</span>
                      <span className="summary-total">R$ {currentOrder?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="summary-note">
                      💰 Informe abaixo o valor que você tem em dinheiro para calcularmos o troco
                    </div>
                  </div>
                </div>

                {/* Cartão de Input de Dinheiro */}
                <div className="cash-input-card">
                  <div className="cash-input-header">
                    <DollarSign size={20} />
                    <h4>Valor Entregue</h4>
                    <span className="input-hint">(digite apenas números)</span>
                  </div>
                  
                  <div className="cash-input-section">
                    <div className="cash-input-group">
                      <div className="cash-input-wrapper">
                        <span className="currency-symbol">R$</span>
                        <input
                          ref={cashInputRef}
                          type="text"
                          className={`cash-input ${cashError ? 'error' : ''}`}
                          value={cashInput}
                          onChange={handleCashInputChange}
                          onKeyDown={handleCashInputKeyDown}
                          onFocus={(e) => {
                            if (blurTimeoutRef.current) {
                              clearTimeout(blurTimeoutRef.current);
                            }
                            e.target.select();
                            setShowCashSuggestions(true);
                          }}
                          onBlur={() => {
                            blurTimeoutRef.current = setTimeout(() => {
                              setShowCashSuggestions(false);
                            }, 200);
                          }}
                          placeholder="0,00"
                          inputMode="decimal"
                          autoComplete="off"
                          spellCheck="false"
                          autoFocus
                        />
                        {cashInput && (
                          <button
                            type="button"
                            className="clear-cash-btn"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleClearCashInput();
                            }}
                            aria-label="Limpar valor"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      
                      {/* Controles de Ajuste Rápido */}
                      <div className="adjustment-controls">
                        <div className="adjustment-row">
                          <button
                            type="button"
                            className="adjust-btn subtract"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAdjustAmount('subtract-1');
                            }}
                            aria-label="Diminuir R$ 1"
                          >
                            <Minus size={14} />
                            <span>R$ 1</span>
                          </button>
                          <button
                            type="button"
                            className="adjust-btn add"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAdjustAmount('add-1');
                            }}
                            aria-label="Aumentar R$ 1"
                          >
                            <Plus size={14} />
                            <span>R$ 1</span>
                          </button>
                        </div>
                        
                        <div className="adjustment-row">
                          <button
                            type="button"
                            className="adjust-btn subtract"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAdjustAmount('subtract-5');
                            }}
                            aria-label="Diminuir R$ 5"
                          >
                            <Minus size={14} />
                            <span>R$ 5</span>
                          </button>
                          <button
                            type="button"
                            className="adjust-btn add"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAdjustAmount('add-5');
                            }}
                            aria-label="Aumentar R$ 5"
                          >
                            <Plus size={14} />
                            <span>R$ 5</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Botões de Valor Rápido */}
                      <div className="quick-amount-section">
                        <div className="quick-amount-header">
                          <span>Valores comuns:</span>
                        </div>
                        <div className="quick-amount-buttons">
                          <button
                            type="button"
                            className="quick-amount-btn"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleExactAmount();
                            }}
                          >
                            <Check size={14} />
                            <span>Valor exato</span>
                          </button>
                          
                          {[10, 20, 50, 100].map(amount => (
                            <button
                              key={amount}
                              type="button"
                              className="quick-amount-btn"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleQuickAmount(amount);
                              }}
                            >
                              <span>R$ {amount}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Sugestões Inteligentes */}
                      {showCashSuggestions && cashSuggestions.length > 0 && (
                        <div className="cash-suggestions">
                          <div className="suggestions-header">
                            <span>💡 Sugestões para facilitar o troco:</span>
                          </div>
                          <div className="suggestions-list">
                            {cashSuggestions.slice(0, 3).map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                className="suggestion-item"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSuggestionSelect(suggestion);
                                }}
                              >
                                <div className="suggestion-content">
                                  <div className="suggestion-label">
                                    {suggestion.label}
                                  </div>
                                  <div className="suggestion-change">
                                    Troco: R$ {suggestion.change.toFixed(2)}
                                  </div>
                                </div>
                                <div className="suggestion-arrow">→</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Mensagem de erro */}
                      {cashError && (
                        <div className="cash-error-message">
                          <AlertCircle size={16} />
                          <span>{cashError}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Resumo do Cálculo */}
                    <div className="calculation-summary">
                      <div className="calculation-row">
                        <div className="calculation-label">
                          <span>Total do pedido:</span>
                        </div>
                        <div className="calculation-value">
                          R$ {currentOrder?.total?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      
                      {cashInput && !isNaN(parseFloat(
                        cashInput
                          .replace(/R\$/g, '')
                          .replace(/\./g, '')
                          .replace(/,/g, '.')
                          .trim()
                      )) && (
                        <>
                          <div className="calculation-row">
                            <div className="calculation-label">
                              <span>Valor entregue:</span>
                            </div>
                            <div className="calculation-value delivered">
                              {cashInput}
                            </div>
                          </div>
                          
                          <div className="calculation-row change-row">
                            <div className="calculation-label">
                              <span>Troco necessário:</span>
                            </div>
                            <div className={`calculation-value change ${currentOrder?.cashChange > 0 ? 'needs-change' : 'exact'}`}>
                              {currentOrder?.cashChange > 0 
                                ? `R$ ${currentOrder.cashChange.toFixed(2)}`
                                : <><Check size={14} /> <span>Valor exato!</span></>}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instruções */}
                <div className="cash-instructions">
                  <div className="instructions-header">
                    <AlertCircle size={20} />
                    <h4>Como proceder</h4>
                  </div>
                  
                  <div className="instructions-steps">
                    <div className="instruction-step">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <strong>Informe o valor acima</strong> que você tem em dinheiro
                      </div>
                    </div>
                    
                    <div className="instruction-step">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <strong>Verifique o troco necessário</strong> que será calculado automaticamente
                      </div>
                    </div>
                    
                    <div className="instruction-step">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <strong>Clique no botão abaixo</strong> para reservar as rifas no sistema
                      </div>
                    </div>
                    
                    <div className="instruction-step">
                      <div className="step-number">4</div>
                      <div className="step-content">
                        <strong>Aguarde a confirmação</strong> após o pagamento físico
                      </div>
                    </div>
                  </div>
                  
                  <div className="instructions-note">
                    <AlertCircle size={16} />
                    <p>
                      <strong>Importante:</strong> As rifas serão enviadas para o sistema como 
                      <strong> RESERVADAS PENDENTES</strong> e só serão marcadas como PAGAS após 
                      a confirmação do administrador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações Principais */}
          <div className="main-actions">
            {paymentMethod === 'pix' ? (
              !proofSent ? (
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleSendProof}
                  disabled={loading}
                >
                  <span>1. Enviar Comprovante pelo WhatsApp</span>
                </button>
              ) : !rafflesConfirmed ? (
                <>
                  <button 
                    className="btn btn-success btn-large final-confirmation-btn"
                    onClick={handleConfirmPixPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="loading-spinner" />
                        <span>Confirmando...</span>
                      </>
                    ) : (
                      <>
                        <span>2. JÁ ENVIEI O COMPROVANTE - CONFIRMAR RIFAS</span>
                      </>
                    )}
                  </button>
                  
                  {/* Botão de emergência para PIX */}
                  {debugMode && (
                    <button 
                      className="btn btn-emergency btn-large"
                      onClick={handleEmergencyManualSend}
                      disabled={loading}
                      style={{ marginTop: '10px' }}
                    >
                      <Shield size={20} />
                      <span>🚨 ENVIO MANUAL DE EMERGÊNCIA (Use se o botão acima não funcionar)</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="confirmed-message">
                  <Check size={24} />
                  <div>
                    <h4>✅ Pagamento Confirmado!</h4>
                    <p>Rifas foram enviadas para o sistema como PAGAS. Obrigado pela compra!</p>
                  </div>
                </div>
              )
            ) : paymentMethod === 'dinheiro' ? (
              !proofSent ? (
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleConfirmCashPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="loading-spinner" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} />
                      <span>Enviar para WhatsApp (Reservar Rifas)</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="confirmed-message cash">
                  <MessageCircle size={24} />
                  <div>
                    <h4>✅ Pedido Enviado!</h4>
                    <p>Rifas reservadas no sistema como PENDENTES. Aguarde confirmação do pagamento físico.</p>
                  </div>
                </div>
              )
            ) : null}
          </div>

          {/* Resultados do envio manual */}
          {manualSendResults.length > 0 && (
            <div className="manual-results-section">
              <h4>📊 Resultados do Envio Manual:</h4>
              <div className="results-list">
                {manualSendResults.map((result, index) => (
                  <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                    <span className="result-item-name">{result.item}</span>
                    <span className="result-status">
                      {result.success ? '✅ Enviado' : `❌ ${result.error}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações Extras */}
          <div className="extra-actions">
            <button 
              className="btn btn-outline"
              onClick={handleDownloadReceipt}
              type="button"
            >
              <Download size={18} />
              Baixar Comprovante
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleCloseModal}
              type="button"
            >
              Fechar
            </button>
            
            {/* Botão de debug (apenas em desenvolvimento ou com debug mode) */}
            {(process.env.NODE_ENV === 'development' || debugMode) && (
              <button 
                className="btn btn-warning"
                onClick={testFirebaseConnection}
                disabled={loading}
                type="button"
              >
                <RefreshCw size={18} />
                Testar Firebase
              </button>
            )}
          </div>

          {/* Informações Importantes */}
          <div className="important-info">
            <h4>📌 RESUMO DO FLUXO:</h4>
            
            {paymentMethod === 'pix' ? (
              <ul>
                {!proofSent ? (
                  <>
                    <li><strong>Apenas no carrinho:</strong> Rifas estão APENAS no seu carrinho</li>
                    <li><strong>Admin não vê:</strong> O administrador NÃO VÊ suas rifas ainda</li>
                    <li><strong>Confirmação necessária:</strong> Você DEVE clicar em "Já enviei o comprovante"</li>
                    <li><strong>Sem confirmação:</strong> Rifas NÃO vão para o sistema</li>
                    <li><strong>Perda de reserva:</strong> Se não confirmar, as rifas podem ser vendidas para outra pessoa</li>
                  </>
                ) : !rafflesConfirmed ? (
                  <>
                    <li><strong>Último passo OBRIGATÓRIA:</strong> Clique em "Já enviei o comprovante" AGORA</li>
                    <li><strong>Confirmação manual:</strong> Você precisa confirmar explicitamente o pagamento</li>
                    <li><strong>Admin ainda não vê:</strong> Rifas ainda NÃO foram para o sistema</li>
                    <li><strong>Evite erros:</strong> Só confirme se realmente enviou o comprovante</li>
                  </>
                ) : (
                  <>
                    <li><strong>✅ Concluído:</strong> Rifas confirmadas como PAGAS</li>
                    <li><strong>📊 Sistema atualizado:</strong> Admin já vê as rifas no sistema</li>
                    <li><strong>🎉 Sucesso:</strong> Números removidos da venda</li>
                  </>
                )}
              </ul>
            ) : (
              <ul>
                <li><strong>Apenas no carrinho:</strong> Rifas estão APENAS no seu carrinho</li>
                <li><strong>Confirmação necessária:</strong> Clique em "Enviar para WhatsApp" para reservar no sistema</li>
                <li><strong>Status após confirmação:</strong> Rifas vão como <strong>RESERVADAS PENDENTES</strong></li>
                <li><strong>Admin vê:</strong> Após confirmação, admin verá como "aguardando pagamento"</li>
                <li><strong>Validade:</strong> Pagamento deve ser feito em até 24 horas</li>
                <li><strong>Atualização manual:</strong> Após pagamento físico, admin marcará como PAGAS</li>
              </ul>
            )}
            
            <div className="emergency-contact">
              <h5>📞 Precisa de ajuda?</h5>
              <p><strong>WhatsApp:</strong> {vendorInfo?.whatsapp || '(18) 99634-9330'}</p>
              <p><strong>Informe o número do pedido:</strong> #{currentOrder.id}</p>
            </div>
          </div>

          {/* Status técnico (debug) */}
          {debugMode && (
            <div className="technical-status">
              <h5>🔧 Status Técnico:</h5>
              <p><strong>Firebase:</strong> {raffleManager.firebaseConnected ? '✅ Conectado' : '❌ Offline'}</p>
              <p><strong>Online:</strong> {raffleManager.isOnline ? '✅' : '❌'}</p>
              <p><strong>Vendas sincronizadas:</strong> {raffleManager.soldNumbers?.filter(s => s.synced).length || 0}</p>
              <p><strong>Última sincronização:</strong> {raffleManager.lastSync || 'Nunca'}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Payment;