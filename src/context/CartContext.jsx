// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { VENDOR_INFO } from '../config/vendor';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // 1. CARREGAR do localStorage AO INICIAR (somente uma vez)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('terceirao_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('📦 Carrinho carregado do localStorage:', parsed.length, 'itens');
        // FILTRAR APENAS PRODUTOS DISPONÍVEIS (RIFAS)
        const filteredCart = parsed.filter(item => 
          item.category === 'rifas' && 
          item.available !== false && 
          item.stock > 0
        );
        console.log('✅ Carrinho filtrado (apenas disponíveis):', filteredCart.length, 'itens');
        return Array.isArray(filteredCart) ? filteredCart : [];
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

  // 2. SALVAR no localStorage SEMPRE que o carrinho mudar
  useEffect(() => {
    try {
      // Garantir que apenas produtos disponíveis sejam salvos
      const availableCart = cart.filter(item => 
        item.category === 'rifas' && 
        item.available !== false && 
        item.stock > 0
      );
      
      localStorage.setItem('terceirao_cart', JSON.stringify(availableCart));
      
      // Calcular total
      const total = availableCart.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);
      
      setCartTotal(total);
      console.log('💾 Carrinho salvo no localStorage (apenas disponíveis):', availableCart.length, 'itens');
    } catch (error) {
      console.error('❌ Erro ao salvar carrinho:', error);
    }
  }, [cart]); // Executa sempre que cart mudar

  // 3. VERIFICAR SE PRODUTO PODE SER ADICIONADO AO CARRINHO
  const canAddToCart = useCallback((product) => {
    if (!product || !product.id) return false;
    
    // VERIFICA SE É UMA RIFA
    const isRaffle = product.category === 'rifas';
    
    // VERIFICA SE ESTÁ DISPONÍVEL
    // Produto está indisponível se:
    // 1. Não for rifa
    // 2. Ou se tiver available === false
    // 3. Ou se tiver stock === 0
    // 4. Ou se tiver isUnavailable === true
    const isUnavailable = !isRaffle || 
                         product.available === false || 
                         product.stock === 0 || 
                         product.isUnavailable === true;
    
    return !isUnavailable;
  }, []);

  // 4. Funções do carrinho (usando useCallback para performance)
  const addToCart = useCallback((product) => {
    if (!product || !product.id) return false;
    
    // VERIFICAR SE O PRODUTO PODE SER ADICIONADO
    if (!canAddToCart(product)) {
      console.error('🚫 Produto indisponível para adicionar ao carrinho:', {
        name: product.name,
        category: product.category,
        available: product.available,
        stock: product.stock,
        isUnavailable: product.isUnavailable
      });
      
      // Criar evento customizado para mostrar toast/notificação
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: `"${product.name}" não está disponível para compra. Apenas a Rifa da Formatura está disponível no momento.`,
          duration: 5000
        }
      });
      window.dispatchEvent(event);
      
      return false;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Verificar se excede o estoque (apenas para rifas)
        const newQuantity = existingItem.quantity + 1;
        if (product.category === 'rifas' && newQuantity > (product.stock || 0)) {
          const event = new CustomEvent('showToast', {
            detail: {
              type: 'warning',
              message: `Quantidade máxima disponível para "${product.name}" é ${product.stock}`,
              duration: 3000
            }
          });
          window.dispatchEvent(event);
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: newQuantity,
                price: product.price // Garante que o preço está atualizado
              }
            : item
        );
      }
      
      return [...prevCart, { 
        ...product, 
        quantity: 1,
        emoji: product.emoji || '📦',
        description: product.description || '',
        // Garantir que tem as propriedades de disponibilidade
        available: true,
        isUnavailable: false
      }];
    });
    
    // Mostrar notificação de sucesso
    const event = new CustomEvent('showToast', {
      detail: {
        type: 'success',
        message: `${product.emoji || '🎟️'} "${product.name}" adicionado ao carrinho!`,
        duration: 2000
      }
    });
    window.dispatchEvent(event);
    
    return true;
  }, [canAddToCart]);

  const removeFromCart = useCallback((productId) => {
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
          // Verificar estoque para rifas
          const product = prevCart.find(p => p.id === productId);
          if (product && product.category === 'rifas' && quantity > (product.stock || 0)) {
            const event = new CustomEvent('showToast', {
              detail: {
                type: 'warning',
                message: `Quantidade máxima disponível é ${product.stock}`,
                duration: 3000
              }
            });
            window.dispatchEvent(event);
            return item; // Não altera a quantidade
          }
          
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem('terceirao_cart');
      console.log('🗑️ Carrinho limpo do localStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
    }
  }, []);

  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + (item.quantity || 0), 0);
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return cartTotal;
  }, [cartTotal]);

  // Funções do pedido
  const generateOrderId = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000);
    return `PED${timestamp}${random.toString().padStart(3, '0')}`;
  }, []);

  const createOrder = useCallback((orderData) => {
    const { deliveryOption, deliveryAddress, ...customerInfo } = orderData;
    
    // Verificar se todos os itens do carrinho ainda estão disponíveis
    const unavailableItems = cart.filter(item => !canAddToCart(item));
    if (unavailableItems.length > 0) {
      console.error('❌ Itens indisponíveis no carrinho:', unavailableItems);
      
      // Remover itens indisponíveis
      setCart(prevCart => prevCart.filter(item => canAddToCart(item)));
      
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: `${unavailableItems.length} item(ns) foram removidos do carrinho por estarem indisponíveis.`,
          duration: 5000
        }
      });
      window.dispatchEvent(event);
      
      return null;
    }
    
    const orderId = generateOrderId();
    const today = new Date();
    
    // Se for entrega, calcular data de entrega (amanhã)
    let deliveryDate = null;
    if (deliveryOption === 'entrega') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      deliveryDate = tomorrow.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    
    // Calcular valores
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryOption === 'entrega' ? 3.00 : 0;
    const total = subtotal + deliveryFee;
    
    const order = {
      id: orderId,
      date: today.toLocaleString('pt-BR'),
      items: [...cart],
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      customer: { ...customerInfo },
      deliveryOption: deliveryOption || 'retirada',
      deliveryAddress: deliveryOption === 'entrega' ? deliveryAddress : null,
      deliveryDate: deliveryDate,
      status: 'pending',
      vendorInfo: VENDOR_INFO,
      // Informações de disponibilidade
      containsOnlyAvailableItems: true,
      containsOnlyRaffles: cart.every(item => item.category === 'rifas')
    };
    
    console.log('📋 Pedido criado:', order);
    setCurrentOrder(order);
    setShowPayment(true);
    
    // Salvar pedido no localStorage (apenas para histórico)
    try {
      const savedOrders = JSON.parse(localStorage.getItem('terceirao_orders') || '[]');
      savedOrders.push(order);
      localStorage.setItem('terceirao_orders', JSON.stringify(savedOrders));
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error);
    }
    
    return order;
  }, [cart, canAddToCart, generateOrderId]);

  // Funções de controle do modal
  const toggleCart = useCallback(() => {
    console.log('toggleCart chamado, estado atual:', isCartOpen);
    setIsCartOpen(prev => {
      const newState = !prev;
      console.log('Novo estado do carrinho:', newState);
      return newState;
    });
  }, [isCartOpen]);

  const openCart = useCallback(() => {
    console.log('Abrindo carrinho...');
    setIsCartOpen(true);
    setShowPayment(false);
  }, []);

  const closeCart = useCallback(() => {
    console.log('Fechando carrinho...');
    setIsCartOpen(false);
    setShowPayment(false);
  }, []);

  const closePaymentOnly = useCallback(() => {
    setShowPayment(false);
  }, []);

  // 5. Função para verificar itens do carrinho (executar ao carregar)
  useEffect(() => {
    // Verificar itens do carrinho ao carregar
    const checkCartItems = () => {
      const unavailableItems = cart.filter(item => !canAddToCart(item));
      if (unavailableItems.length > 0) {
        console.warn('⚠️ Itens indisponíveis no carrinho:', unavailableItems);
        
        // Remover itens indisponíveis
        setCart(prevCart => prevCart.filter(item => canAddToCart(item)));
        
        // Mostrar notificação
        const event = new CustomEvent('showToast', {
          detail: {
            type: 'warning',
            message: `${unavailableItems.length} item(ns) foram removidos do carrinho por estarem indisponíveis.`,
            duration: 5000
          }
        });
        window.dispatchEvent(event);
      }
    };
    
    checkCartItems();
  }, [canAddToCart, cart]); // CORREÇÃO: Adicionar as dependências necessárias

  return (
    <CartContext.Provider value={{
      cart,
      cartTotal,
      isCartOpen,
      showPayment,
      currentOrder,
      toggleCart,
      openCart,
      closeCart,
      closePaymentOnly,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartCount,
      getCartTotal,
      getTotalItems: getCartCount,
      createOrder,
      setShowPayment,
      vendorInfo: VENDOR_INFO,
      // Nova função exposta
      canAddToCart
    }}>
      {children}
    </CartContext.Provider>
  );
};