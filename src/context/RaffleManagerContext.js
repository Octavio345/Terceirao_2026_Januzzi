import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  addDoc, 
  updateDoc,
  doc,
  getDocs,
  where
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const RaffleManagerContext = createContext();

export const RaffleManagerProvider = ({ children }) => {
  // ========== ESTADOS PRINCIPAIS ==========
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [db, setDb] = useState(null);
  const [soldNumbers, setSoldNumbers] = useState(() => {
    try {
      const saved = localStorage.getItem('terceirao-sold-numbers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('terceirao-admin') === 'true';
    } catch {
      return false;
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem('terceirao-last-sync') || null;
  });
  const [firebaseError, setFirebaseError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ========== VERIFICAÇÃO DE CONEXÃO ==========
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ========== INICIALIZAÇÃO ROBUSTA DO FIREBASE ==========
  useEffect(() => {
    let unsubscribe = null;
    
    const initializeFirebase = async () => {
      try {
        console.log('🔥 INICIANDO FIREBASE EM PRODUÇÃO');
        
        // Configuração do Firebase
        const firebaseConfig = {
          apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
          authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
          storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.REACT_APP_FIREBASE_APP_ID,
          measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
        };

        // VERIFICAÇÃO RIGOROSA DAS VARIÁVEIS
        console.log('🔍 Verificando configuração Firebase:');
        console.log('- API Key:', firebaseConfig.apiKey ? '✅ Presente' : '❌ FALTANDO');
        console.log('- Project ID:', firebaseConfig.projectId);
        console.log('- App ID:', firebaseConfig.appId ? '✅ Presente' : '❌ FALTANDO');
        
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          const errorMsg = 'Firebase não configurado. Configure as variáveis na Vercel.';
          console.error('❌', errorMsg);
          setFirebaseError(errorMsg);
          toast.error('❌ Sistema offline. Contate o administrador.');
          return;
        }

        // Inicializar Firebase
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        
        setFirebaseApp(app);
        setDb(firestoreDb);
        
        console.log('✅ Firebase inicializado! Projeto:', firebaseConfig.projectId);
        
        // Configurar listener em tempo real
        unsubscribe = setupRealtimeListener(firestoreDb);
        
        // Carregar dados iniciais
        await loadInitialData(firestoreDb);
        
        setFirebaseError(null);
        toast.success('✅ Conectado ao servidor!');
        
      } catch (error) {
        console.error('❌ ERRO CRÍTICO NO FIREBASE:', error);
        setFirebaseError(error.message);
        toast.error('❌ Erro ao conectar com servidor');
      }
    };

    initializeFirebase();

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // ========== LISTENER EM TEMPO REAL ==========
  const setupRealtimeListener = (firestoreDb) => {
    try {
      console.log('📡 Configurando listener em tempo real...');
      
      const salesRef = collection(firestoreDb, 'sales');
      const q = query(salesRef, orderBy('timestamp', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const firebaseSales = [];
          
          snapshot.forEach((doc) => {
            try {
              const data = doc.data();
              const saleData = {
                id: doc.id,
                firebaseId: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate ? 
                          data.timestamp.toDate().toISOString() : 
                          data.timestamp || new Date().toISOString(),
                synced: true,
                fromFirebase: true
              };
              firebaseSales.push(saleData);
            } catch (docError) {
              console.error('❌ Erro ao processar documento:', docError);
            }
          });
          
          console.log(`📥 Recebido do Firebase: ${firebaseSales.length} vendas`);
          
          // Atualizar estado com dados do Firebase
          setSoldNumbers(prev => {
            // Manter vendas locais não sincronizadas
            const localUnsaved = prev.filter(sale => !sale.synced);
            
            // Combinar com dados do Firebase
            const combined = [...localUnsaved, ...firebaseSales];
            
            // Remover duplicatas
            const uniqueMap = new Map();
            combined.forEach(sale => {
              const key = `${sale.turma}-${sale.numero}`;
              const existing = uniqueMap.get(key);
              
              // Preferir vendas sincronizadas e mais recentes
              if (!existing || 
                  (sale.synced && !existing.synced) ||
                  new Date(sale.timestamp) > new Date(existing.timestamp)) {
                uniqueMap.set(key, sale);
              }
            });
            
            const uniqueSales = Array.from(uniqueMap.values());
            
            // Salvar no localStorage
            localStorage.setItem('terceirao-sold-numbers', JSON.stringify(uniqueSales));
            
            return uniqueSales;
          });
          
          // Atualizar timestamp da última sincronização
          const syncTime = new Date().toISOString();
          setLastSync(syncTime);
          localStorage.setItem('terceirao-last-sync', syncTime);
          
          // Disparar evento para atualização
          window.dispatchEvent(new CustomEvent('firebase_data_updated', {
            detail: { count: firebaseSales.length }
          }));
          
        },
        (error) => {
          console.error('❌ Erro no listener Firebase:', error.code, error.message);
          
          if (error.code === 'permission-denied') {
            toast.error('❌ Sem permissão para acessar o servidor');
          } else if (error.code === 'failed-precondition') {
            toast.error('❌ Servidor temporariamente indisponível');
          } else {
            toast.error('❌ Erro de conexão com servidor');
          }
        }
      );
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erro ao configurar listener:', error);
      return () => {};
    }
  };

  // ========== CARREGAR DADOS INICIAIS ==========
  const loadInitialData = async (firestoreDb) => {
    try {
      console.log('🔄 Carregando dados iniciais...');
      setIsSyncing(true);
      
      const salesRef = collection(firestoreDb, 'sales');
      const snapshot = await getDocs(salesRef);
      
      const sales = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        sales.push({
          id: doc.id,
          firebaseId: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? 
                    data.timestamp.toDate().toISOString() : 
                    data.timestamp,
          synced: true
        });
      });
      
      console.log(`📊 ${sales.length} vendas carregadas inicialmente`);
      
      setSoldNumbers(sales);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(sales));
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // ========== FUNÇÃO PRINCIPAL: ENVIAR VENDA ==========
  const sendToFirebase = useCallback(async (saleData) => {
    if (!db) {
      console.error('❌ Firebase não disponível');
      
      // Salvar localmente como fallback
      const localSale = {
        ...saleData,
        id: `local-${Date.now()}`,
        synced: false,
        timestamp: new Date().toISOString(),
        source: saleData.source || 'local_offline'
      };
      
      setSoldNumbers(prev => [...prev, localSale]);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify([...soldNumbers, localSale]));
      
      toast.warning('⚠️ Modo offline. Venda salva localmente.');
      
      return {
        success: false,
        error: 'Firebase não disponível',
        data: localSale
      };
    }

    try {
      console.log('📤 Enviando venda para Firebase:', saleData);
      
      // Verificar duplicidade localmente primeiro
      const isAlreadySold = soldNumbers.some(s => 
        s.turma === saleData.turma && 
        s.numero === saleData.numero && 
        s.status === 'pago' &&
        s.synced
      );
      
      if (isAlreadySold) {
        toast.error('❌ Este número já foi vendido!');
        return {
          success: false,
          error: 'Número já vendido',
          data: null
        };
      }
      
      // Preparar dados para Firebase
      const firebaseData = {
        turma: saleData.turma,
        numero: saleData.numero,
        nome: saleData.nome || 'Comprador',
        telefone: saleData.telefone || '',
        status: saleData.status || 'pendente',
        paymentMethod: saleData.paymentMethod || 'pix',
        orderId: saleData.orderId || null,
        source: saleData.source || 'online',
        price: saleData.price || 15.00,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        deviceId: localStorage.getItem('deviceId') || 'web'
      };
      
      // Campos opcionais
      if (saleData.expiresAt) firebaseData.expiresAt = saleData.expiresAt;
      if (saleData.confirmedAt) firebaseData.confirmedAt = saleData.confirmedAt;
      
      console.log('📦 Dados para Firebase:', firebaseData);
      
      const docRef = await addDoc(collection(db, 'sales'), firebaseData);
      const firebaseId = docRef.id;
      
      console.log('✅ Venda enviada! ID:', firebaseId);
      
      // Atualizar estado local
      const syncedSale = {
        ...saleData,
        id: firebaseId,
        firebaseId,
        synced: true,
        timestamp: new Date().toISOString()
      };
      
      setSoldNumbers(prev => [...prev, syncedSale]);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify([...soldNumbers, syncedSale]));
      
      // Disparar evento
      window.dispatchEvent(new CustomEvent('new_sale_added', {
        detail: syncedSale
      }));
      
      toast.success('✅ Venda registrada no sistema!');
      
      return {
        success: true,
        firebaseId,
        data: syncedSale
      };
      
    } catch (error) {
      console.error('❌ Erro ao enviar para Firebase:', error.code, error.message);
      
      // Salvar localmente em caso de erro
      const localSale = {
        ...saleData,
        id: `local-error-${Date.now()}`,
        synced: false,
        syncError: error.message,
        timestamp: new Date().toISOString()
      };
      
      setSoldNumbers(prev => [...prev, localSale]);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify([...soldNumbers, localSale]));
      
      toast.error('❌ Erro ao salvar no servidor. Venda salva localmente.');
      
      return {
        success: false,
        error: error.message,
        data: localSale
      };
    }
  }, [db, soldNumbers]);

  // ========== FUNÇÕES ESPECÍFICAS ==========
  const confirmPaymentAndSendToFirebase = useCallback(async (raffleData, paymentInfo = {}) => {
    console.log('🚀 Confirmando pagamento PIX...');
    
    const saleData = {
      turma: raffleData.turma,
      numero: raffleData.numero,
      nome: raffleData.nome || paymentInfo.nome || 'Comprador Online',
      telefone: raffleData.telefone || paymentInfo.telefone || '',
      status: 'pago',
      paymentMethod: 'pix',
      orderId: paymentInfo.orderId,
      source: 'online',
      price: 15.00,
      confirmedAt: new Date().toISOString()
    };
    
    const result = await sendToFirebase(saleData);
    
    if (result.success) {
      toast.success(`✅ Rifa PIX CONFIRMADA: ${raffleData.turma} Nº ${raffleData.numero}`);
      return result.data;
    }
    
    return null;
  }, [sendToFirebase]);

  const createCashReservationInFirebase = useCallback(async (raffleData, paymentInfo = {}) => {
    console.log('💰 Criando reserva para dinheiro...');
    
    const saleData = {
      turma: raffleData.turma,
      numero: raffleData.numero,
      nome: raffleData.nome || paymentInfo.nome || 'Comprador Online',
      telefone: raffleData.telefone || paymentInfo.telefone || '',
      status: 'pendente',
      paymentMethod: 'dinheiro',
      orderId: paymentInfo.orderId,
      source: 'online',
      price: 15.00,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const result = await sendToFirebase(saleData);
    
    if (result.success) {
      toast.success(`✅ Reserva DINHEIRO: ${raffleData.turma} Nº ${raffleData.numero}`);
      return result.data;
    }
    
    return null;
  }, [sendToFirebase]);

  // ========== FUNÇÕES DE VERIFICAÇÃO ==========
  const isNumberSold = useCallback((turma, numero) => {
    const isSold = soldNumbers.some(sale => 
      sale.turma === turma && 
      sale.numero === numero && 
      sale.status === 'pago'
    );
    
    console.log(`🔍 ${turma} Nº ${numero}:`, isSold ? 'VENDIDO' : 'DISPONÍVEL');
    return isSold;
  }, [soldNumbers]);

  const isNumberReserved = useCallback((turma, numero) => {
    return soldNumbers.some(sale => 
      sale.turma === turma && 
      sale.numero === numero && 
      (sale.status === 'pendente' || sale.status === 'reservado')
    );
  }, [soldNumbers]);

  const getAvailableNumbers = useCallback((turma) => {
    const usedNumbers = soldNumbers
      .filter(sale => sale.turma === turma)
      .map(sale => sale.numero);
    
    const available = Array.from({ length: 300 }, (_, i) => i + 1)
      .filter(num => !usedNumbers.includes(num));
    
    console.log(`📊 ${turma}: ${available.length} números disponíveis`);
    return available;
  }, [soldNumbers]);

  const markNumbersAsReserved = useCallback((turma, numero, nome, orderId) => {
    console.log('📝 Marcando como reservado...', { turma, numero, nome });
    
    const localReservation = {
      id: `local-${Date.now()}`,
      turma,
      numero,
      nome: nome || 'Cliente',
      status: 'pendente',
      paymentMethod: 'dinheiro',
      orderId,
      source: 'local',
      synced: false,
      timestamp: new Date().toISOString()
    };
    
    setSoldNumbers(prev => [...prev, localReservation]);
    
    return true;
  }, []);

  // ========== ATUALIZAR STATUS ==========
  const updateSaleStatus = useCallback(async (saleId, newStatus, paymentMethod = null) => {
    const sale = soldNumbers.find(s => s.id === saleId || s.firebaseId === saleId);
    
    if (!sale) {
      toast.error('Venda não encontrada');
      return false;
    }
    
    if (!db) {
      toast.error('Servidor não disponível');
      return false;
    }
    
    try {
      const updatedData = {
        status: newStatus,
        paymentMethod: paymentMethod || sale.paymentMethod,
        updatedAt: serverTimestamp()
      };
      
      if (sale.firebaseId) {
        await updateDoc(doc(db, 'sales', sale.firebaseId), updatedData);
        console.log(`✅ Status atualizado: ${sale.turma} Nº ${sale.numero} -> ${newStatus}`);
        toast.success('✅ Status atualizado no servidor!');
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast.error('❌ Erro ao atualizar status');
    }
    
    return false;
  }, [db, soldNumbers]);

  // ========== ADMIN FUNCTIONS ==========
  const loginAdmin = useCallback((password) => {
    try {
      const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
      
      if (!adminPassword) {
        console.error('REACT_APP_ADMIN_PASSWORD não configurada');
        toast.error('Erro de configuração do sistema');
        return false;
      }
      
      if (password.trim() === adminPassword.trim()) {
        localStorage.setItem('terceirao-admin', 'true');
        setIsAdmin(true);
        toast.success('✅ Login realizado!');
        return true;
      }
      
      toast.error('❌ Senha incorreta');
      return false;
      
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro interno');
      return false;
    }
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('terceirao-admin');
    setIsAdmin(false);
    toast.success('✅ Logout realizado');
  }, []);

  // ========== REFRESH DATA ==========
  const refreshData = useCallback(() => {
    console.log('🔄 Forçando atualização...');
    
    if (db) {
      loadInitialData(db);
    }
    
    toast.success('Dados atualizados');
    
    window.dispatchEvent(new CustomEvent('data_refreshed'));
  }, [db]);

  // ========== SINCRONIZAR VENDAS LOCAIS ==========
  const syncAllLocalSales = useCallback(async () => {
    if (!db) {
      toast.error('Servidor não disponível');
      return;
    }
    
    const unsynced = soldNumbers.filter(s => !s.synced);
    
    if (unsynced.length === 0) {
      console.log('✅ Nada para sincronizar');
      return;
    }
    
    console.log(`🔄 Sincronizando ${unsynced.length} vendas locais...`);
    setIsSyncing(true);
    
    let successCount = 0;
    
    for (const sale of unsynced) {
      try {
        const result = await sendToFirebase(sale);
        if (result.success) {
          successCount++;
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar:', error);
      }
    }
    
    setIsSyncing(false);
    
    if (successCount > 0) {
      toast.success(`✅ ${successCount} vendas sincronizadas`);
    }
  }, [db, soldNumbers, sendToFirebase]);

  // ========== ESTATÍSTICAS ==========
  const getStats = useCallback(() => {
    const totalSold = soldNumbers.filter(n => n.status === 'pago').length;
    const totalPending = soldNumbers.filter(n => n.status === 'pendente').length;
    const arrecadado = totalSold * 15;
    
    const turma3A = soldNumbers.filter(n => n.turma === '3° A' && n.status === 'pago').length;
    const turma3B = soldNumbers.filter(n => n.turma === '3° B' && n.status === 'pago').length;
    const turma3TECH = soldNumbers.filter(n => n.turma === '3° TECH' && n.status === 'pago').length;
    
    const pending3A = soldNumbers.filter(n => n.turma === '3° A' && n.status === 'pendente').length;
    const pending3B = soldNumbers.filter(n => n.turma === '3° B' && n.status === 'pendente').length;
    const pending3TECH = soldNumbers.filter(n => n.turma === '3° TECH' && n.status === 'pendente').length;
    
    return {
      total: totalSold,
      arrecadado,
      totalSold,
      totalPending,
      turma3A,
      turma3B,
      turma3TECH,
      turma3A_pending: pending3A,
      turma3B_pending: pending3B,
      turma3TECH_pending: pending3TECH,
      pagos: totalSold,
      pendentes: totalPending,
      sincronizados: soldNumbers.filter(n => n.synced).length,
      firebaseConnected: !!db,
      isOnline,
      lastSync
    };
  }, [soldNumbers, db, isOnline, lastSync]);

  // ========== GET RECENT SALES ==========
  const getRecentSales = useCallback((limit = 10) => {
    return soldNumbers
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)
      .map(sale => ({
        id: sale.id,
        turma: sale.turma,
        numero: sale.numero,
        nome: sale.nome || 'Não informado',
        telefone: sale.telefone || '',
        status: sale.status || 'pago',
        timestamp: sale.timestamp,
        paymentMethod: sale.paymentMethod || (sale.status === 'pendente' ? 'dinheiro' : 'pix'),
        orderId: sale.orderId,
        synced: sale.synced || false
      }));
  }, [soldNumbers]);

  // ========== SINCRONIZAÇÃO PERIÓDICA ==========
  useEffect(() => {
    let interval;
    
    if (db && isOnline) {
      // Sincronizar a cada 60 segundos
      interval = setInterval(() => {
        syncAllLocalSales();
      }, 60000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [db, isOnline, syncAllLocalSales]);

  // ========== VERIFICAR ADMIN AO INICIAR ==========
  useEffect(() => {
    const adminStatus = localStorage.getItem('terceirao-admin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  // ========== PROVIDER ==========
  return (
    <RaffleManagerContext.Provider value={{
      // Estado
      soldNumbers,
      isAdmin,
      isSyncing,
      lastSync,
      firebaseConnected: !!db,
      firebaseError,
      isOnline,
      
      // Login/Logout
      loginAdmin,
      logoutAdmin,
      
      // Verificações
      isNumberSold,
      isNumberReserved,
      getAvailableNumbers,
      
      // Operações
      markNumbersAsReserved,
      refreshData,
      updateSaleStatus,
      
      // Envio para Firebase
      confirmPaymentAndSendToFirebase,
      createCashReservationInFirebase,
      sendToFirebase,
      
      // Sincronização
      syncAllLocalSales,
      
      // Estatísticas
      getStats,
      
      // Vendas recentes
      getRecentSales
    }}>
      {children}
      
      {/* Elemento oculto para debug */}
      <div 
        style={{ display: 'none' }}
        data-firebase-status={db ? 'connected' : 'disconnected'}
        data-firebase-error={firebaseError || 'none'}
        data-sold-count={soldNumbers.length}
        data-synced-count={soldNumbers.filter(s => s.synced).length}
      />
    </RaffleManagerContext.Provider>
  );
};

export const useRaffleManager = () => {
  const context = useContext(RaffleManagerContext);
  if (!context) {
    throw new Error('useRaffleManager deve ser usado dentro de RaffleManagerProvider');
  }
  return context;
};