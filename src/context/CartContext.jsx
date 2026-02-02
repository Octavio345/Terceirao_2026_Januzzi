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
      // IMPORTANTE: Verificar EM TEMPO REAL antes de adicionar ao carrinho
      console.log('🔍 Verificando em tempo real antes de adicionar ao carrinho...');
      
      // Verificar se já existe no carrinho
      const existingIndex = cart.findIndex(item => 
        item.isRaffle && 
        item.selectedClass === product.selectedClass && 
        item.selectedNumber === product.selectedNumber
      );
      
      if (existingIndex >= 0) {
        console.log('⚠️ Esta rifa já está no carrinho');
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: '⚠️ Esta rifa já está no seu carrinho!',
            duration: 3000
          }
        }));
        return false;
      }
      
      // Verificar disponibilidade em tempo real
      if (raffleManager && raffleManager.checkNumberInRealTime) {
        try {
          const realTimeCheck = raffleManager.checkNumberInRealTime(
            product.selectedClass,
            product.selectedNumber
          );
          
          realTimeCheck.then(result => {
            if (result.sold) {
              console.error('❌ Número já vendido!');
              window.dispatchEvent(new CustomEvent('showToast', {
                detail: {
                  type: 'error',
                  message: `❌ ${product.selectedClass} Nº ${product.selectedNumber} já foi vendido!`,
                  duration: 4000
                }
              }));
              return false;
            }
            
            if (result.reserved) {
              console.error('❌ Número já reservado!');
              window.dispatchEvent(new CustomEvent('showToast', {
                detail: {
                  type: 'error',
                  message: `❌ ${product.selectedClass} Nº ${product.selectedNumber} já está reservado!`,
                  duration: 4000
                }
              }));
              return false;
            }
            
            // Se disponível, adicionar ao carrinho
            const tempReservationId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
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
            
            window.dispatchEvent(new CustomEvent('showToast', {
              detail: {
                type: 'success',
                message: `✅ ${product.selectedClass} Nº ${product.selectedNumber} adicionado ao carrinho!`,
                duration: 3000
              }
            }));
            
            return true;
          }).catch(error => {
            console.error('❌ Erro na verificação em tempo real:', error);
            // Adicionar mesmo com erro de verificação
            return addToCartFallback(product);
          });
          
        } catch (error) {
          console.error('❌ Erro na verificação:', error);
          return addToCartFallback(product);
        }
      } else {
        // Fallback se não puder verificar em tempo real
        return addToCartFallback(product);
      }
      
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
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: '✅ Produto adicionado ao carrinho!',
          duration: 2000
        }
      }));
      
      return true;
    }
  }, [cart, raffleManager]);

  // Fallback para adicionar ao carrinho sem verificação
  const addToCartFallback = (product) => {
    const tempReservationId = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const productWithReservation = {
      ...product,
      tempReservationId: tempReservationId,
      reservationExpiresAt: Date.now() + (30 * 60 * 1000),
      status: 'no_carrinho',
      needsPaymentConfirmation: true,
      paymentPending: true,
      firebaseStatus: 'not_sent',
      canBeSoldToOthers: true,
      addedAt: new Date().toISOString()
    };
    
    setCart(prevCart => {
      return [...prevCart, productWithReservation];
    });
    
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        type: 'warning',
        message: `⚠️ ${product.selectedClass} Nº ${product.selectedNumber} adicionado ao carrinho (sem verificação)`,
        duration: 3000
      }
    }));
    
    return true;
  };

  // ========== FUNÇÃO REMOVER DO CARRINHO (NÃO CANCELA RESERVA) ==========
  const removeFromCart = useCallback((productId) => {
    console.log('❌ Removendo do carrinho:', productId);
    
    setCart(prevCart => {
      const itemToRemove = prevCart.find(item => item.id === productId);
      
      if (itemToRemove?.isRaffle) {
        console.log('🗑️ Rifa removida do carrinho LOCAL');
        console.log('✅ Nada foi cancelado no sistema (nunca foi reservado)');
        console.log('🎯 O número', itemToRemove.selectedNumber, 'continua disponível para compra');
        
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: {
            type: 'info',
            message: `🗑️ ${itemToRemove.selectedClass} Nº ${itemToRemove.selectedNumber} removido do carrinho`,
            duration: 2000
          }
        }));
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
    
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        type: 'info',
        message: '🧹 Carrinho limpo!',
        duration: 2000
      }
    }));
  }, [cart]);

  // ========== FUNÇÕES AUXILIARES ==========
  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
  }, [cart]);

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);

  // ========== FUNÇÃO PRINCIPAL: ENVIAR RIFAS PARA FIREBASE (EM TEMPO REAL) ==========
  const sendRafflesToFirebase = useCallback(async (orderData, paymentMethod) => {
    console.log(`🚀 ENVIANDO RIFAS PARA FIREBASE EM TEMPO REAL - ${paymentMethod}`);
    
    if (!raffleManager) {
      console.error('❌ RaffleManager não disponível');
      return { success: false, error: 'Sistema de rifas não disponível' };
    }
    
    const raffleItems = cart.filter(item => item.isRaffle);
    
    if (raffleItems.length === 0) {
      console.log('ℹ️ Nenhuma rifa para enviar');
      return { success: true, results: [], totalSent: 0, totalFailed: 0 };
    }
    
    console.log(`📤 Processando ${raffleItems.length} rifas para envio EM TEMPO REAL`);
    
    const results = [];
    let totalSent = 0;
    let totalFailed = 0;
    let criticalFailures = [];
    
    // Para cada rifa, verificar EM TEMPO REAL antes de enviar
    for (const raffleItem of raffleItems) {
      try {
        console.log(`🎯 Verificando ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber} em tempo real...`);
        
        // VERIFICAÇÃO EM TEMPO REAL ANTES DE ENVIAR
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
            error: 'Número já vendido por outra pessoa',
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
            error: 'Número já reservado por outra pessoa',
            alreadyReserved: true
          });
          totalFailed++;
          criticalFailures.push(`${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          continue;
        }
        
        // PREPARAR DADOS
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
          // Para PIX, marca como PAGO
          result = await raffleManager.confirmPaymentAndSendToFirebase(raffleData, {
            method: 'pix',
            orderId: orderData.id
          });
        } else {
          // Para DINHEIRO, marca como PENDENTE
          result = await raffleManager.createCashReservationInFirebase(raffleData, {
            method: 'dinheiro',
            orderId: orderData.id
          });
        }
        
        if (result) {
          console.log(`✅ Rifa enviada com SUCESSO: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          results.push({
            success: true,
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            status: paymentMethod === 'pix' ? 'pago' : 'pendente',
            firebaseId: result.firebaseId || result.id,
            timestamp: new Date().toISOString()
          });
          totalSent++;
          
          // NOTIFICAR IMEDIATAMENTE OUTROS USUÁRIOS
          window.dispatchEvent(new CustomEvent('number_sold', {
            detail: {
              turma: raffleItem.selectedClass,
              numero: raffleItem.selectedNumber,
              status: paymentMethod === 'pix' ? 'pago' : 'pendente'
            }
          }));
          
        } else {
          console.error(`❌ Falha ao enviar: ${raffleItem.selectedClass} Nº ${raffleItem.selectedNumber}`);
          results.push({
            success: false,
            turma: raffleItem.selectedClass,
            numero: raffleItem.selectedNumber,
            error: 'Falha no envio para Firebase'
          });
          totalFailed++;
        }
        
        // Pequena pausa para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ Erro crítico: ${raffleItem.selectedNumber}:`, error);
        results.push({
          success: false,
          turma: raffleItem.selectedClass,
          numero: raffleItem.selectedNumber,
          error: error.message
        });
        totalFailed++;
      }
    }
    
    console.log('📊 RESULTADO FINAL DO ENVIO:');
    console.log(`- ✅ Sucessos: ${totalSent}`);
    console.log(`- ❌ Falhas: ${totalFailed}`);
    
    // FORÇAR ATUALIZAÇÃO IMEDIATA EM TODAS AS ABAS
    if (raffleManager.refreshData) {
      raffleManager.refreshData();
      
      // Disparar evento global para atualizar todas as instâncias
      window.dispatchEvent(new CustomEvent('firebase_force_refresh', {
        detail: { 
          timestamp: new Date().toISOString(),
          totalSent,
          totalFailed 
        }
      }));
    }
    
    // Se houver falhas críticas, mostrar alerta
    if (criticalFailures.length > 0) {
      console.error('🚨 FALHAS CRÍTICAS - Números já vendidos/reservados:', criticalFailures);
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'error', 
          message: `⚠️ ${criticalFailures.length} número(s) já foram vendidos/reservados: ${criticalFailures.join(', ')}`,
          duration: 8000 
        }
      }));
    }
    
    return { 
      success: totalFailed === 0, 
      results,
      totalSent,
      totalFailed,
      error: totalFailed > 0 ? `${totalFailed} rifa(s) não foram enviadas` : null,
      hasCriticalFailures: criticalFailures.length > 0,
      criticalFailures
    };
    
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
        
        // Se houver falhas críticas, atualizar o pedido parcialmente
        if (result.totalSent > 0) {
          const updatedOrder = {
            ...order,
            status: 'partial',
            rafflesConfirmed: true,
            rafflesPartial: true,
            rafflesFirebaseResults: result.results,
            partialSuccess: result.totalSent,
            partialFailed: result.totalFailed
          };
          
          setCurrentOrder(updatedOrder);
          localStorage.setItem('terceirao_last_order', JSON.stringify(updatedOrder));
          
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: { 
              type: 'warning', 
              message: `⚠️ ${result.totalSent} rifa(s) enviadas, ${result.totalFailed} falharam. Entre em contato.`,
              duration: 6000 
            }
          }));
        } else {
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: { 
              type: 'error', 
              message: '❌ Erro ao enviar rifas. Entre em contato com o administrador.',
              duration: 6000 
            }
          }));
        }
        
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