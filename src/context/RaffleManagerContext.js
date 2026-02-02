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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem('terceirao-last-sync') || null;
  });
  const [firebaseError, setFirebaseError] = useState(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  // ========== MONITORAR CONEXÃO ==========
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexão restaurada');
      setIsOnline(true);
      console.log('✅ Conexão restaurada');
    };
    
    const handleOffline = () => {
      console.log('⚠️ Sem conexão');
      setIsOnline(false);
      toast.warning('⚠️ Modo offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ========== FUNÇÃO AUXILIAR PARA NORMALIZAR TURMA ==========
  const normalizeTurma = useCallback((turma) => {
    if (!turma) return '3° A';
    
    const turmaStr = turma.toString().trim();
    
    // Mapear diferentes formatos para o formato padrão do Firebase
    const mapping = {
      '3A': '3° A',
      '3B': '3° B', 
      '3TECH': '3° TECH',
      '3 A': '3° A',
      '3 B': '3° B',
      '3 TECH': '3° TECH',
      '3°A': '3° A',
      '3°B': '3° B',
      '3°TECH': '3° TECH',
      '3A ': '3° A',
      '3B ': '3° B',
      '3TECH ': '3° TECH',
    };
    
    // Se já estiver no formato correto, retorna como está
    if (['3° A', '3° B', '3° TECH'].includes(turmaStr)) {
      return turmaStr;
    }
    
    // Tenta mapear ou retorna o padrão
    return mapping[turmaStr] || '3° A';
  }, []);

  // ========== CARREGAR DADOS INICIAIS ==========
  const loadInitialData = useCallback(async (firestoreDb) => {
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
  }, []);

  // ========== INICIALIZAÇÃO DO FIREBASE ==========
  useEffect(() => {
    let unsubscribe = null;
    
    const initializeFirebase = async () => {
      try {
        console.log('🔥 INICIANDO FIREBASE EM PRODUÇÃO');
        
        const firebaseConfig = {
          apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
          authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
          storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.REACT_APP_FIREBASE_APP_ID,
          measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
        };

        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          const errorMsg = 'Firebase não configurado. Configure as variáveis na Vercel.';
          console.error('❌', errorMsg);
          setFirebaseError(errorMsg);
          toast.error('❌ Sistema offline. Contate o administrador.');
          return;
        }

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        
        setDb(firestoreDb);
        setFirebaseInitialized(true);
        
        console.log('✅ Firebase inicializado! Projeto:', firebaseConfig.projectId);
        
        unsubscribe = setupRealtimeListener(firestoreDb);
        await loadInitialData(firestoreDb);
        
        setFirebaseError(null);
        
      } catch (error) {
        console.error('❌ ERRO CRÍTICO NO FIREBASE:', error);
        setFirebaseError(error.message);
        toast.error('❌ Erro ao conectar com servidor');
      }
    };

    initializeFirebase();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadInitialData]);

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
          
          setSoldNumbers(prev => {
            const localUnsaved = prev.filter(sale => !sale.synced);
            const combined = [...localUnsaved, ...firebaseSales];
            
            const uniqueMap = new Map();
            combined.forEach(sale => {
              const key = `${sale.turma}-${sale.numero}`;
              const existing = uniqueMap.get(key);
              
              if (!existing || 
                  (sale.synced && !existing.synced) ||
                  new Date(sale.timestamp) > new Date(existing.timestamp)) {
                uniqueMap.set(key, sale);
              }
            });
            
            const uniqueSales = Array.from(uniqueMap.values());
            localStorage.setItem('terceirao-sold-numbers', JSON.stringify(uniqueSales));
            
            return uniqueSales;
          });
          
          const syncTime = new Date().toISOString();
          setLastSync(syncTime);
          localStorage.setItem('terceirao-last-sync', syncTime);
          
          window.dispatchEvent(new CustomEvent('firebase_data_updated'));
          
        },
        (error) => {
          console.error('❌ Erro no listener Firebase:', error.code, error.message);
          
          const errorMessages = {
            'permission-denied': '❌ Sem permissão para acessar o servidor',
            'failed-precondition': '❌ Servidor temporariamente indisponível',
            'unavailable': '❌ Servidor offline',
            'resource-exhausted': '❌ Limite de conexões excedido'
          };
          
          toast.error(errorMessages[error.code] || '❌ Erro de conexão com servidor');
        }
      );
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erro ao configurar listener:', error);
      return () => {};
    }
  };

  // ========== VERIFICAÇÃO EM TEMPO REAL ==========
  const checkNumberInRealTime = useCallback(async (turma, numero) => {
    if (!db) {
      console.error('❌ Firebase não disponível');
      return { sold: false, reserved: false, available: true, error: 'Firebase não disponível' };
    }

    try {
      console.log(`🔍 Verificando em tempo real: ${turma} Nº ${numero}`);
      
      const salesRef = collection(db, 'sales');
      const q = query(
        salesRef, 
        where('turma', '==', turma),
        where('numero', '==', parseInt(numero))
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const status = docData.status || 'pendente';
        const isSold = status === 'pago';
        const isReserved = status === 'pendente' || status === 'reservado';
        
        console.log(`📊 Status em tempo real: ${turma} Nº ${numero} -> ${status}`);
        
        return {
          sold: isSold,
          reserved: isReserved,
          available: !isSold,
          status: status,
          data: docData,
          timestamp: new Date().toISOString()
        };
      }
      
      console.log(`✅ Disponível em tempo real: ${turma} Nº ${numero}`);
      return { sold: false, reserved: false, available: true };
      
    } catch (error) {
      console.error('❌ Erro na verificação em tempo real:', error);
      return { sold: false, reserved: false, available: true, error: error.message };
    }
  }, [db]);

  // ========== REFRESH DATA (CORRIGIDO - SEM LOOP) ==========
  const refreshData = useCallback(async () => {
    console.log('🔄 Forçando atualização de dados...');
    
    if (!db) {
      console.error('❌ Firebase não disponível para refresh');
      toast.error('Servidor não disponível');
      return;
    }

    try {
      await loadInitialData(db);
      toast.success('Dados atualizados!');
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados');
    }
  }, [db, loadInitialData]);

  // ========== ENVIAR VENDA PARA FIREBASE (CORRIGIDO) ==========
  const sendToFirebase = useCallback(async (saleData) => {
    console.log('🚀 ENVIANDO PARA FIREBASE:', saleData);
    
    if (!db) {
      console.error('❌ Firebase não disponível');
      
      const localSale = {
        ...saleData,
        id: `local-${Date.now()}`,
        synced: false,
        timestamp: new Date().toISOString(),
        source: saleData.source || 'local_offline'
      };
      
      const newSoldNumbers = [...soldNumbers, localSale];
      setSoldNumbers(newSoldNumbers);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(newSoldNumbers));
      
      toast.warning('⚠️ Modo offline. Venda salva localmente.');
      
      return {
        success: false,
        error: 'Firebase não disponível',
        data: localSale
      };
    }

    try {
      // Validações
      const validTurmas = ['3° A', '3° B', '3° TECH'];
      
      // NORMALIZAR a turma antes de validar
      const normalizedTurma = normalizeTurma(saleData.turma);
      console.log(`📝 Turma normalizada: "${saleData.turma}" -> "${normalizedTurma}"`);
      
      if (!normalizedTurma || !validTurmas.includes(normalizedTurma)) {
        throw new Error(`Turma inválida: "${saleData.turma}" -> "${normalizedTurma}". Válidas: ${validTurmas.join(', ')}`);
      }
      
      const numero = parseInt(saleData.numero);
      if (isNaN(numero) || numero < 1 || numero > 300) {
        throw new Error(`Número inválido: "${saleData.numero}"`);
      }
      
      const validStatus = ['pago', 'pendente', 'reservado'];
      const status = saleData.status || 'pendente';
      if (!validStatus.includes(status)) {
        throw new Error(`Status inválido: "${status}"`);
      }
      
      const validMethods = ['pix', 'dinheiro'];
      const paymentMethod = saleData.paymentMethod || 'pix';
      if (!validMethods.includes(paymentMethod)) {
        throw new Error(`Método inválido: "${paymentMethod}"`);
      }
      
      // Verificação em tempo real ANTES de enviar
      console.log('⏱️ Verificando disponibilidade em tempo real...');
      const realTimeCheck = await checkNumberInRealTime(normalizedTurma, numero);
      
      if (realTimeCheck.sold) {
        throw new Error('Número já vendido (verificação em tempo real)');
      }
      
      if (realTimeCheck.reserved) {
        throw new Error('Número já reservado (verificação em tempo real)');
      }
      
      // Preparar dados para Firebase
      const firebaseData = {
        turma: normalizedTurma,
        numero: numero,
        nome: (saleData.nome || 'Comprador Online').toString().substring(0, 100),
        status: status,
        timestamp: serverTimestamp(),
        paymentMethod: paymentMethod,
        telefone: (saleData.telefone || '').toString().substring(0, 20),
        orderId: saleData.orderId || null,
        source: saleData.source || 'online',
        price: parseFloat(saleData.price || 15.00),
        createdAt: serverTimestamp(),
        deviceId: localStorage.getItem('deviceId') || 'web'
      };
      
      if (saleData.expiresAt) firebaseData.expiresAt = saleData.expiresAt;
      if (saleData.confirmedAt) firebaseData.confirmedAt = saleData.confirmedAt;
      
      console.log('📤 Enviando para coleção "sales"...');
      const docRef = await addDoc(collection(db, 'sales'), firebaseData);
      const firebaseId = docRef.id;
      
      console.log('✅ Venda enviada! ID:', firebaseId);
      
      const syncedSale = {
        ...saleData,
        id: firebaseId,
        firebaseId,
        turma: normalizedTurma,
        synced: true,
        timestamp: new Date().toISOString(),
        status: status,
        paymentMethod: paymentMethod,
        numero: numero
      };
      
      const newSoldNumbers = [...soldNumbers, syncedSale];
      setSoldNumbers(newSoldNumbers);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(newSoldNumbers));
      
      window.dispatchEvent(new CustomEvent('new_sale_added', {
        detail: syncedSale
      }));
      
      window.dispatchEvent(new CustomEvent('firebase_new_sale', {
        detail: {
          turma: normalizedTurma,
          numero: numero,
          status: status,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('✅ Venda registrada no sistema!');
      
      return {
        success: true,
        firebaseId,
        data: syncedSale
      };
      
    } catch (error) {
      console.error('❌ ERRO AO ENVIAR PARA FIREBASE:', error);
      
      // Salvar localmente
      const localSale = {
        ...saleData,
        turma: normalizeTurma(saleData.turma),
        id: `local-error-${Date.now()}`,
        synced: false,
        syncError: error.message,
        timestamp: new Date().toISOString(),
        status: saleData.status || 'pendente'
      };
      
      const newSoldNumbers = [...soldNumbers, localSale];
      setSoldNumbers(newSoldNumbers);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(newSoldNumbers));
      
      toast.error('❌ Erro ao salvar no servidor. Venda salva localmente.');
      
      return {
        success: false,
        error: error.message,
        data: localSale
      };
    }
  }, [db, soldNumbers, checkNumberInRealTime, normalizeTurma]);

  // ========== ENVIO DE EMERGÊNCIA (CORRIGIDO) ==========
  const forceSendToFirebase = useCallback(async (saleData) => {
    console.log('🚀 FORÇANDO ENVIO PARA FIREBASE:', saleData);
    
    if (!db) {
      return { success: false, error: 'Firebase não disponível' };
    }

    try {
      const validTurmas = ['3° A', '3° B', '3° TECH'];
      
      // NORMALIZAR a turma antes de validar
      const normalizedTurma = normalizeTurma(saleData.turma);
      console.log(`📝 [FORCE] Turma normalizada: "${saleData.turma}" -> "${normalizedTurma}"`);
      
      if (!normalizedTurma || !validTurmas.includes(normalizedTurma)) {
        throw new Error(`Turma inválida: ${saleData.turma} -> ${normalizedTurma}`);
      }
      
      const numero = parseInt(saleData.numero);
      if (isNaN(numero) || numero < 1 || numero > 300) {
        throw new Error(`Número inválido: ${saleData.numero}`);
      }
      
      const realTimeCheck = await checkNumberInRealTime(normalizedTurma, numero);
      
      if (realTimeCheck.sold) {
        return {
          success: false,
          error: 'Número já vendido',
          alreadySold: true
        };
      }
      
      if (realTimeCheck.reserved) {
        return {
          success: false,
          error: 'Número já reservado',
          alreadyReserved: true
        };
      }
      
      const firebaseData = {
        turma: normalizedTurma,
        numero: numero,
        nome: (saleData.nome || 'Comprador').toString().substring(0, 100),
        telefone: (saleData.telefone || '').toString().substring(0, 20),
        status: saleData.status || 'pendente',
        paymentMethod: saleData.paymentMethod || 'pix',
        orderId: saleData.orderId || null,
        source: saleData.source || 'emergency',
        price: parseFloat(saleData.price || 15.00),
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        deviceId: localStorage.getItem('deviceId') || 'web_emergency'
      };
      
      console.log('📤 Enviando para Firebase...');
      const docRef = await addDoc(collection(db, 'sales'), firebaseData);
      const firebaseId = docRef.id;
      
      console.log('✅ ENVIADO! ID:', firebaseId);
      
      const newSale = {
        id: firebaseId,
        firebaseId: firebaseId,
        ...firebaseData,
        synced: true,
        timestamp: new Date().toISOString()
      };
      
      setSoldNumbers(prev => {
        const newArray = [...prev, newSale];
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(newArray));
        return newArray;
      });
      
      window.dispatchEvent(new CustomEvent('firebase_new_sale', {
        detail: newSale
      }));
      
      toast.success('✅ Rifa enviada com sucesso!');
      
      return {
        success: true,
        firebaseId: firebaseId,
        data: newSale
      };
      
    } catch (error) {
      console.error('❌ ERRO NO FORCE SEND:', error);
      toast.error('❌ Erro ao enviar via emergência');
      return {
        success: false,
        error: error.message
      };
    }
  }, [db, checkNumberInRealTime, normalizeTurma]);

  // ========== FUNÇÕES ESPECÍFICAS (CORRIGIDAS) ==========
  const confirmPaymentAndSendToFirebase = useCallback(async (raffleData, paymentInfo = {}) => {
    console.log('🚀 Confirmando pagamento PIX...');
    
    // Normalizar a turma antes de enviar
    const normalizedTurma = normalizeTurma(raffleData.turma);
    
    const saleData = {
      turma: normalizedTurma,
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
      toast.success(`✅ Rifa PIX CONFIRMADA: ${normalizedTurma} Nº ${raffleData.numero}`);
    }
    
    return result;
  }, [sendToFirebase, normalizeTurma]);

  const createCashReservationInFirebase = useCallback(async (raffleData, paymentInfo = {}) => {
    console.log('💰 Criando reserva para dinheiro...');
    
    // Normalizar a turma antes de enviar
    const normalizedTurma = normalizeTurma(raffleData.turma);
    
    const saleData = {
      turma: normalizedTurma,
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
      toast.success(`✅ Reserva DINHEIRO: ${normalizedTurma} Nº ${raffleData.numero}`);
    }
    
    return result;
  }, [sendToFirebase, normalizeTurma]);

  // ========== FUNÇÕES DE VERIFICAÇÃO ==========
  const isNumberSold = useCallback((turma, numero) => {
    const normalizedTurma = normalizeTurma(turma);
    return soldNumbers.some(sale => 
      normalizeTurma(sale.turma) === normalizedTurma && 
      sale.numero === parseInt(numero) && 
      sale.status === 'pago'
    );
  }, [soldNumbers, normalizeTurma]);

  const isNumberReserved = useCallback((turma, numero) => {
    const normalizedTurma = normalizeTurma(turma);
    return soldNumbers.some(sale => 
      normalizeTurma(sale.turma) === normalizedTurma && 
      sale.numero === parseInt(numero) && 
      (sale.status === 'pendente' || sale.status === 'reservado')
    );
  }, [soldNumbers, normalizeTurma]);

  const getAvailableNumbers = useCallback((turma) => {
    const normalizedTurma = normalizeTurma(turma);
    const usedNumbers = soldNumbers
      .filter(sale => normalizeTurma(sale.turma) === normalizedTurma)
      .map(sale => parseInt(sale.numero));
    
    const available = Array.from({ length: 300 }, (_, i) => i + 1)
      .filter(num => !usedNumbers.includes(num));
    
    return available;
  }, [soldNumbers, normalizeTurma]);

  // ========== ATUALIZAR STATUS ==========
  const updateSaleStatus = useCallback(async (saleId, newStatus, paymentMethod = null) => {
    const sale = soldNumbers.find(s => s.id === saleId || s.firebaseId === saleId);
    
    if (!sale) {
      console.error('❌ Venda não encontrada:', saleId);
      toast.error('Venda não encontrada');
      return false;
    }
    
    if (!db) {
      console.error('❌ Firebase não disponível');
      toast.error('Servidor não disponível');
      return false;
    }
    
    try {
      const updatedData = {
        status: newStatus,
        paymentMethod: paymentMethod || sale.paymentMethod,
        updatedAt: serverTimestamp()
      };
      
      console.log(`🔄 Atualizando status: ${sale.turma} Nº ${sale.numero} -> ${newStatus}`);
      
      if (sale.firebaseId) {
        await updateDoc(doc(db, 'sales', sale.firebaseId), updatedData);
        console.log(`✅ Status atualizado no Firebase: ${sale.firebaseId}`);
        toast.success('✅ Status atualizado!');
        
        const updatedSoldNumbers = soldNumbers.map(s => 
          s.firebaseId === sale.firebaseId 
            ? { ...s, status: newStatus, paymentMethod: paymentMethod || s.paymentMethod }
            : s
        );
        
        setSoldNumbers(updatedSoldNumbers);
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updatedSoldNumbers));
        
        window.dispatchEvent(new CustomEvent('sale_status_updated', {
          detail: {
            firebaseId: sale.firebaseId,
            status: newStatus,
            turma: sale.turma,
            numero: sale.numero
          }
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast.error('❌ Erro ao atualizar status');
      return false;
    }
  }, [db, soldNumbers]);

  // ========== ADMIN FUNCTIONS ==========
  const loginAdmin = useCallback((password) => {
    try {
      const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
      
      if (!adminPassword) {
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

  // ========== SINCRONIZAR VENDAS LOCAIS ==========
  const syncAllLocalSales = useCallback(async () => {
    if (!db) {
      toast.error('Servidor não disponível');
      return;
    }
    
    const unsynced = soldNumbers.filter(s => !s.synced);
    
    if (unsynced.length === 0) {
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
    
    const turma3A = soldNumbers.filter(n => normalizeTurma(n.turma) === '3° A' && n.status === 'pago').length;
    const turma3B = soldNumbers.filter(n => normalizeTurma(n.turma) === '3° B' && n.status === 'pago').length;
    const turma3TECH = soldNumbers.filter(n => normalizeTurma(n.turma) === '3° TECH' && n.status === 'pago').length;
    
    const pending3A = soldNumbers.filter(n => normalizeTurma(n.turma) === '3° A' && n.status === 'pendente').length;
    const pending3B = soldNumbers.filter(n => normalizeTurma(n.turma) === '3° B' && n.status === 'pendente').length;
    const pending3TECH = soldNumbers.filter(n => normalizeTurma(n.turma) === '3° TECH' && n.status === 'pendente').length;
    
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
      firebaseInitialized,
      isOnline,
      lastSync
    };
  }, [soldNumbers, db, firebaseInitialized, isOnline, lastSync, normalizeTurma]);

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

  // ========== DEBUG ==========
  const debugFirebaseConnection = useCallback(async () => {
    console.log('🔍 DEBUG Firebase Connection');
    console.log('- Firebase inicializado:', firebaseInitialized);
    console.log('- Firebase db:', db ? 'Disponível' : 'Indisponível');
    console.log('- Online:', isOnline);
    console.log('- Última sincronização:', lastSync);
    console.log('- Total vendas local:', soldNumbers.length);
    console.log('- Vendas sincronizadas:', soldNumbers.filter(s => s.synced).length);
    
    if (db) {
      try {
        const testTurma = '3° A';
        const testNumero = 1;
        
        console.log(`🧪 Testando verificação: ${testTurma} Nº ${testNumero}`);
        const realTimeCheck = await checkNumberInRealTime(testTurma, testNumero);
        console.log('📊 Resultado:', realTimeCheck);
        
        if (realTimeCheck.error) {
          toast.error(`❌ Verificação falhou: ${realTimeCheck.error}`);
        } else {
          toast.success(`✅ Verificação OK! Status: ${realTimeCheck.status || 'disponível'}`);
        }
        
      } catch (error) {
        console.error('❌ Erro no teste:', error);
        toast.error('❌ Erro no teste Firebase');
      }
    } else {
      toast.error('❌ Firebase não disponível para teste');
    }
  }, [db, firebaseInitialized, isOnline, lastSync, soldNumbers, checkNumberInRealTime]);

  // ========== EFFECTS ==========
  useEffect(() => {
    let interval;
    
    if (db && isOnline) {
      interval = setInterval(() => {
        syncAllLocalSales();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [db, isOnline, syncAllLocalSales]);

  useEffect(() => {
    const adminStatus = localStorage.getItem('terceirao-admin') === 'true';
    setIsAdmin(adminStatus);
    
    if (!localStorage.getItem('deviceId')) {
      const deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
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
      firebaseInitialized,
      firebaseError,
      isOnline,
      
      // Funções auxiliares
      normalizeTurma,
      
      // Login/Logout
      loginAdmin,
      logoutAdmin,
      
      // Verificações
      isNumberSold,
      isNumberReserved,
      getAvailableNumbers,
      checkNumberInRealTime,
      immediateCheckNumber: checkNumberInRealTime,
      
      // Operações
      refreshData,
      updateSaleStatus,
      
      // Envio para Firebase
      confirmPaymentAndSendToFirebase,
      createCashReservationInFirebase,
      sendToFirebase,
      forceSendToFirebase,
      
      // Sincronização
      syncAllLocalSales,
      
      // Estatísticas
      getStats,
      
      // Vendas recentes
      getRecentSales,
      
      // Debug
      debugFirebaseConnection
    }}>
      {children}
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