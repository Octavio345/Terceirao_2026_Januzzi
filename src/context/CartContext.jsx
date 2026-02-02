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
        return JSON.parse(savedCart);
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

  const addToCart = useCallback((product) => {
    if (!product || !product.id) return false;
    
    console.log('➕ Adicionando ao carrinho:', product);
    
    if (product.isRaffle) {
      const existingIndex = cart.findIndex(item => 
        item.isRaffle && 
        item.selectedClass === product.selectedClass && 
        item.selectedNumber === product.selectedNumber
      );
      
      if (existingIndex >= 0) {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { type: 'error', message: '⚠️ Esta rifa já está no seu carrinho!', duration: 3000 }
        }));
        return false;
      }
      
      const tempReservationId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const productWithReservation = {
        ...product,
        tempReservationId: tempReservationId,
        reservationExpiresAt: Date.now() + (30 * 60 * 1000),
        status: 'no_carrinho',
        needsPaymentConfirmation: true,
        paymentPending: true,
        firebaseStatus: 'not_sent',
        addedAt: new Date().toISOString()
      };
      
      setCart(prevCart => [...prevCart, productWithReservation]);
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { type: 'success', message: `✅ ${product.selectedClass} Nº ${product.selectedNumber} adicionado ao carrinho!`, duration: 3000 }
      }));
      
      return true;
    } else {
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
          const newItem = { ...product, quantity: product.quantity || 1 };
          return [...prevCart, newItem];
        }
      });
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { type: 'success', message: '✅ Produto adicionado ao carrinho!', duration: 2000 }
      }));
      
      return true;
    }
  }, [cart]);

  const removeFromCart = useCallback((productId) => {
    console.log('❌ Removendo do carrinho:', productId);
    
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

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

  const clearCart = useCallback(() => {
    console.log('🧹 Limpando carrinho LOCAL');
    setCart([]);
    localStorage.removeItem('terceirao_cart');
    
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { type: 'info', message: '🧹 Carrinho limpo!', duration: 2000 }
    }));
  }, []);

  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [cart]);

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);

  const sendRafflesToFirebase = useCallback(async (orderData, paymentMethod) => {
    console.log(`🚀 ENVIANDO RIFAS PARA FIREBASE - ${paymentMethod}`);
    
    if (!raffleManager || !raffleManager.sendToFirebase) {
      console.error('❌ RaffleManager não disponível');
      return { success: false, error: 'Sistema de rifas não disponível' };
    }
    
    const raffleItems = cart.filter(item => item.isRaffle);
    
    if (raffleItems.length === 0) {
      console.log('ℹ️ Nenhuma rifa para enviar');
      return { success: true, results: [], totalSent: 0, totalFailed: 0 };
    }
    
    console.log(`📤 Processando ${raffleItems.length} rifas para envio`);
    
    const results = [];
    let totalSent = 0;
    let totalFailed = 0;
    let criticalFailures = [];
    
    for (const raffleItem of raffleItems) {
      try {
        console.log(`🎯 Processando ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}...`);
        
        const realTimeCheck = await raffleManager.checkNumberInRealTime(
          raffleItem.selectedClass, 
          raffleItem.selectedNumber
        );
        
        if (realTimeCheck.sold) {
          console.error(`❌ NÚMERO JÁ VENDIDO! ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          results.push({
            success: false,
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            error: 'Número já vendido',
            alreadySold: true
          });
          totalFailed++;
          criticalFailures.push(`${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          continue;
        }
        
        if (realTimeCheck.reserved) {
          console.error(`❌ NÚMERO JÁ RESERVADO! ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          results.push({
            success: false,
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            error: 'Número já reservado',
            alreadyReserved: true
          });
          totalFailed++;
          criticalFailures.push(`${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          continue;
        }
        
        const raffleData = {
          turma: raffleItem.selectedClass,
          numero: raffleItem.selectedNumber,
          nome: orderData.customerInfo?.name || 'Comprador',
          telefone: orderData.customerInfo?.phone || '',
          status: paymentMethod === 'pix' ? 'pago' : 'pendente',
          paymentMethod: paymentMethod,
          orderId: orderData.id,
          source: 'online',
          price: 15.00
        };
        
        let result;
        if (paymentMethod === 'pix') {
          result = await raffleManager.confirmPaymentAndSendToFirebase(raffleData, {
            method: 'pix',
            orderId: orderData.id
          });
        } else {
          result = await raffleManager.createCashReservationInFirebase(raffleData, {
            method: 'dinheiro',
            orderId: orderData.id
          });
        }
        
        if (result && result.success) {
          console.log(`✅ Rifa enviada: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          results.push({
            success: true,
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            status: paymentMethod === 'pix' ? 'pago' : 'pendente',
            firebaseId: result.firebaseId || result.id
          });
          totalSent++;
        } else {
          console.error(`❌ Falha ao enviar: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          results.push({
            success: false,
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            error: result?.error || 'Falha no envio'
          });
          totalFailed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ Erro: ${raffleItem.selectedNumber}:`, error);
        results.push({
          success: false,
          turma: raffleItem.selectedClass,
          numero: raffleItem.selectedNumber,
          error: error.message
        });
        totalFailed++;
      }
    }
    
    console.log('📊 RESULTADO:', `Sucessos: ${totalSent}`, `Falhas: ${totalFailed}`);
    
    if (criticalFailures.length > 0) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'error', 
          message: `⚠️ ${criticalFailures.length} número(s) já vendidos/reservados: ${criticalFailures.join(', ')}`,
          duration: 8000 
        }
      }));
    }
    
    return { 
      success: totalFailed === 0, 
      results,
      totalSent,
      totalFailed,
      error: totalFailed > 0 ? `${totalFailed} rifa(s) não foram enviadas` : null
    };
    
  }, [cart, raffleManager]);

  const confirmRafflesInOrder = useCallback(async (orderId) => {
  if (!raffleManager) {
    console.error('❌ RaffleManager não disponível');
    return false;
  }
  
  try {
    console.log('🚀 CONFIRMANDO PAGAMENTO PIX');
    
    const order = currentOrder;
    if (!order || order.id !== orderId) {
      console.error('❌ Pedido não encontrado:', orderId);
      return false;
    }
    
    if (order.rafflesConfirmed) {
      console.log('ℹ️ Rifas já confirmadas');
      return true;
    }
    
    // Esta função envia as rifas para o Firebase
    const result = await sendRafflesToFirebase(order, 'pix');
    
    if (result.success) {
      console.log('✅ Rifas enviadas para Firebase!');
      
      const updatedOrder = {
        ...order,
        status: 'confirmed',
        proofSent: true,
        proofConfirmedAt: new Date().toISOString(),
        rafflesConfirmed: true,
        rafflesSentToFirebase: true,
        rafflesFirebaseResults: result.results,
        confirmationTimestamp: new Date().toISOString()
      };
      
      setCurrentOrder(updatedOrder);
      localStorage.setItem('terceirao_last_order', JSON.stringify(updatedOrder));
      
      clearCart();
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'success', 
          message: '✅ Rifas confirmadas e enviadas para o sistema!',
          duration: 5000 
        }
      }));
      
      return true;
    } else {
      // ... tratamento de erro
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao confirmar rifas:', error);
    return false;
  }
}, [raffleManager, currentOrder, sendRafflesToFirebase, clearCart]);

  const processCashPayment = useCallback(async (orderId) => {
    if (!raffleManager) {
      console.error('❌ RaffleManager não disponível');
      return false;
    }
    
    try {
      console.log('💰 PROCESSANDO DINHEIRO');
      
      const order = currentOrder;
      if (!order || order.id !== orderId) {
        console.error('❌ Pedido não encontrado');
        return false;
      }
      
      if (order.rafflesStatus === 'pending_payment') {
        console.log('ℹ️ Rifas já processadas');
        return true;
      }
      
      const result = await sendRafflesToFirebase(order, 'dinheiro');
      
      if (result.success) {
        console.log('✅ Rifas enviadas como PENDENTES');
        
        const updatedOrder = {
          ...order,
          status: 'pending_cash',
          whatsappSent: true,
          whatsappSentAt: new Date().toISOString(),
          rafflesStatus: 'pending_payment',
          rafflesSentToFirebase: true,
          rafflesFirebaseResults: result.results
        };
        
        setCurrentOrder(updatedOrder);
        localStorage.setItem('terceirao_last_order', JSON.stringify(updatedOrder));
        
        clearCart();
        
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { 
            type: 'success', 
            message: '✅ Rifas reservadas no sistema!',
            duration: 5000 
          }
        }));
        
        return true;
      } else {
        console.error('❌ Erro ao enviar rifas:', result);
        
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { 
            type: 'error', 
            message: '❌ Erro ao reservar rifas.',
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
          message: '❌ Erro ao processar pagamento.',
          duration: 5000 
        }
      }));
      
      return false;
    }
  }, [raffleManager, currentOrder, sendRafflesToFirebase, clearCart]);

  const createOrder = useCallback((orderData) => {
    try {
      console.log('🛒 Criando pedido');
      
      const orderId = `PED${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const orderItems = cart.map(item => ({ ...item }));
      
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
        paymentMethod: orderData.paymentMethod,
        needsConfirmation: orderData.paymentMethod === 'pix',
        customerInfo: orderData.customerInfo || {},
        deliveryOption: orderData.deliveryOption || 'retirada',
        total: orderData.total || 0,
        subtotal: orderData.subtotal || 0
      };
      
      setCurrentOrder(orderWithId);
      setIsCartOpen(false);
      localStorage.setItem('terceirao_last_order', JSON.stringify(orderWithId));
      
      console.log('✅ Pedido criado:', {
        id: orderWithId.id,
        total: orderWithId.total,
        paymentMethod: orderWithId.paymentMethod,
        raffleCount: orderWithId.raffleCount
      });
      
      setShowPayment(true);
      
      return orderWithId;
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      throw new Error('Falha ao criar pedido');
    }
  }, [cart]);

  const clearCartAfterConfirmation = useCallback(() => {
    console.log('🧹 Limpando carrinho após confirmação');
    setCart([]);
    localStorage.removeItem('terceirao_cart');
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const closePaymentOnly = useCallback(() => {
    setShowPayment(false);
  }, []);

  useEffect(() => {
    const checkExpiredItems = () => {
      const now = Date.now();
      setCart(prevCart => {
        return prevCart.filter(item => {
          if (item.isRaffle && item.reservationExpiresAt) {
            return item.reservationExpiresAt > now;
          }
          return true;
        });
      });
    };
    
    const interval = setInterval(checkExpiredItems, 60000);
    checkExpiredItems();
    
    return () => clearInterval(interval);
  }, []);

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