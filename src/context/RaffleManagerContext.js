import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const RaffleManagerContext = createContext();

export const RaffleManagerProvider = ({ children }) => {
  const [soldNumbers, setSoldNumbers] = useState(() => {
    try {
      const saved = localStorage.getItem('terceirao-sold-numbers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pendingReservations, setPendingReservations] = useState(() => {
    try {
      const saved = localStorage.getItem('terceirao-pending-reservations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem('terceirao-last-sync') || null;
  });
  
  const [firebase, setFirebase] = useState({
    connected: false,
    db: null,
    error: null
  });

  // ========== FUNÇÕES DE LOGIN/LOGOUT ADMIN ==========

  const loginAdmin = useCallback((password) => {
    try {
      const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
      
      if (!adminPassword) {
        console.error('REACT_APP_ADMIN_PASSWORD não está definida');
        toast.error('Erro de configuração do sistema');
        return false;
      }
      
      const isPasswordCorrect = password.trim() === adminPassword.trim();
      
      if (!isPasswordCorrect) {
        return false;
      }
      
      const authToken = btoa(`${Date.now()}-${Math.random().toString(36).substr(2)}`);
      const authTimestamp = Date.now();
      
      localStorage.setItem('admin_token', authToken);
      localStorage.setItem('admin_auth_timestamp', authTimestamp.toString());
      localStorage.setItem('terceirao-admin', 'true');
      
      setIsAdmin(true);
      
      toast.success('Login realizado com sucesso!');
      
      return true;
      
    } catch (error) {
      console.error('Erro no login admin:', error);
      toast.error('Erro interno ao fazer login');
      return false;
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    try {
      console.log('🔓 Fazendo logout admin...');
      
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_auth_timestamp');
      localStorage.removeItem('terceirao-admin');
      
      setIsAdmin(false);
      
      console.log('✅ Logout realizado com sucesso');
      toast.success('Logout realizado');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  }, []);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const adminToken = localStorage.getItem('admin_token');
        const authTimestamp = localStorage.getItem('admin_auth_timestamp');
        
        if (adminToken && authTimestamp) {
          const now = Date.now();
          const twentyFourHours = 24 * 60 * 60 * 1000;
          
          if (now - parseInt(authTimestamp) < twentyFourHours) {
            console.log('✅ Admin autenticado (token válido)');
            setIsAdmin(true);
            return;
          } else {
            console.log('⚠️ Token admin expirado');
            logoutAdmin();
          }
        }
        
        const legacyAuth = localStorage.getItem('terceirao-admin');
        if (legacyAuth === 'true') {
          console.log('✅ Admin autenticado (método legado)');
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação admin:', error);
        setIsAdmin(false);
      }
    };

    checkAdminAuth();
  }, [logoutAdmin]);

  // ========== FUNÇÕES AUXILIARES ==========

  // Nova função: mesclar vendas com todos os status
  const mergeSalesWithAllStatus = useCallback((localSales, firebaseSales) => {
    const salesMap = new Map();
    
    // Primeiro, adicionar todas as vendas do Firebase (incluindo pendentes)
    firebaseSales.forEach(sale => {
      const key = `${sale.turma}-${sale.numero}`;
      salesMap.set(key, { 
        ...sale, 
        synced: true,
        isFromFirebase: true 
      });
    });
    
    // Depois, adicionar vendas locais que não estão no Firebase
    localSales.forEach(sale => {
      const key = `${sale.turma}-${sale.numero}`;
      if (!salesMap.has(key)) {
        salesMap.set(key, sale);
      }
    });
    
    return Array.from(salesMap.values());
  }, []);

  // Função para mesclar reservas
  const mergeReservations = useCallback((localReservations, firebaseReservations) => {
    const reservationsMap = new Map();
    
    firebaseReservations.forEach(res => {
      const key = res.id || `${res.turma}-${res.numero}`;
      reservationsMap.set(key, { 
        ...res, 
        synced: true,
        isFromFirebase: true 
      });
    });
    
    localReservations.forEach(res => {
      const key = res.id || `${res.turma}-${res.numero}`;
      if (!reservationsMap.has(key)) {
        reservationsMap.set(key, res);
      }
    });
    
    return Array.from(reservationsMap.values());
  }, []);

  // ========== INICIALIZAÇÃO DO FIREBASE ==========
  
  // ========== INICIALIZAÇÃO DO FIREBASE ==========
  
useEffect(() => {
  const initializeFirebase = async () => {
    try {
      // ========== ADICIONE ESTES LOGS AQUI ==========
      console.log('🔍 ======= VERIFICAÇÃO FIREBASE =======');
      console.log('📋 Verificando configuração Firebase:');
      console.log('- REACT_APP_FIREBASE_API_KEY:', 
        process.env.REACT_APP_FIREBASE_API_KEY ? 
        `✅ Definida (${process.env.REACT_APP_FIREBASE_API_KEY.substring(0, 10)}...)` : 
        '❌ NÃO DEFINIDA'
      );
      console.log('- REACT_APP_FIREBASE_PROJECT_ID:', 
        process.env.REACT_APP_FIREBASE_PROJECT_ID ? 
        `✅ Definido (${process.env.REACT_APP_FIREBASE_PROJECT_ID})` : 
        '❌ NÃO DEFINIDO'
      );
      console.log('- REACT_APP_FIREBASE_APP_ID:', 
        process.env.REACT_APP_FIREBASE_APP_ID ? 
        `✅ Definido (${process.env.REACT_APP_FIREBASE_APP_ID.substring(0, 10)}...)` : 
        '❌ NÃO DEFINIDO'
      );
      console.log('- REACT_APP_FIREBASE_AUTH_DOMAIN:', 
        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 
        `✅ Definido (${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN})` : 
        '❌ NÃO DEFINIDO'
      );
      console.log('====================================');
      // ========== FIM DOS LOGS ADICIONAIS ==========
      
      const requiredEnvVars = [
        'REACT_APP_FIREBASE_API_KEY',
        'REACT_APP_FIREBASE_AUTH_DOMAIN', 
        'REACT_APP_FIREBASE_PROJECT_ID',
        'REACT_APP_FIREBASE_APP_ID'
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error('❌ Firebase não configurado. Variáveis faltando:', missingVars);
        setFirebase({ connected: false, db: null, error: 'Configuração incompleta' });
        return;
      }
      
      const firebaseModule = await import('firebase/app');
      const firestoreModule = await import('firebase/firestore');
      
      const { initializeApp } = firebaseModule;
      const { getFirestore, collection, query, onSnapshot, orderBy, serverTimestamp, addDoc, updateDoc, deleteDoc, doc } = firestoreModule;
      
      const firebaseConfig = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
      };
      
      console.log('🚀 Inicializando Firebase com configuração:', {
        apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        appId: firebaseConfig.appId?.substring(0, 10) + '...'
      });
      
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      const salesRef = collection(db, 'sales');
      const q = query(salesRef, orderBy('timestamp', 'desc'));
      
      console.log('📡 Firebase listener ativo. Aguardando dados...');
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const firebaseSales = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Garantir que todos os documentos tenham timestamp
            const saleData = {
              id: doc.id,
              firebaseId: doc.id,
              ...data,
              timestamp: data.timestamp ? data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp : new Date().toISOString()
            };
            firebaseSales.push(saleData);
          });
          
          console.log(`📥 Firebase: ${firebaseSales.length} vendas recebidas (todos os status)`);
          if (firebaseSales.length > 0) {
            console.log('📄 Primeira venda do Firebase:', firebaseSales[0]);
          }
          
          // IMPORTANTE: Atualizar soldNumbers com TODOS os dados do Firebase
          // Isso inclui vendas pagas (pago), pendentes (pendente) e reservadas (reservado)
          const merged = mergeSalesWithAllStatus(soldNumbers, firebaseSales);
          setSoldNumbers(merged);
          localStorage.setItem('terceirao-sold-numbers', JSON.stringify(merged));
          
          // Atualizar pendingReservations também
          const reservations = firebaseSales.filter(sale => 
            sale.status === 'pendente' || sale.status === 'reservado'
          );
          const mergedReservations = mergeReservations(pendingReservations, reservations);
          setPendingReservations(mergedReservations);
          localStorage.setItem('terceirao-pending-reservations', JSON.stringify(mergedReservations));
          
          setFirebase({ connected: true, db, error: null });
          setLastSync(new Date().toISOString());
          
          console.log('✅ Conectado ao servidor! Dados sincronizados (todos os status).');
          
          // Disparar evento para atualizar dashboard
          window.dispatchEvent(new CustomEvent('firebase_data_updated', {
            detail: { count: firebaseSales.length }
          }));
        },
        (error) => {
          console.error('❌ Erro Firebase:', error.code, error.message);
          console.error('❌ Detalhes do erro:', error);
          
          if (error.code === 'permission-denied') {
            console.log('⚠️ Modo somente leitura ativado - SEM PERMISSÃO PARA ESCREVER');
            console.log('🔧 Verifique as regras de segurança do Firebase Firestore');
            setFirebase({ connected: 'readonly', db, error: error.message });
            toast.warning('⚠️ Modo somente leitura (sem sincronização)');
          } else {
            setFirebase({ connected: false, db: null, error: error.message });
            toast.error('❌ Erro de conexão com Firebase');
          }
        }
      );
      
      window.firebaseExports = {
        db,
        collection,
        addDoc,
        updateDoc,
        deleteDoc,
        doc,
        serverTimestamp,
        salesRef
      };
      
      console.log('✅ Firebase inicializado com sucesso! DB:', db);
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Falha ao inicializar Firebase:', error);
      console.error('❌ Stack trace:', error.stack);
      setFirebase({ connected: false, db: null, error: error.message });
      return () => {};
    }
  };
  
  const unsubscribePromise = initializeFirebase();
  
  return () => {
    unsubscribePromise.then(unsubscribe => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
}, [soldNumbers, pendingReservations, mergeSalesWithAllStatus, mergeReservations]);

  // ========== VERIFICAÇÕES ==========

  const isNumberSold = useCallback((className, number) => {
    return soldNumbers.some(item => 
      item.turma === className && 
      item.numero === number &&
      item.status === 'pago'
    );
  }, [soldNumbers]);

  const isNumberReserved = useCallback((className, number) => {
    return pendingReservations.some(item => 
      item.turma === className && 
      item.numero === number &&
      !item.expired
    );
  }, [pendingReservations]);

  // NOVA FUNÇÃO: Verificar se número está pendente (dinheiro)
  const isNumberPending = useCallback((className, number) => {
    return soldNumbers.some(item => 
      item.turma === className && 
      item.numero === number &&
      item.status === 'pendente'
    );
  }, [soldNumbers]);

  const getAvailableNumbers = useCallback((className) => {
    const soldInClass = soldNumbers
      .filter(item => 
        item.turma === className && 
        item.status === 'pago'
      )
      .map(item => item.numero);
    
    const reservedInClass = pendingReservations
      .filter(item => 
        item.turma === className && 
        !item.expired
      )
      .map(item => item.numero);
    
    return Array.from({ length: 300 }, (_, i) => i + 1)
      .filter(num => !soldInClass.includes(num) && !reservedInClass.includes(num));
  }, [soldNumbers, pendingReservations]);

  const findSale = useCallback((turma, numero) => {
    return soldNumbers.find(item => 
      item.turma === turma && 
      item.numero === numero
    );
  }, [soldNumbers]);

  // ========== OPERAÇÕES DE RESERVA LOCAL ==========

  const reserveNumber = useCallback((className, number, buyerInfo = {}) => {
    const reservationId = `reserve-${className}-${number}-${Date.now()}`;
    const expiresAt = Date.now() + (30 * 60 * 1000);
    
    const reservation = {
      id: reservationId,
      reservationId,
      turma: className,
      numero: number,
      nome: buyerInfo.nome || 'Comprador Online',
      telefone: buyerInfo.telefone || '',
      status: 'reservado',
      timestamp: new Date().toISOString(),
      expiresAt,
      expired: false,
      orderId: buyerInfo.orderId || null,
      source: 'online',
      isReservation: true,
      synced: false,
      isPendingPayment: true,
      needsConfirmation: true
    };
    
    console.log('📝 RESERVANDO LOCALMENTE:', {
      turma: className,
      numero: number,
      reservationId,
      status: 'AGUARDANDO PAGAMENTO',
      expiresAt: new Date(expiresAt).toLocaleTimeString()
    });
    
    setPendingReservations(prev => {
      const exists = prev.some(item => 
        item.turma === className && 
        item.numero === number &&
        !item.expired
      );
      
      if (exists) {
        console.log('⚠️ Número já reservado:', number);
        return prev;
      }
      
      const updated = [...prev, reservation];
      localStorage.setItem('terceirao-pending-reservations', JSON.stringify(updated));
      return updated;
    });
    
    return reservation;
  }, []);

  const cancelReservation = useCallback((reservationId) => {
    console.log('❌ Cancelando reserva local:', reservationId);
    
    setPendingReservations(prev => {
      const updated = prev.filter(item => item.id !== reservationId);
      localStorage.setItem('terceirao-pending-reservations', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ========== FUNÇÃO: Marcar números como reservados (para dinheiro) ==========

  const markNumbersAsReserved = useCallback((turma, numero, nome, orderId) => {
    console.log('📝 MARCADO COMO RESERVADO (Dinheiro):', { turma, numero, nome, orderId });
    
    // Verificar se já está vendido
    const alreadySold = isNumberSold(turma, numero);
    
    if (alreadySold) {
      console.error('❌ Número já está vendido:', turma, numero);
      return false;
    }
    
    // Criar registro de reserva
    const reservationId = `reserve-${turma}-${numero}-${Date.now()}`;
    const reservation = {
      id: reservationId,
      reservationId,
      turma,
      numero,
      nome: nome || 'Cliente Dinheiro',
      status: 'pendente',
      timestamp: new Date().toISOString(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000),
      expired: false,
      orderId: orderId || null,
      source: 'dinheiro_online',
      paymentMethod: 'dinheiro',
      needsPayment: true,
      synced: false
    };
    
    // Adicionar às reservas pendentes
    setPendingReservations(prev => {
      const exists = prev.some(item => 
        item.turma === turma && 
        item.numero === numero &&
        !item.expired
      );
      
      if (exists) {
        console.log('⚠️ Já está reservado:', turma, numero);
        return prev;
      }
      
      const updated = [...prev, reservation];
      localStorage.setItem('terceirao-pending-reservations', JSON.stringify(updated));
      console.log('✅ Adicionado às reservas pendentes');
      return updated;
    });
    
    // Adicionar aos soldNumbers com status 'pendente' para aparecer no dashboard
    setSoldNumbers(prev => {
      const exists = prev.some(item => 
        item.turma === turma && 
        item.numero === numero
      );
      
      if (exists) {
        const updated = prev.map(item => 
          item.turma === turma && item.numero === numero 
            ? { ...item, status: 'pendente', paymentMethod: 'dinheiro', orderId }
            : item
        );
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
        return updated;
      }
      
      const newSale = {
        id: reservationId,
        turma,
        numero,
        nome: nome || 'Cliente Dinheiro',
        status: 'pendente',
        timestamp: new Date().toISOString(),
        paymentMethod: 'dinheiro',
        orderId,
        source: 'dinheiro_online',
        synced: false
      };
      
      const updated = [...prev, newSale];
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
      console.log('✅ Adicionado aos números vendidos (pendente)');
      return updated;
    });
    
    // Disparar evento para atualizar dashboard
    window.dispatchEvent(new CustomEvent('new_sale_added', {
      detail: { turma, numero, status: 'pendente' }
    }));
    
    return true;
  }, [isNumberSold]);

  // ========== FUNÇÃO: Forçar atualização de dados ==========

  const refreshData = useCallback(() => {
    console.log('🔄 Forçando atualização de dados...');
    
    try {
      const savedSold = localStorage.getItem('terceirao-sold-numbers');
      const savedReservations = localStorage.getItem('terceirao-pending-reservations');
      
      if (savedSold) {
        const parsed = JSON.parse(savedSold);
        console.log(`📊 Recarregando ${parsed.length} vendas do localStorage`);
        setSoldNumbers(parsed);
      }
      
      if (savedReservations) {
        const parsed = JSON.parse(savedReservations);
        console.log(`📊 Recarregando ${parsed.length} reservas do localStorage`);
        setPendingReservations(parsed);
      }
      
      toast.success('Dados atualizados');
      
      // Disparar evento para dashboard
      window.dispatchEvent(new CustomEvent('data_refreshed'));
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error);
    }
  }, []);

  // ========== NOVA FUNÇÃO: Atualizar status da venda ==========

  const updateSaleStatus = useCallback(async (saleId, newStatus, paymentMethod = null) => {
    console.log(`🔄 Atualizando status da venda ${saleId} para ${newStatus}`);
    
    try {
      // Encontrar a venda
      const saleIndex = soldNumbers.findIndex(sale => sale.id === saleId);
      if (saleIndex === -1) {
        console.error('❌ Venda não encontrada:', saleId);
        toast.error('Venda não encontrada');
        return false;
      }
      
      const sale = soldNumbers[saleIndex];
      const updatedSale = {
        ...sale,
        status: newStatus,
        paymentMethod: paymentMethod || sale.paymentMethod,
        updatedAt: new Date().toISOString(),
        synced: false
      };
      
      // Atualizar localmente
      setSoldNumbers(prev => {
        const updated = [...prev];
        updated[saleIndex] = updatedSale;
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
        return updated;
      });
      
      // Se for mudar de pendente para pago (dinheiro confirmado)
      if (sale.status === 'pendente' && newStatus === 'pago') {
        // Remover da lista de reservas pendentes se existir
        setPendingReservations(prev => {
          const updated = prev.filter(res => 
            !(res.turma === sale.turma && res.numero === sale.numero)
          );
          localStorage.setItem('terceirao-pending-reservations', JSON.stringify(updated));
          return updated;
        });
        
        toast.success(`✅ Pagamento em dinheiro confirmado: ${sale.turma} Nº ${sale.numero}`);
      }
      
      // Enviar para Firebase se disponível
      if (firebase.connected && firebase.db) {
        try {
          const { doc, updateDoc, serverTimestamp } = window.firebaseExports;
          
          if (sale.firebaseId) {
            // Se tem ID do Firebase, atualizar documento existente
            const saleRef = doc(firebase.db, 'sales', sale.firebaseId);
            await updateDoc(saleRef, {
              status: newStatus,
              paymentMethod: paymentMethod || sale.paymentMethod,
              updatedAt: serverTimestamp(),
              lastSync: serverTimestamp()
            });
            
            console.log('✅ Status atualizado no Firebase');
          } else {
            // Se não tem ID, criar novo documento
            const { addDoc, collection } = window.firebaseExports;
            
            const saleData = {
              turma: sale.turma,
              numero: sale.numero,
              nome: sale.nome || '',
              telefone: sale.telefone || '',
              status: newStatus,
              timestamp: serverTimestamp(),
              paymentMethod: paymentMethod || sale.paymentMethod,
              orderId: sale.orderId,
              source: sale.source || 'admin',
              deviceId: 'admin',
              lastSync: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(firebase.db, 'sales'), saleData);
            
            // Atualizar com ID do Firebase
            setSoldNumbers(prev => {
              const updated = [...prev];
              updated[saleIndex] = {
                ...updatedSale,
                firebaseId: docRef.id,
                synced: true
              };
              localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
              return updated;
            });
          }
          
          toast.success('Status atualizado no servidor!');
          
        } catch (firebaseError) {
          console.error('❌ Erro ao atualizar no Firebase:', firebaseError);
          toast.error('Erro ao sincronizar com servidor, mas atualizado localmente');
        }
      }
      
      // Disparar evento para atualizar dashboard
      window.dispatchEvent(new CustomEvent('sale_status_updated', {
        detail: { saleId, newStatus }
      }));
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da venda');
      return false;
    }
  }, [soldNumbers, firebase.connected, firebase.db]);

  // ========== NOVA FUNÇÃO: Marcar múltiplas vendas como pagas ==========

  const bulkMarkAsPaid = useCallback(async (sales, paymentMethod = 'dinheiro') => {
    console.log(`💰 Marcando ${sales.length} vendas como pagas...`);
    
    const results = [];
    for (const sale of sales) {
      const success = await updateSaleStatus(sale.id, 'pago', paymentMethod);
      results.push({ sale, success });
    }
    
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      toast.success(`✅ ${successCount} vendas marcadas como pagas!`);
    }
    
    return results;
  }, [updateSaleStatus]);

  // ========== NOVAS FUNÇÕES: ENVIO DIRETO PARA FIREBASE ==========

      const confirmPaymentAndSendToFirebase = useCallback(async (raffleData, paymentInfo = {}) => {
      console.log('🚀 ===== CONFIRMANDO PAGAMENTO E ENVIANDO PARA FIREBASE =====');
      console.log('📦 Dados da rifa:', raffleData);
      console.log('💰 Informações de pagamento:', paymentInfo);
      
      const { turma, numero } = raffleData;
      
      const alreadySold = isNumberSold(turma, numero);
      if (alreadySold) {
        console.error('❌ Número já vendido:', turma, numero);
        toast.error('Este número já foi vendido!');
        return null;
      }
      
      const saleId = `${turma}-${numero}-${Date.now()}`;
      const confirmedSale = {
        id: saleId,
        turma,
        numero,
        nome: raffleData.nome || paymentInfo.nome || 'Comprador Online',
        telefone: raffleData.telefone || paymentInfo.telefone || '',
        status: 'pago',
        timestamp: new Date().toISOString(),
        paymentTimestamp: new Date().toISOString(),
        paymentMethod: paymentInfo.method || 'pix',
        orderId: paymentInfo.orderId,
        source: 'online',
        synced: false,
        confirmed: true,
        confirmedAt: new Date().toISOString()
      };
      
      console.log('✅ Criando venda PAGA para enviar ao Firebase:', confirmedSale);
      
      // Atualizar estado local IMEDIATAMENTE
      setSoldNumbers(prev => {
        const exists = prev.some(item => 
          item.turma === turma && 
          item.numero === numero &&
          item.status === 'pago'
        );
        
        if (exists) return prev;
        
        const updated = [...prev, confirmedSale];
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
        return updated;
      });
      
      // Enviar para Firebase se disponível
      if (firebase.connected && firebase.db) {
        console.log('📤 ENVIANDO VENDA PAGA PARA FIREBASE...');
        
        try {
          const { addDoc, collection, serverTimestamp } = window.firebaseExports;
          
          const saleData = {
            turma: confirmedSale.turma,
            numero: confirmedSale.numero,
            nome: confirmedSale.nome,
            telefone: confirmedSale.telefone || '',
            status: 'pago',
            timestamp: serverTimestamp(),
            paymentTimestamp: serverTimestamp(),
            paymentMethod: confirmedSale.paymentMethod,
            orderId: confirmedSale.orderId,
            source: 'online',
            deviceId: localStorage.getItem('deviceId') || 'unknown',
            lastSync: serverTimestamp(),
            confirmedAt: serverTimestamp()
          };
          
          console.log('🔥 Dados sendo enviados para Firebase:', saleData);
          console.log('🔧 Configuração Firebase:', {
            apiKey: process.env.REACT_APP_FIREBASE_API_KEY?.substring(0, 10) + '...',
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
            db: firebase.db
          });
          
          const docRef = await addDoc(collection(firebase.db, 'sales'), saleData);
          const firebaseId = docRef.id;
          
          console.log('✅ ENVIADO para Firebase com ID:', firebaseId);
          console.log('✅ Documento criado na coleção "sales"');
          
          const syncedSale = {
            ...confirmedSale,
            firebaseId,
            synced: true,
            lastSync: new Date().toISOString()
          };
          
          setSoldNumbers(prev => {
            const updated = prev.map(item => 
              item.id === saleId ? { ...item, ...syncedSale } : item
            );
            localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
            return updated;
          });
          
          toast.success(`✅ Rifa PIX CONFIRMADA: ${turma} Nº ${numero}`);
          
          // Disparar evento para dashboard
          window.dispatchEvent(new CustomEvent('new_sale_added', {
            detail: { turma, numero, status: 'pago', method: 'pix' }
          }));
          
          return syncedSale;
          
        } catch (error) {
          console.error('❌ Erro ao enviar para Firebase:', error);
          console.error('❌ Código do erro:', error.code);
          console.error('❌ Mensagem do erro:', error.message);
          console.error('❌ Stack trace:', error.stack);
          toast.error(`Erro ao confirmar no servidor: ${error.message}`);
          
          return confirmedSale;
        }
      } else {
        console.log('⚠️ Firebase não disponível, mantendo localmente (PAGO)');
        console.log('🔧 Status Firebase:', {
          connected: firebase.connected,
          db: firebase.db ? 'Disponível' : 'Não disponível',
          error: firebase.error
        });
        toast.success(`✅ Rifa confirmada localmente: ${turma} Nº ${numero}`);
        
        // Disparar evento mesmo sem Firebase
        window.dispatchEvent(new CustomEvent('new_sale_added', {
          detail: { turma, numero, status: 'pago', method: 'pix' }
        }));
        
        return confirmedSale;
      }
    }, [firebase.connected, firebase.db,firebase.error, isNumberSold]);
    

  const createCashReservationInFirebase = useCallback(async (raffleData, paymentInfo = {}) => {
  console.log('💰 ===== CRIANDO RESERVA PENDENTE PARA DINHEIRO =====');
  console.log('📦 Dados da rifa:', raffleData);
  
  const { turma, numero } = raffleData;
  
  const alreadySold = isNumberSold(turma, numero);
  if (alreadySold) {
    console.error('❌ Número já vendido:', turma, numero);
    toast.error('Este número já foi vendido!');
    return null;
  }
  
  const saleId = `${turma}-${numero}-${Date.now()}`;
  const cashReservation = {
    id: saleId,
    turma,
    numero,
    nome: raffleData.nome || paymentInfo.nome || 'Comprador Online',
    telefone: raffleData.telefone || paymentInfo.telefone || '',
    status: 'pendente',
    timestamp: new Date().toISOString(),
    paymentMethod: 'dinheiro',
    orderId: paymentInfo.orderId,
    source: 'online',
    synced: false,
    needsPayment: true,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000)
  };
  
  console.log('💰 Criando reserva PENDENTE:', cashReservation);
  
  // Atualizar estado local IMEDIATAMENTE
  setSoldNumbers(prev => {
    const exists = prev.some(item => 
      item.turma === turma && 
      item.numero === numero
    );
    
    if (exists) {
      const updated = prev.map(item => 
        item.turma === turma && item.numero === numero 
          ? { ...item, ...cashReservation } 
          : item
      );
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
      return updated;
    }
    
    const updated = [...prev, cashReservation];
    localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
    return updated;
  });
  
  // Enviar para Firebase se disponível
  if (firebase.connected && firebase.db) {
    console.log('📤 ENVIANDO RESERVA PENDENTE PARA FIREBASE...');
    
    try {
      const { addDoc, collection, serverTimestamp } = window.firebaseExports;
      
      const saleData = {
        turma: cashReservation.turma,
        numero: cashReservation.numero,
        nome: cashReservation.nome,
        telefone: cashReservation.telefone || '',
        status: 'pendente',
        timestamp: serverTimestamp(),
        paymentMethod: 'dinheiro',
        orderId: cashReservation.orderId,
        source: 'online',
        deviceId: localStorage.getItem('deviceId') || 'unknown',
        lastSync: serverTimestamp(),
        expiresAt: new Date(cashReservation.expiresAt).toISOString(),
        needsPayment: true
      };
      
      console.log('🔥 Dados sendo enviados para Firebase:', saleData);
      
      const docRef = await addDoc(collection(firebase.db, 'sales'), saleData);
      const firebaseId = docRef.id;
      
      console.log('✅ RESERVA PENDENTE enviada para Firebase com ID:', firebaseId);
      
      const syncedReservation = {
        ...cashReservation,
        firebaseId,
        synced: true,
        lastSync: new Date().toISOString()
      };
      
      setSoldNumbers(prev => {
        const updated = prev.map(item => 
          item.id === saleId ? { ...item, ...syncedReservation } : item
        );
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
        return updated;
      });
      
      toast.success(`✅ Reserva DINHEIRO enviada: ${turma} Nº ${numero} (Aguardando pagamento)`);
      
      // Disparar evento para dashboard
      window.dispatchEvent(new CustomEvent('new_sale_added', {
        detail: { turma, numero, status: 'pendente', method: 'dinheiro' }
      }));
      
      return syncedReservation;
      
    } catch (error) {
      console.error('❌ Erro ao enviar reserva:', error);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Mensagem do erro:', error.message);
      toast.error('Erro ao enviar reserva');
      
      return cashReservation;
    }
  } else {
    console.log('⚠️ Firebase não disponível, mantendo localmente');
    console.log('🔧 Status Firebase:', {
      connected: firebase.connected,
      db: firebase.db ? 'Disponível' : 'Não disponível'
    });
    toast.success(`✅ Reserva local: ${turma} Nº ${numero}`);
    
    // Disparar evento mesmo sem Firebase
    window.dispatchEvent(new CustomEvent('new_sale_added', {
      detail: { turma, numero, status: 'pendente', method: 'dinheiro' }
    }));
    
    return cashReservation;
  }
}, [firebase.connected, firebase.db, isNumberSold]);

  // ========== CONFIRMAÇÃO PARA FIREBASE ==========

  const confirmReservation = useCallback(async (reservationId, paymentInfo = {}) => {
    console.log('🚀 CONFIRMANDO PAGAMENTO de reserva existente:', reservationId);
    
    const reservation = pendingReservations.find(r => r.id === reservationId);
    if (!reservation) {
      console.error('❌ Reserva não encontrada:', reservationId);
      toast.error('Reserva não encontrada');
      return null;
    }
    
    const saleId = `${reservation.turma}-${reservation.numero}-${Date.now()}`;
    const confirmedSale = {
      id: saleId,
      turma: reservation.turma,
      numero: reservation.numero,
      nome: reservation.nome || paymentInfo.nome || 'Comprador Online',
      telefone: reservation.telefone || paymentInfo.telefone || '',
      status: 'pago',
      timestamp: new Date().toISOString(),
      paymentTimestamp: new Date().toISOString(),
      paymentMethod: paymentInfo.method || 'pix',
      orderId: reservation.orderId || paymentInfo.orderId,
      source: 'online',
      synced: false,
      confirmed: true,
      confirmedAt: new Date().toISOString()
    };
    
    console.log('✅ Criando venda PAGA para enviar ao Firebase:', confirmedSale);
    
    // Remover da lista de reservas pendentes
    setPendingReservations(prev => {
      const updated = prev.filter(item => item.id !== reservationId);
      localStorage.setItem('terceirao-pending-reservations', JSON.stringify(updated));
      return updated;
    });
    
    // Adicionar à lista de vendas
    setSoldNumbers(prev => {
      const exists = prev.some(item => 
        item.turma === reservation.turma && 
        item.numero === reservation.numero &&
        item.status === 'pago'
      );
      
      if (exists) return prev;
      
      const updated = [...prev, confirmedSale];
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
      return updated;
    });
    
    if (firebase.connected && firebase.db) {
      console.log('📤 ENVIANDO VENDA PAGA PARA FIREBASE...');
      
      try {
        const { addDoc, collection, serverTimestamp } = window.firebaseExports;
        
        const saleData = {
          turma: confirmedSale.turma,
          numero: confirmedSale.numero,
          nome: confirmedSale.nome,
          telefone: confirmedSale.telefone || '',
          status: 'pago',
          timestamp: serverTimestamp(),
          paymentTimestamp: serverTimestamp(),
          paymentMethod: confirmedSale.paymentMethod,
          orderId: confirmedSale.orderId,
          source: 'online',
          deviceId: localStorage.getItem('deviceId') || 'unknown',
          lastSync: serverTimestamp(),
          confirmedAt: serverTimestamp()
        };
        
        console.log('📦 Dados enviando para Firebase (VENDA PAGA):', saleData);
        
        const docRef = await addDoc(collection(firebase.db, 'sales'), saleData);
        const firebaseId = docRef.id;
        
        console.log('✅ ENVIADO para Firebase com ID:', firebaseId);
        
        const syncedSale = {
          ...confirmedSale,
          firebaseId,
          synced: true,
          lastSync: new Date().toISOString()
        };
        
        setSoldNumbers(prev => {
          const updated = prev.map(item => 
            item.id === saleId ? { ...item, ...syncedSale } : item
          );
          localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
          return updated;
        });
        
        toast.success(`✅ Rifa CONFIRMADA: ${reservation.turma} Nº ${reservation.numero}`);
        
        // Disparar evento para dashboard
        window.dispatchEvent(new CustomEvent('new_sale_added', {
          detail: { turma: reservation.turma, numero: reservation.numero, status: 'pago' }
        }));
        
        return syncedSale;
        
      } catch (error) {
        console.error('❌ Erro ao enviar para Firebase:', error);
        toast.error('Erro ao confirmar no servidor');
        
        return confirmedSale;
      }
    } else {
      console.log('⚠️ Firebase não disponível, mantendo localmente (PAGO)');
      toast.success(`✅ Rifa confirmada localmente: ${reservation.turma} Nº ${reservation.numero}`);
      
      // Disparar evento mesmo sem Firebase
      window.dispatchEvent(new CustomEvent('new_sale_added', {
        detail: { turma: reservation.turma, numero: reservation.numero, status: 'pago' }
      }));
      
      return confirmedSale;
    }
  }, [pendingReservations, firebase.connected, firebase.db]);

  const confirmCashReservation = useCallback(async (reservationId, paymentInfo = {}) => {
    console.log('💰 CONFIRMANDO RESERVA PARA DINHEIRO:', reservationId);
    
    const reservation = pendingReservations.find(r => r.id === reservationId);
    if (!reservation) {
      console.error('❌ Reserva não encontrada:', reservationId);
      toast.error('Reserva não encontrada');
      return null;
    }
    
    const saleId = `${reservation.turma}-${reservation.numero}-${Date.now()}`;
    const cashReservation = {
      id: saleId,
      turma: reservation.turma,
      numero: reservation.numero,
      nome: reservation.nome || paymentInfo.nome || 'Comprador Online',
      telefone: reservation.telefone || paymentInfo.telefone || '',
      status: 'pendente',
      timestamp: new Date().toISOString(),
      paymentMethod: 'dinheiro',
      orderId: reservation.orderId || paymentInfo.orderId,
      source: 'online',
      synced: false,
      needsPayment: true,
      expiresAt: reservation.expiresAt
    };
    
    console.log('💰 Criando reserva PENDENTE para dinheiro:', cashReservation);
    
    // Remover da lista de reservas antiga
    setPendingReservations(prev => {
      const updated = prev.filter(item => item.id !== reservationId);
      localStorage.setItem('terceirao-pending-reservations', JSON.stringify(updated));
      return updated;
    });
    
    // Adicionar à lista de vendas com status pendente
    setSoldNumbers(prev => {
      const exists = prev.some(item => 
        item.turma === reservation.turma && 
        item.numero === reservation.numero
      );
      
      if (exists) {
        const updated = prev.map(item => 
          item.turma === reservation.turma && item.numero === reservation.numero 
            ? { ...item, ...cashReservation } 
            : item
        );
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
        return updated;
      }
      
      const updated = [...prev, cashReservation];
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
      return updated;
    });
    
    if (firebase.connected && firebase.db) {
      console.log('📤 ENVIANDO RESERVA PENDENTE PARA FIREBASE...');
      
      try {
        const { addDoc, collection, serverTimestamp } = window.firebaseExports;
        
        const saleData = {
          turma: cashReservation.turma,
          numero: cashReservation.numero,
          nome: cashReservation.nome,
          telefone: cashReservation.telefone || '',
          status: 'pendente',
          timestamp: serverTimestamp(),
          paymentMethod: 'dinheiro',
          orderId: cashReservation.orderId,
          source: 'online',
          deviceId: localStorage.getItem('deviceId') || 'unknown',
          lastSync: serverTimestamp(),
          expiresAt: new Date(cashReservation.expiresAt).toISOString(),
          needsPayment: true
        };
        
        console.log('📦 Dados enviando para Firebase (RESERVA PENDENTE):', saleData);
        
        const docRef = await addDoc(collection(firebase.db, 'sales'), saleData);
        const firebaseId = docRef.id;
        
        console.log('✅ RESERVA PENDENTE enviada para Firebase com ID:', firebaseId);
        
        const syncedReservation = {
          ...cashReservation,
          firebaseId,
          synced: true,
          lastSync: new Date().toISOString()
        };
        
        setSoldNumbers(prev => {
          const updated = prev.map(item => 
            item.id === saleId ? { ...item, ...syncedReservation } : item
          );
          localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
          return updated;
        });
        
        toast.success(`✅ Reserva enviada: ${reservation.turma} Nº ${reservation.numero} (Aguardando pagamento em dinheiro)`);
        
        // Disparar evento para dashboard
        window.dispatchEvent(new CustomEvent('new_sale_added', {
          detail: { turma: reservation.turma, numero: reservation.numero, status: 'pendente' }
        }));
        
        return syncedReservation;
        
      } catch (error) {
        console.error('❌ Erro ao enviar reserva:', error);
        toast.error('Erro ao enviar reserva');
        
        return cashReservation;
      }
    } else {
      console.log('⚠️ Firebase não disponível, mantendo localmente');
      toast.success(`✅ Reserva local: ${reservation.turma} Nº ${reservation.numero}`);
      
      // Disparar evento mesmo sem Firebase
      window.dispatchEvent(new CustomEvent('new_sale_added', {
        detail: { turma: reservation.turma, numero: reservation.numero, status: 'pendente' }
      }));
      
      return cashReservation;
    }
  }, [pendingReservations, firebase.connected, firebase.db]);

  // ========== FUNÇÕES PARA ADMIN ==========

  const markNumberAsSold = useCallback(async (className, number, buyerInfo = {}) => {
    const id = `${className}-${number}-${Date.now()}`;
    const newSale = {
      id,
      turma: className,
      numero: number,
      nome: buyerInfo.nome || 'Admin',
      telefone: buyerInfo.telefone || '',
      status: 'pago',
      timestamp: new Date().toISOString(),
      synced: false,
      source: 'admin'
    };
    
    setSoldNumbers(prev => {
      const exists = prev.some(item => 
        item.turma === className && 
        item.numero === number &&
        item.status === 'pago'
      );
      
      if (exists) return prev;
      
      const updated = [...prev, newSale];
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
      return updated;
    });
    
    if (firebase.connected && firebase.db) {
      try {
        const { addDoc, collection, serverTimestamp } = window.firebaseExports;
        
        const saleData = {
          turma: className,
          numero: number,
          nome: buyerInfo.nome || 'Admin',
          telefone: buyerInfo.telefone || '',
          status: 'pago',
          timestamp: serverTimestamp(),
          source: 'admin',
          deviceId: 'admin',
          lastSync: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(firebase.db, 'sales'), saleData);
        
        setSoldNumbers(prev => {
          const updated = prev.map(item => 
            item.id === id ? { ...item, firebaseId: docRef.id, synced: true } : item
          );
          localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
          return updated;
        });
        
        toast.success(`✅ Venda admin registrada`);
        
        // Disparar evento para dashboard
        window.dispatchEvent(new CustomEvent('new_sale_added', {
          detail: { turma: className, numero: number, status: 'pago' }
        }));
      } catch (error) {
        console.error('Erro ao enviar para Firebase:', error);
      }
    }
    
    return newSale;
  }, [firebase.connected, firebase.db]);

  // ========== SINCRONIZAÇÃO ==========

  const syncAllLocalSales = useCallback(async () => {
    const unsyncedSales = soldNumbers.filter(sale => 
      !sale.synced && 
      !sale.fromSheet
    );
    
    if (unsyncedSales.length === 0 || !firebase.connected) {
      console.log('✅ Nada para sincronizar');
      return;
    }
    
    setIsSyncing(true);
    console.log(`🔄 Sincronizando ${unsyncedSales.length} vendas (todos status)...`);
    
    for (const sale of unsyncedSales) {
      try {
        const { addDoc, collection, serverTimestamp } = window.firebaseExports;
        
        const saleData = {
          turma: sale.turma,
          numero: sale.numero,
          nome: sale.nome || '',
          telefone: sale.telefone || '',
          status: sale.status || 'pago',
          timestamp: serverTimestamp(),
          source: sale.source || 'online',
          deviceId: sale.deviceId || localStorage.getItem('deviceId') || 'unknown',
          lastSync: serverTimestamp(),
          paymentMethod: sale.paymentMethod || (sale.status === 'pendente' ? 'dinheiro' : 'pix')
        };
        
        const docRef = await addDoc(collection(firebase.db, 'sales'), saleData);
        
        setSoldNumbers(prev => {
          const updated = prev.map(item => 
            item.id === sale.id ? { ...item, firebaseId: docRef.id, synced: true } : item
          );
          localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
          return updated;
        });
        
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('❌ Erro ao sincronizar venda:', error);
      }
    }
    
    setIsSyncing(false);
    toast.success(`✅ ${unsyncedSales.length} vendas sincronizadas`);
  }, [soldNumbers, firebase.connected, firebase.db]);

  // ========== LIMPEZA DE RESERVAS EXPIRADAS ==========

  useEffect(() => {
    const cleanupExpiredReservations = () => {
      const now = Date.now();
      setPendingReservations(prev => {
        const updated = prev.map(item => ({
          ...item,
          expired: item.expiresAt && item.expiresAt < now
        })).filter(item => !item.expired);
        
        localStorage.setItem('terceirao-pending-reservations', JSON.stringify(updated));
        return updated;
      });
    };
    
    cleanupExpiredReservations();
    const interval = setInterval(cleanupExpiredReservations, 60000);
    
    return () => clearInterval(interval);
  }, [pendingReservations, soldNumbers]); // Adicionadas as dependências

  // ========== FUNÇÃO GETSTATS CORRIGIDA ==========

  const getStats = useCallback(() => {
    const totalSold = soldNumbers.filter(n => n.status === 'pago').length;
    const totalPending = soldNumbers.filter(n => n.status === 'pendente').length;
    const totalReserved = pendingReservations.filter(n => !n.expired && n.status === 'reservado').length;
    const totalAll = totalSold + totalPending + totalReserved;
    
    const turma3A = soldNumbers.filter(n => n.turma === '3° A' && n.status === 'pago').length;
    const turma3B = soldNumbers.filter(n => n.turma === '3° B' && n.status === 'pago').length;
    const turma3TECH = soldNumbers.filter(n => n.turma === '3° TECH' && n.status === 'pago').length;
    
    const pending3A = soldNumbers.filter(n => n.turma === '3° A' && n.status === 'pendente').length;
    const pending3B = soldNumbers.filter(n => n.turma === '3° B' && n.status === 'pendente').length;
    const pending3TECH = soldNumbers.filter(n => n.turma === '3° TECH' && n.status === 'pendente').length;
    
    // Arrecadação: considerando rifas vendidas (R$15 cada) + pendentes (mas não contabilizadas ainda)
    const arrecadado = totalSold * 15;
    
    return {
      // Para dashboard principal (mostrar total vendido)
      total: totalSold,  // Apenas os PAGOS aparecem como "vendidos"
      arrecadado,
      
      // Para estatísticas detalhadas
      totalSold,
      totalPending,
      totalReserved,
      totalAll,
      
      // Por turma (vendidas)
      turma3A,
      turma3B,
      turma3TECH,
      
      // Por turma (pendentes)
      turma3A_pending: pending3A,
      turma3B_pending: pending3B,
      turma3TECH_pending: pending3TECH,
      
      // Estatísticas gerais
      pagos: totalSold,
      reservados: totalReserved,
      pendentes: totalPending,
      sincronizados: soldNumbers.filter(n => n.synced).length,
      pendingReservations: pendingReservations.filter(n => !n.expired).length,
      firebaseConnected: firebase.connected,
      
      // Para compatibilidade (dashboard antigo)
      "3° A": turma3A,
      "3° B": turma3B,
      "3° TECH": turma3TECH,
      "3° A_pending": pending3A,
      "3° B_pending": pending3B,
      "3° TECH_pending": pending3TECH
    };
  }, [soldNumbers, pendingReservations, firebase.connected]);

  // ========== FUNÇÃO PARA OBTER VENDAS RECENTES ==========

  const getRecentSales = useCallback((limit = 10) => {
    return [...soldNumbers]
      .sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, limit)
      .map(sale => ({
        id: sale.id || `${sale.turma}-${sale.numero}`,
        turma: sale.turma,
        numero: sale.numero,
        nome: sale.nome || 'Não informado',
        telefone: sale.telefone || '',
        status: sale.status || 'pago',
        timestamp: sale.timestamp || new Date().toISOString(),
        paymentMethod: sale.paymentMethod || (sale.status === 'pendente' ? 'dinheiro' : 'pix'),
        orderId: sale.orderId,
        source: sale.source || 'online'
      }));
  }, [soldNumbers]);

  // ========== INICIALIZAÇÃO ==========

  useEffect(() => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    
    const syncInterval = setInterval(() => {
      if (firebase.connected) {
        syncAllLocalSales();
      }
    }, 60000);
    
    return () => clearInterval(syncInterval);
  }, [firebase.connected, syncAllLocalSales]);

  // ========== PROVIDER ==========

  return (
    <RaffleManagerContext.Provider value={{
      // Estado
      soldNumbers,
      pendingReservations,
      isAdmin,
      isSyncing,
      lastSync,
      firebaseConnected: firebase.connected,
      
      // Login/Logout Admin
      loginAdmin,
      logoutAdmin,
      
      // Verificações
      isNumberSold,
      isNumberReserved,
      isNumberPending, // NOVO: verificar pendentes
      getAvailableNumbers,
      findSale,
      
      // Operações de Reserva LOCAL
      reserveNumber,
      cancelReservation,
      
      // Marcar como reservado (dinheiro)
      markNumbersAsReserved,
      
      // Forçar atualização
      refreshData,
      
      // NOVAS FUNÇÕES: Atualizar status
      updateSaleStatus,
      bulkMarkAsPaid,
      
      // Confirmação para Firebase
      confirmReservation,
      confirmCashReservation,
      
      // Envio direto para Firebase
      confirmPaymentAndSendToFirebase,
      createCashReservationInFirebase,
      
      // Funções Admin
      markNumberAsSold,
      
      // Sincronização
      syncAllLocalSales,
      
      // Estatísticas
      getStats,
      
      // NOVO: Obter vendas recentes
      getRecentSales
    }}>
      {children}
    </RaffleManagerContext.Provider>
  );
};

export const useRaffleManager = () => {
  const context = useContext(RaffleManagerContext);
  if (!context) {
    throw new Error('useRaffleManager deve ser usado dentro de um RaffleManagerProvider');
  }
  return context;
};