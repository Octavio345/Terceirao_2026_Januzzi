import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { 
  Copy, Check, QrCode, Smartphone, Clock, 
  Download, X, Wallet, Calculator, DollarSign, AlertCircle, RefreshCw,
  Send, MessageCircle, Loader2
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
    confirmRafflesInOrder,
    processCashPayment,
    clearCartAfterConfirmation,
    cart
  } = useCart();
  
  const raffleManager = useRaffleManager();
  
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proofSent, setProofSent] = useState(false);
  const [rafflesConfirmed, setRafflesConfirmed] = useState(false);
  const modalRef = useRef(null);
  
  const [persistentSession, setPersistentSession] = useState(null);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [paymentTimestamp, setPaymentTimestamp] = useState(null);

  // ========== DEBUG ==========
  useEffect(() => {
    console.log('🔄 Payment - DEBUG INFO:');
    console.log('📦 currentOrder:', currentOrder);
    console.log('🛒 Cart has raffles?', cart?.some(item => item.isRaffle));
    console.log('💰 Payment method:', currentOrder?.paymentMethod);
    console.log('📤 processCashPayment available?', typeof processCashPayment);
  }, [currentOrder, cart]);

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

  // ========== FUNÇÕES DE GERENCIAMENTO DE MODAL ==========

  const handleCloseModal = useCallback(() => {
    console.log('🔒 Fechando modal de pagamento');
    
    if (typeof closePaymentOnly === 'function') {
      closePaymentOnly();
    } else if (typeof setShowPayment === 'function') {
      setShowPayment(false);
    }
  }, [closePaymentOnly, setShowPayment]);

  useEffect(() => {
    if (showPayment && currentOrder) {
      loadPersistentSession();
      
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
    }
  }, [showPayment, currentOrder]);

  const savePersistentSession = () => {
    if (!currentOrder) return;
    
    const sessionData = {
      orderId: currentOrder.id,
      orderData: currentOrder,
      timestamp: new Date().toISOString(),
      hasSentProof: proofSent,
      paymentTimestamp: paymentTimestamp
    };
    
    localStorage.setItem('terceirao_payment_session', JSON.stringify(sessionData));
  };

  const loadPersistentSession = () => {
    try {
      const savedSession = localStorage.getItem('terceirao_payment_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        
        if (sessionData.orderId === currentOrder.id) {
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
  };

  const clearPersistentSession = () => {
    localStorage.removeItem('terceirao_payment_session');
    setPersistentSession(null);
    setHasPendingPayment(false);
    setPaymentTimestamp(null);
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showPayment) {
        handleCloseModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showPayment, handleCloseModal]);

  // Focar no modal quando abrir
  useEffect(() => {
    if (showPayment) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPayment]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('payment-overlay')) {
      handleCloseModal();
    }
  };

  // ========== FUNÇÕES DE DADOS ==========

  const getCustomerName = () => {
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
  };

  // ========== FUNÇÕES DE PAGAMENTO ==========

  const handleCopyPixKey = () => {
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
  };

  // ========== FUNÇÃO TOAST ==========
  const showToast = (type, message) => {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { 
        type, 
        message, 
        duration: type === 'error' ? 5000 : 4000 
      }
    }));
  };

  // ========== WHATSAPP MESSAGE ==========

  const generateWhatsAppMessage = () => {
    if (!vendorInfo?.whatsapp) {
      console.error('WhatsApp não configurado');
      showToast('error', 'WhatsApp não configurado');
      return '#';
    }
    
    const phone = vendorInfo.whatsapp.replace(/\D/g, '');
    const deliveryOption = currentOrder.deliveryOption || 'retirada';
    const deliveryAddress = currentOrder.deliveryAddress || null;
    const deliveryDate = currentOrder.deliveryDate || null;
    const paymentMethod = currentOrder.paymentMethod || 'pix';
    const cashAmount = currentOrder.cashAmount || null;
    const cashChange = currentOrder.cashChange || 0;
    
    const customerName = getCustomerName();
    
    const hasRaffles = currentOrder.items?.some(item => item.isRaffle) || false;
    const raffleItems = hasRaffles ? currentOrder.items?.filter(item => item.isRaffle) : [];
    
    let message = `*${paymentMethod === 'pix' ? '📋 COMPROVANTE PIX ENVIADO' : '💵 PAGAMENTO EM DINHEIRO'}*\n\n`;
    
    message += `*🧾 PEDIDO:* ${currentOrder.id}\n`;
    message += `*👤 CLIENTE:* ${customerName}\n`;
    message += `*💰 VALOR:* R$ ${currentOrder.total?.toFixed(2) || '0.00'}\n\n`;
    
    if (hasRaffles && raffleItems.length > 0) {
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
        message += `*⚠️ ATENÇÃO IMPORTANTE:*\n`;
        message += `As rifas estão APENAS NO CARRINHO e NÃO foram reservadas no sistema ainda.\n`;
        message += `Elas só serão enviadas para o sistema quando você clicar em "Já enviei o comprovante".\n\n`;
      } else {
        message += `*⚠️ ATENÇÃO IMPORTANTE:*\n`;
        message += `As rifas foram enviadas para o sistema como RESERVADAS PENDENTES.\n`;
        message += `Status: Aguardando pagamento em dinheiro.\n\n`;
      }
    }
    
    if (paymentMethod === 'dinheiro') {
      message += `*💵 PAGAMENTO EM DINHEIRO*\n`;
      if (cashAmount) {
        message += `• Valor informado: R$ ${cashAmount.toFixed(2)}\n`;
        if (cashChange > 0) {
          message += `• Troco necessário: R$ ${cashChange.toFixed(2)}\n`;
        }
      }
      message += `\n`;
    }
    
    message += `*📦 ENTREGA:* ${deliveryOption === 'retirada' ? 'Retirada na Escola' : 'Entrega a Domicílio'}\n`;
    
    if (deliveryOption === 'entrega' && deliveryAddress) {
      message += `• ${deliveryAddress.street || ''}, ${deliveryAddress.number || ''}\n`;
      if (deliveryAddress.complement) {
        message += `• Complemento: ${deliveryAddress.complement}\n`;
      }
      message += `• Bairro: ${deliveryAddress.neighborhood || ''}\n`;
    }
    
    message += `\n`;
    message += `*📞 CONTATO:*\n`;
    message += `WhatsApp: ${vendorInfo.whatsapp}\n`;
    message += `Pedido: ${currentOrder.id}\n`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // ========== FUNÇÃO PRINCIPAL PARA CONFIRMAR PAGAMENTO (DINHEIRO) - CORRIGIDA ==========

  const handleConfirmCashPayment = async () => {
    if (!currentOrder) {
      showToast('error', 'Pedido não encontrado');
      return;
    }

    setLoading(true);
    console.log('💵 INICIANDO PAGAMENTO DINHEIRO...');
    
    try {
      console.log('📤 1. Atualizando estado LOCAL das rifas...');
      
      // PASSO 1: Atualizar estado LOCAL primeiro
      const raffleItems = currentOrder.items?.filter(item => item.isRaffle) || [];
      const customerName = getCustomerName();
      
      // Primeiro marcar localmente como reservado
      for (const item of raffleItems) {
        if (item.selectedClass && item.selectedNumber) {
          console.log(`📍 Marcando localmente: ${item.selectedClass} Nº ${item.selectedNumber}`);
          
          // Usar a função markNumbersAsReserved para atualizar o contexto LOCAL
          if (raffleManager && raffleManager.markNumbersAsReserved) {
            const success = raffleManager.markNumbersAsReserved(
              item.selectedClass,
              item.selectedNumber,
              customerName,
              currentOrder.id
            );
            
            if (success) {
              console.log(`✅ LOCAL: ${item.selectedClass} Nº ${item.selectedNumber} marcado como pendente`);
            } else {
              console.log(`⚠️ LOCAL: ${item.selectedClass} Nº ${item.selectedNumber} já está reservado/vendido`);
            }
          }
        }
      }
      
      // Forçar atualização imediata do contexto
      if (raffleManager && raffleManager.refreshData) {
        setTimeout(() => {
          raffleManager.refreshData();
          console.log('✅ Contexto LOCAL atualizado imediatamente');
        }, 100);
      }
      
      // PASSO 2: Enviar para Firebase
      console.log('📡 2. Enviando para Firebase...');
      const processed = await processCashPayment(currentOrder.id);
      
      if (!processed) {
        console.error('❌ Falha ao processar no Firebase');
        showToast('error', '❌ Erro ao reservar rifas. Tente novamente.');
        setLoading(false);
        return;
      }
      
      console.log('✅ Rifas enviadas para Firebase com sucesso! Status: PENDENTE');
      
      // PASSO 3: Forçar nova atualização do contexto após Firebase
      if (raffleManager && raffleManager.refreshData) {
        setTimeout(() => {
          raffleManager.refreshData();
          console.log('✅ Contexto atualizado após Firebase');
          
          // Verificação final
          raffleItems.forEach(item => {
            if (item.selectedClass && item.selectedNumber) {
              const isNowReserved = raffleManager.isNumberReserved?.(item.selectedClass, item.selectedNumber);
              const isNowSold = raffleManager.isNumberSold?.(item.selectedClass, item.selectedNumber);
              console.log(`✅ FINAL: ${item.selectedClass} Nº ${item.selectedNumber} - Reservado? ${isNowReserved}, Vendido? ${isNowSold}`);
            }
          });
        }, 1500);
      }
      
      // PASSO 4: Gerar link do WhatsApp
      console.log('📱 3. Gerando link do WhatsApp...');
      const url = generateWhatsAppMessage();
      
      if (url === '#') {
        showToast('error', 'Erro: WhatsApp não configurado');
        setLoading(false);
        return;
      }
      
      // PASSO 5: Abrir WhatsApp
      console.log('📤 4. Abrindo WhatsApp...');
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        showToast('error', 'Por favor, permita pop-ups para abrir o WhatsApp');
        setLoading(false);
        return;
      }
      
      // PASSO 6: Atualizar estado
      setProofSent(true);
      savePersistentSession();
      
      console.log('🎉 PROCESSO DINHEIRO CONCLUÍDO!');
      console.log('✅ Estado LOCAL atualizado (números marcados como reservados)');
      console.log('✅ Rifas enviadas para Firebase como PENDENTES');
      console.log('✅ WhatsApp aberto para confirmação');
      
      showToast('success', '✅ Rifas reservadas no sistema! Admin já vê sua reserva como PENDENTE.');
      
      // PASSO 7: Limpar carrinho e fechar modal
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
  };

  // ========== FUNÇÃO PARA ENVIAR COMPROVANTE PIX (ABRIR WHATSAPP) ==========
  const handleSendProof = () => {
    const url = generateWhatsAppMessage();
    if (url !== '#') {
      window.open(url, '_blank');
      setProofSent(true);
      savePersistentSession();
      showToast('info', 'WhatsApp aberto! Envie o comprovante e DEPOIS VOLTE AQUI para clicar em "Já enviei o comprovante".');
    }
  };

  // ========== FUNÇÃO PARA CONFIRMAR PAGAMENTO PIX (NÃO MEXIDA) ==========
  const handleConfirmPixPayment = async () => {
    if (!currentOrder) {
      showToast('error', 'Pedido não encontrado');
      return;
    }

    setLoading(true);
    
    try {
      console.log('💰 CONFIRMANDO PAGAMENTO PIX...');
      console.log('📤 ENVIANDO RIFAS PARA FIREBASE AGORA...');
      
      // Confirmar rifas no sistema (marca como PAGAS e ENVIA para Firebase)
      const success = await confirmRafflesInOrder(currentOrder.id);
      
      if (success) {
        setRafflesConfirmed(true);
        setProofSent(true);
        
        // Atualizar pedido
        const updatedOrder = {
          ...currentOrder,
          status: 'confirmed',
          proofSent: true,
          proofConfirmedAt: new Date().toISOString(),
          rafflesConfirmed: true,
          firebaseSynced: true,
          confirmedAt: new Date().toISOString()
        };
        
        localStorage.setItem('terceirao_last_order', JSON.stringify(updatedOrder));
        
        // Limpar carrinho
        if (clearCartAfterConfirmation) {
          clearCartAfterConfirmation();
        }
        
        // Limpar sessão persistente
        clearPersistentSession();
        
        console.log('✅ PAGAMENTO PIX CONFIRMADO! Rifas enviadas para Firebase como PAGAS.');
        
        // Mostrar sucesso e fechar
        setTimeout(() => {
          showToast('success', '✅ Pagamento confirmado! Rifas foram enviadas para o sistema como PAGAS.');
          handleCloseModal();
        }, 2000);
        
      } else {
        showToast('error', '❌ Erro ao confirmar rifas. Entre em contato.');
      }
      
    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      showToast('error', '❌ Erro ao processar confirmação');
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNÇÕES AUXILIARES ==========

  const handleDownloadReceipt = () => {
    if (!currentOrder) return;
    
    const deliveryOption = currentOrder.deliveryOption || 'retirada';
    const deliveryAddress = currentOrder.deliveryAddress || null;
    const deliveryDate = currentOrder.deliveryDate || null;
    const paymentMethod = currentOrder.paymentMethod || 'pix';
    const cashAmount = currentOrder.cashAmount || null;
    const cashChange = currentOrder.cashChange || 0;
    
    const customerName = getCustomerName();
    
    const hasRaffles = currentOrder.items?.some(item => item.isRaffle) || false;
    const raffleItems = hasRaffles ? currentOrder.items?.filter(item => item.isRaffle) : [];
    
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

    if (hasRaffles && raffleItems.length > 0) {
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
  };

  const handleRestoreSession = () => {
    if (persistentSession) {
      setHasPendingPayment(true);
      setPaymentTimestamp(persistentSession.paymentTimestamp);
      setProofSent(persistentSession.hasSentProof || false);
      
      showToast('info', 'Sessão restaurada! Continue de onde parou.');
    }
  };

  // ========== RENDERIZAÇÃO ==========

  if (!currentOrder || !showPayment) {
    return null;
  }

  const deliveryOption = currentOrder.deliveryOption || 'retirada';
  const deliveryAddress = currentOrder.deliveryAddress || null;
  const deliveryDate = currentOrder.deliveryDate || null;
  const paymentMethod = currentOrder.paymentMethod || 'pix';
  const cashAmount = currentOrder.cashAmount || null;
  const cashChange = currentOrder.cashChange || 0;

  const customerName = getCustomerName();
  
  const hasRaffles = currentOrder.items?.some(item => item.isRaffle) || false;
  const raffleItems = hasRaffles ? currentOrder.items?.filter(item => item.isRaffle) : [];

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return null;
    return dateString;
  };

  // Use Portal para renderizar no body
  return ReactDOM.createPortal(
    <div 
      className="payment-overlay" 
      onClick={handleOverlayClick}
      ref={modalRef}
      tabIndex="-1"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        padding: '20px'
      }}
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
              {deliveryDate && (
                <span className="delivery-date-info">
                  Previsão de entrega: <strong>{formatDeliveryDate(deliveryDate)}</strong>
                </span>
              )}
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

          {/* Seção de Pagamento PIX (NÃO MEXIDO - funcionando) */}
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

          {/* Seção de Pagamento em Dinheiro (CORRIGIDA) */}
          {paymentMethod === 'dinheiro' && (
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
                        <DollarSign size={16} />
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
                      </>
                    )}
                  </div>
                </div>
                
                <div className="cash-instructions">
                  <h4>📋 COMO PROCEDER (LEIA COM ATENÇÃO):</h4>
                  <ol>
                    <li>Prepare o valor correto em dinheiro</li>
                    <li><strong>Clique em "Enviar para WhatsApp"</strong></li>
                    <li><strong>IMPORTANTE:</strong> As rifas serão enviadas para o sistema como <strong>RESERVADAS PENDENTES</strong></li>
                    <li>O administrador já verá sua reserva (aguardando pagamento)</li>
                    <li>WhatsApp abrirá com mensagem pronta para enviar</li>
                    <li>Após pagamento físico, o administrador marcará como PAGAS</li>
                  </ol>
                  
                  {!proofSent && (
                    <div className="cash-warning">
                      <AlertCircle size={16} />
                      <p><strong>Atenção:</strong> Rifas só serão reservadas no sistema após clicar no botão abaixo!</p>
                    </div>
                  )}
                  
                  {proofSent && (
                    <div className="cash-success">
                      <Check size={16} />
                      <p><strong>✅ Sucesso!</strong> Rifas já foram enviadas para o sistema como RESERVADAS PENDENTES.</p>
                    </div>
                  )}
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
                  <Send size={20} />
                  <span>1. Enviar Comprovante pelo WhatsApp</span>
                </button>
              ) : !rafflesConfirmed ? (
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
                      <Check size={20} />
                      <span>2. JÁ ENVIEI O COMPROVANTE - CONFIRMAR RIFAS</span>
                    </>
                  )}
                </button>
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
                    <li><strong>Último passo OBRIGATÓRIO:</strong> Clique em "Já enviei o comprovante" AGORA</li>
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
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Payment;