import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { VENDOR_INFO } from '../config/vendor';
import { useRaffleManager } from './RaffleManagerContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('terceirao_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('📦 Carrinho carregado:', parsed.length, 'itens');
        console.log('⚠️ NOTA: Rifas no carrinho estão APENAS LOCALMENTE');
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('❌ Erro ao carregar carrinho:', error);
    }
    return [];
  });

  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  
  const raffleManager = useRaffleManager();

  // Atualizar total sempre que o carrinho mudar
  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    
    setCartTotal(total);
    
    try {
      localStorage.setItem('terceirao_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('❌ Erro ao salvar carrinho:', error);
    }
  }, [cart]);

  // ========== FUNÇÃO ADICIONAR AO CARRINHO (NÃO ENVIA PARA FIREBASE) ==========
  const addToCart = useCallback((product) => {
    if (!product || !product.id) return false;
    
    console.log('➕ Adicionando ao carrinho:', product);
    
    // Verificar se é uma rifa
    if (product.isRaffle) {
      // IMPORTANTE: NÃO reservar no sistema ainda!
      // Apenas marcar no carrinho LOCALMENTE
      const tempReservationId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Verificar se já existe no carrinho
      const existingIndex = cart.findIndex(item => 
        item.isRaffle && 
        item.selectedClass === product.selectedClass && 
        item.selectedNumber === product.selectedNumber
      );
      
      if (existingIndex >= 0) {
        console.log('⚠️ Esta rifa já está no carrinho');
        return false;
      }
      
      const productWithReservation = {
        ...product,
        tempReservationId: tempReservationId,
        reservationExpiresAt: Date.now() + (30 * 60 * 1000), // 30 minutos LOCAL
        status: 'no_carrinho',
        needsPaymentConfirmation: true,
        paymentPending: true,
        firebaseStatus: 'not_sent',
        canBeSoldToOthers: true,
        addedAt: new Date().toISOString()
      };
      
      console.log('🛒 Rifa adicionada ao carrinho LOCALMENTE');
      console.log('⚠️ IMPORTANTE: AINDA NÃO FOI RESERVADA NO SISTEMA!');
      console.log('📋 Só será reservada quando confirmar o pagamento.');
      console.log('⏰ Expira em:', new Date(productWithReservation.reservationExpiresAt).toLocaleTimeString());
      
      setCart(prevCart => {
        return [...prevCart, productWithReservation];
      });
      
      return true;
    } else {
      // Para produtos normais
      setCart(prevCart => {
        const existingIndex = prevCart.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
          const updatedCart = [...prevCart];
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: (updatedCart[existingIndex].quantity || 1) + 1
          };
          return updatedCart;
        } else {
          const newItem = {
            ...product,
            quantity: product.quantity || 1
          };
          return [...prevCart, newItem];
        }
      });
      
      return true;
    }
  }, [cart]);

  // ========== FUNÇÃO REMOVER DO CARRINHO (NÃO CANCELA RESERVA) ==========
  const removeFromCart = useCallback((productId) => {
    console.log('❌ Removendo do carrinho:', productId);
    
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.id === productId);
      
      if (itemToRemove?.isRaffle) {
        console.log('🗑️ Rifa removida do carrinho LOCAL');
        console.log('✅ Nada foi cancelado no sistema (nunca foi reservado)');
        console.log('🎯 O número', itemToRemove.selectedNumber, 'continua disponível para compra');
      }
      
      return prevCart.filter(item => item.id !== productId);
    });
  }, []);

  // ========== FUNÇÃO ATUALIZAR QUANTIDADE ==========
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  // ========== FUNÇÃO LIMPAR CARRINHO ==========
  const clearCart = useCallback(() => {
    console.log('🧹 Limpando carrinho LOCAL');
    
    cart.forEach(item => {
      if (item.isRaffle) {
        console.log('📝 Rifa removida (nunca foi reservada):', item.selectedNumber);
      }
    });
    
    setCart([]);
    localStorage.removeItem('terceirao_cart');
  }, [cart]);

  // ========== FUNÇÕES AUXILIARES ==========
  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [cart]);

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);

  // ========== FUNÇÃO PRINCIPAL: ENVIAR RIFAS PARA FIREBASE (APÓS CONFIRMAÇÃO) ==========
  const sendRafflesToFirebase = useCallback(async (orderData, paymentMethod) => {
    if (!raffleManager) {
      console.error('❌ RaffleManager não disponível');
      return { success: false, error: 'Sistema de rifas não disponível' };
    }
    
    try {
      console.log(`🚀 ENVIANDO RIFAS PARA O FIREBASE AGORA - Método: ${paymentMethod}...`);
      console.log('📦 Pedido:', orderData.id);
      console.log('💰 Método de pagamento:', paymentMethod);
      
      const raffleItems = cart.filter(item => item.isRaffle);
      
      if (raffleItems.length === 0) {
        console.log('ℹ️ Nenhuma rifa para enviar');
        return { success: true, results: [] };
      }
      
      console.log(`📤 Processando ${raffleItems.length} rifas para envio ao Firebase`);
      
      let allSuccessful = true;
      const results = [];
      
      // IMPORTANTE: Primeiro atualizar o estado LOCAL
      console.log('🔄 Primeiro: Atualizando estado LOCAL...');
      
      for (const raffleItem of raffleItems) {
        try {
          console.log(`📍 Atualizando LOCAL: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          
          // Marcar como reservado localmente (ANTES de enviar para Firebase)
          if (raffleManager.markNumbersAsReserved) {
            raffleManager.markNumbersAsReserved(
              raffleItem.selectedClass,
              raffleItem.selectedNumber,
              orderData.customerInfo?.name || 'Comprador',
              orderData.id
            );
          }
          
        } catch (localError) {
          console.error(`❌ Erro ao atualizar localmente:`, localError);
        }
      }
      
      // Forçar atualização imediata do contexto
      if (raffleManager.refreshData) {
        setTimeout(() => {
          raffleManager.refreshData();
          console.log('✅ Contexto local atualizado FORÇADAMENTE');
        }, 100);
      }
      
      // DEPOIS: Enviar para Firebase
      console.log('📡 Segundo: Enviando para Firebase...');
      
      for (const raffleItem of raffleItems) {
        try {
          console.log(`🎯 Enviando para Firebase: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          
          const raffleData = {
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            nome: orderData.customerInfo?.name || 'Comprador',
            telefone: orderData.customerInfo?.phone || '',
            method: paymentMethod,
            orderId: orderData.id
          };
          
          if (paymentMethod === 'pix') {
            // Para PIX: marca como PAGO e envia para Firebase
            console.log('💳 Marcando como PAGO no Firebase...');
            
            const result = await raffleManager.confirmPaymentAndSendToFirebase(
              raffleData,
              {
                method: 'pix',
                orderId: orderData.id
              }
            );
            
            if (result) {
              console.log(`✅ Rifa enviada como PAGA: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
              results.push({
                success: true,
                turma: raffleItem.selectedClass,
                numero: raffleItem.selectedNumber,
                status: 'pago',
                firebaseId: result.firebaseId || null
              });
            } else {
              console.error(`❌ Falha ao enviar rifa: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
              allSuccessful = false;
              results.push({
                success: false,
                turma: raffleItem.selectedClass,
                numero: raffleItem.selectedNumber,
                error: 'Falha ao confirmar no Firebase'
              });
            }
            
          } else if (paymentMethod === 'dinheiro') {
            // Para DINHEIRO: marca como PENDENTE e envia para Firebase
            console.log('💰 Marcando como PENDENTE no Firebase...');
            
            const result = await raffleManager.createCashReservationInFirebase(
              raffleData,
              {
                method: 'dinheiro',
                orderId: orderData.id
              }
            );
            
            if (result) {
              console.log(`✅ Rifa enviada como PENDENTE: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
              results.push({
                success: true,
                turma: raffleItem.selectedClass,
                numero: raffleItem.selectedNumber,
                status: 'pendente',
                firebaseId: result.firebaseId || null
              });
            } else {
              console.error(`❌ Falha ao enviar rifa: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
              allSuccessful = false;
              results.push({
                success: false,
                turma: raffleItem.selectedClass,
                numero: raffleItem.selectedNumber,
                error: 'Falha ao processar no Firebase'
              });
            }
          }
          
        } catch (error) {
          console.error(`❌ Erro ao processar rifa ${raffleItem.selectedNumber}:`, error);
          allSuccessful = false;
          results.push({
            success: false,
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            error: error.message
          });
        }
      }
      
      console.log('📊 Resultado do envio das rifas:');
      console.log('- Sucessos:', results.filter(r => r.success).length);
      console.log('- Falhas:', results.filter(r => !r.success).length);
      
      // Forçar atualização FINAL do contexto
      if (raffleManager.refreshData) {
        setTimeout(() => {
          raffleManager.refreshData();
          console.log('✅ Última atualização do contexto');
        }, 500);
      }
      
      return { 
        success: allSuccessful, 
        results,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length
      };
      
    } catch (error) {
      console.error('❌ Erro crítico ao enviar rifas:', error);
      return { 
        success: false, 
        error: error.message,
        results: []
      };
    }
  }, [cart, raffleManager]);

  // ========== FUNÇÃO: CONFIRMAR PAGAMENTO PIX ==========
  const confirmRafflesInOrder = useCallback(async (orderId) => {
    if (!raffleManager) {
      console.error('❌ RaffleManager não disponível');
      return false;
    }
    
    try {
      console.log('🚀 CONFIRMANDO PAGAMENTO PIX - Enviando rifas para Firebase');
      
      const order = currentOrder;
      if (!order || order.id !== orderId) {
        console.error('❌ Pedido não encontrado:', orderId);
        return false;
      }
      
      // Verificar se já foi confirmado
      if (order.rafflesConfirmed) {
        console.log('ℹ️ Rifas já foram confirmadas anteriormente');
        return true;
      }
      
      // AGORA SIM: Envia as rifas para o Firebase
      console.log('📦 Iniciando envio das rifas para o sistema...');
      const result = await sendRafflesToFirebase(order, 'pix');
      
      if (result.success) {
        console.log('✅ TODAS as rifas foram enviadas para o Firebase!');
        console.log('📋 Status: Agora o admin VÊ as rifas no sistema como PAGAS');
        console.log('🎯 Números removidos da venda para outras pessoas');
        
        // Atualizar status do pedido
        const updatedOrder = {
          ...order,
          status: 'confirmed',
          proofSent: true,
          proofConfirmedAt: new Date().toISOString(),
          rafflesConfirmed: true,
          rafflesSentToFirebase: true,
          rafflesFirebaseResults: result.results,
          confirmationTimestamp: new Date().toISOString(),
          firebaseSynced: true
        };
        
        setCurrentOrder(updatedOrder);
        localStorage.setItem('terceirao_last_order', JSON.stringify(updatedOrder));
        
        // Limpar carrinho
        clearCart();
        
        // Criar evento para mostrar mensagem de sucesso
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { 
            type: 'success', 
            message: '✅ Rifas confirmadas e enviadas para o sistema! Admin já vê como PAGAS.',
            duration: 5000 
          }
        }));
        
        return true;
      } else {
        console.warn('⚠️ Algumas rifas não puderam ser enviadas:', result);
        
        // Criar evento para mostrar erro
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { 
            type: 'error', 
            message: '❌ Erro ao enviar algumas rifas. Entre em contato com o administrador.',
            duration: 6000 
          }
        }));
        
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro ao confirmar rifas:', error);
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'error', 
          message: '❌ Erro ao processar confirmação. Tente novamente.',
          duration: 5000 
        }
      }));
      
      return false;
    }
  }, [raffleManager, currentOrder, sendRafflesToFirebase, clearCart]);

  // ========== FUNÇÃO: PROCESSAR PAGAMENTO EM DINHEIRO (CORRIGIDA) ==========
  const processCashPayment = useCallback(async (orderId) => {
    if (!raffleManager) {
      console.error('❌ RaffleManager não disponível');
      return false;
    }
    
    try {
      console.log('💰 PROCESSANDO DINHEIRO - Enviando rifas como PENDENTES');
      
      const order = currentOrder;
      if (!order || order.id !== orderId) {
        console.error('❌ Pedido não encontrado');
        return false;
      }
      
      // Verificar se já foi processado
      if (order.rafflesStatus === 'pending_payment') {
        console.log('ℹ️ Rifas já foram processadas para dinheiro');
        return true;
      }
      
      // AGORA SIM: Envia as rifas como PENDENTES para o Firebase
      console.log('📦 Iniciando envio das rifas para o sistema...');
      const result = await sendRafflesToFirebase(order, 'dinheiro');
      
      if (result.success) {
        console.log('✅ Rifas enviadas como PENDENTES para o Firebase!');
        console.log('📋 Status: Admin vê como "aguardando pagamento"');
        console.log('🎯 Números reservados para você (outros não podem comprar)');
        
        // IMPORTANTE: Forçar atualização do contexto local
        setTimeout(() => {
          if (raffleManager.refreshData) {
            raffleManager.refreshData();
            console.log('🔄 Contexto atualizado após dinheiro');
          }
        }, 1000);
        
        const updatedOrder = {
          ...order,
          status: 'pending_cash',
          whatsappSent: true,
          whatsappSentAt: new Date().toISOString(),
          rafflesStatus: 'pending_payment',
          rafflesSentToFirebase: true,
          rafflesFirebaseResults: result.results,
          firebaseSynced: true
        };
        
        setCurrentOrder(updatedOrder);
        localStorage.setItem('terceirao_last_order', JSON.stringify(updatedOrder));
        
        // Limpar carrinho
        clearCart();
        
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { 
            type: 'success', 
            message: '✅ Rifas reservadas no sistema! Admin já vê sua reserva.',
            duration: 5000 
          }
        }));
        
        return true;
      } else {
        console.error('❌ Erro ao enviar rifas:', result);
        
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { 
            type: 'error', 
            message: '❌ Erro ao reservar rifas. Tente novamente.',
            duration: 5000 
          }
        }));
        
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar dinheiro:', error);
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'error', 
          message: '❌ Erro ao processar pagamento. Tente novamente.',
          duration: 5000 
        }
      }));
      
      return false;
    }
  }, [raffleManager, currentOrder, sendRafflesToFirebase, clearCart]);

  // ========== FUNÇÃO: CRIAR PEDIDO (NÃO ENVIA RIFAS AINDA) ==========
  const createOrder = useCallback((orderData) => {
    try {
      console.log('🛒 Criando pedido (rifas ainda NÃO enviadas para Firebase)');
      
      // Cria ID único para o pedido
      const orderId = `PED${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Processar itens do carrinho para o pedido
      const orderItems = cart.map(item => ({
        ...item,
        // Mantém informações temporárias
      }));
      
      const hasRaffles = cart.some(item => item.isRaffle);
      const raffleCount = cart.filter(item => item.isRaffle).length;
      
      const orderWithId = {
        ...orderData,
        id: orderId,
        items: orderItems,
        date: new Date().toLocaleString('pt-BR'),
        timestamp: new Date().toISOString(),
        status: 'pending',
        orderNumber: orderId,
        hasRaffles: hasRaffles,
        raffleCount: raffleCount,
        rafflesStatus: 'no_carrinho',
        rafflesSentToFirebase: false,
        firebaseSynced: false,
        paymentMethod: orderData.paymentMethod,
        needsConfirmation: orderData.paymentMethod === 'pix',
        customerInfo: orderData.customerInfo || {},
        deliveryOption: orderData.deliveryOption || 'retirada',
        total: orderData.total || 0,
        subtotal: orderData.subtotal || 0
      };
      
      // Salva no estado
      setCurrentOrder(orderWithId);
      
      // Fecha o carrinho
      setIsCartOpen(false);
      
      // Salva no localStorage para persistência
      localStorage.setItem('terceirao_last_order', JSON.stringify(orderWithId));
      
      console.log('✅ Pedido criado com sucesso:', {
        id: orderWithId.id,
        total: orderWithId.total,
        paymentMethod: orderWithId.paymentMethod,
        hasRaffles: orderWithId.hasRaffles,
        raffleCount: orderWithId.raffleCount,
        rafflesStatus: orderWithId.rafflesStatus
      });
      
      console.log('⚠️ IMPORTANTE: Rifas estão apenas NO CARRINHO LOCAL.');
      console.log('📋 Para PIX: Serão enviadas para Firebase ao clicar em "Já enviei comprovante"');
      console.log('💰 Para DINHEIRO: Serão enviadas ao clicar em "Enviar para WhatsApp"');
      console.log('🚫 Até lá, outras pessoas podem comprar os mesmos números!');
      
      // Mostra a tela de pagamento
      setShowPayment(true);
      
      return orderWithId;
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      throw new Error('Falha ao criar pedido');
    }
  }, [cart]);

  // ========== FUNÇÕES AUXILIARES DO CARRINHO ==========
  const clearCartAfterConfirmation = useCallback(() => {
    console.log('🧹 Limpando carrinho após confirmação do pagamento');
    setCart([]);
    localStorage.removeItem('terceirao_cart');
  }, []);

  const toggleCart = useCallback(() => {
    console.log('🔄 Alternando carrinho. Estado atual:', isCartOpen);
    setIsCartOpen(prev => !prev);
  }, [isCartOpen]);

  const openCart = useCallback(() => {
    console.log('📂 Abrindo carrinho');
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    console.log('📪 Fechando carrinho');
    setIsCartOpen(false);
  }, []);

  const closePaymentOnly = useCallback(() => {
    console.log('🔒 Fechando tela de pagamento apenas');
    setShowPayment(false);
  }, []);

  // ========== VERIFICAR E LIMPAR ITENS EXPIRADOS ==========
  useEffect(() => {
    const checkExpiredItems = () => {
      const now = Date.now();
      setCart(prevCart => {
        const updatedCart = prevCart.filter(item => {
          if (item.isRaffle && item.reservationExpiresAt) {
            if (item.reservationExpiresAt < now) {
              console.log(`⏰ Rifa expirada removida do carrinho: ${item.selectedNumber}`);
              console.log(`🎯 Número ${item.selectedNumber} voltou a ficar disponível`);
              return false;
            }
          }
          return true;
        });
        
        if (updatedCart.length !== prevCart.length) {
          console.log(`🧹 ${prevCart.length - updatedCart.length} itens expirados removidos do carrinho`);
        }
        
        return updatedCart;
      });
    };
    
    // Verificar a cada minuto
    const interval = setInterval(checkExpiredItems, 60000);
    
    // Verificar ao carregar
    checkExpiredItems();
    
    return () => clearInterval(interval);
  }, []);

  // ========== CONTEXT VALUE ==========
  const value = {
    cart,
    cartTotal,
    isCartOpen,
    showPayment,
    currentOrder,
    toggleCart,
    openCart,
    closeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartAfterConfirmation,
    getCartCount,
    getCartTotal,
    getTotalItems: getCartCount,
    createOrder,
    confirmRafflesInOrder,
    processCashPayment,
    sendRafflesToFirebase,
    setShowPayment,
    closePaymentOnly,
    vendorInfo: VENDOR_INFO
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};