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

  // 2. SALVAR no localStorage SEMPRE que o carrinho mudar
  useEffect(() => {
    try {
      localStorage.setItem('terceirao_cart', JSON.stringify(cart));
      
      // Calcular total
      const total = cart.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);
      
      setCartTotal(total);
      console.log('💾 Carrinho salvo no localStorage:', cart.length, 'itens');
    } catch (error) {
      console.error('❌ Erro ao salvar carrinho:', error);
    }
  }, [cart]); // Executa sempre que cart mudar

  // 3. Funções do carrinho (usando useCallback para performance)
  const addToCart = useCallback((product) => {
    if (!product || !product.id) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                price: product.price // Garante que o preço está atualizado
              }
            : item
        );
      }
      
      return [...prevCart, { 
        ...product, 
        quantity: 1,
        emoji: product.emoji || '📦',
        description: product.description || ''
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
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
      vendorInfo: VENDOR_INFO
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
  }, [cart, generateOrderId]);

  // Funções de controle do modal
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    setShowPayment(false);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    setShowPayment(false);
  }, []);

  const closePaymentOnly = useCallback(() => {
    setShowPayment(false);
  }, []);

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
      createOrder,
      setShowPayment,
      vendorInfo: VENDOR_INFO
    }}>
      {children}
    </CartContext.Provider>
  );
};