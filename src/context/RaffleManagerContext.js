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
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem('terceirao-last-sync') || null;
  });
  const [firebaseError, setFirebaseError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  // ========== VERIFICAÇÃO DE CONEXÃO ==========
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Conexão restaurada');
      if (db) {
        toast.success('✅ Conectado ao servidor!');
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('🌐 Conexão perdida');
      toast.warning('⚠️ Modo offline ativado');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [db]);

  // ========== INICIALIZAÇÃO ROBUSTA DO FIREBASE ==========
  useEffect(() => {
    let unsubscribe = null;
    
    const initializeFirebase = async () => {
      try {
        console.log('🔥 INICIANDO FIREBASE EM PRODUÇÃO - v3.0');
        
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
        console.log('- Project ID:', firebaseConfig.projectId);
        
        // Verificar se está em produção
        const isProduction = window.location.hostname !== 'localhost';
        console.log('- Ambiente:', isProduction ? 'Produção' : 'Desenvolvimento');
        
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          const errorMsg = 'Firebase não configurado. Configure as variáveis na Vercel.';
          console.error('❌', errorMsg);
          setFirebaseError(errorMsg);
          if (isProduction) {
            toast.error('❌ Sistema offline. Contate o administrador.');
          }
          return;
        }

        // Inicializar Firebase
        console.log('🚀 Inicializando Firebase...');
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        
        // Testar conexão
        console.log('📡 Testando conexão com Firestore...');
        try {
          await getDocs(collection(firestoreDb, 'sales'));
          console.log('✅ Conexão com Firestore estabelecida!');
        } catch (connectionError) {
          console.error('❌ Falha na conexão inicial:', connectionError);
          if (connectionError.code === 'failed-precondition') {
            toast.error('❌ Servidor temporariamente indisponível');
          }
        }
        
        setDb(firestoreDb);
        setFirebaseInitialized(true);
        
        console.log('✅ Firebase inicializado com sucesso! Projeto:', firebaseConfig.projectId);
        
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
        console.log('🧹 Limpando listener Firebase');
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
          
          // Erros específicos com mensagens amigáveis
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

  // ========== FUNÇÃO QUE VERIFICA EM TEMPO REAL ==========
  const checkNumberInRealTime = useCallback(async (turma, numero) => {
    if (!db) {
      console.error('❌ Firebase não disponível para verificação em tempo real');
      return { sold: false, reserved: false, available: true };
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

  // ========== FUNÇÃO PRINCIPAL: ENVIAR VENDA (CORRIGIDA) ==========
  const sendToFirebase = useCallback(async (saleData) => {
    console.log('🚀 INICIANDO ENVIO PARA FIREBASE:', saleData);
    
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
      // VALIDAÇÕES CONFORME REGRAS DO FIREBASE
      console.log('🔍 Validando dados conforme regras Firebase...');
      
      // 1. Validar turma
      const validTurmas = ['3° A', '3° B', '3° TECH'];
      if (!saleData.turma || !validTurmas.includes(saleData.turma)) {
        const errorMsg = `Turma inválida: "${saleData.turma}". Use: ${validTurmas.join(', ')}`;
        console.error('❌', errorMsg);
        toast.error('❌ Turma inválida');
        return {
          success: false,
          error: errorMsg,
          data: null
        };
      }
      
      // 2. Validar número (deve ser número entre 1-300)
      const numero = parseInt(saleData.numero);
      if (isNaN(numero) || numero < 1 || numero > 300) {
        const errorMsg = `Número inválido: "${saleData.numero}". Deve ser entre 1 e 300.`;
        console.error('❌', errorMsg);
        toast.error('❌ Número inválido');
        return {
          success: false,
          error: errorMsg,
          data: null
        };
      }
      
      // 3. Validar status
      const validStatus = ['pago', 'pendente', 'reservado'];
      const status = saleData.status || 'pendente';
      if (!validStatus.includes(status)) {
        const errorMsg = `Status inválido: "${status}". Use: ${validStatus.join(', ')}`;
        console.error('❌', errorMsg);
        toast.error('❌ Status inválido');
        return {
          success: false,
          error: errorMsg,
          data: null
        };
      }
      
      // 4. Validar paymentMethod
      const validMethods = ['pix', 'dinheiro'];
      const paymentMethod = saleData.paymentMethod || 'pix';
      if (!validMethods.includes(paymentMethod)) {
        const errorMsg = `Método de pagamento inválido: "${paymentMethod}". Use: ${validMethods.join(', ')}`;
        console.error('❌', errorMsg);
        toast.error('❌ Método de pagamento inválido');
        return {
          success: false,
          error: errorMsg,
          data: null
        };
      }
      
      // 5. VERIFICAR EM TEMPO REAL ANTES DE ENVIAR
      console.log('⏱️ Verificando em tempo real antes de enviar...');
      const realTimeCheck = await checkNumberInRealTime(saleData.turma, numero);
      
      if (realTimeCheck.sold) {
        console.error('❌ Número já vendido (verificado em tempo real)!');
        toast.error('❌ Este número já foi vendido por outra pessoa!');
        return {
          success: false,
          error: 'Número já vendido (verificação em tempo real)',
          alreadySold: true,
          data: null
        };
      }
      
      if (realTimeCheck.reserved) {
        console.error('❌ Número já reservado (verificado em tempo real)!');
        toast.error('❌ Este número já está reservado!');
        return {
          success: false,
          error: 'Número já reservado (verificação em tempo real)',
          alreadyReserved: true,
          data: null
        };
      }
      
      // PREPARAR DADOS EXATAMENTE COMO AS REGRAS EXIGEM
      console.log('📦 Preparando dados para Firebase...');
      
      const firebaseData = {
        // Campos OBRIGATÓRIOS pelas regras:
        turma: saleData.turma, // string - OBRIGATÓRIO
        numero: numero, // number - OBRIGATÓRIO
        nome: (saleData.nome || 'Comprador Online').toString().substring(0, 100), // string - OBRIGATÓRIO
        status: status, // string - OBRIGATÓRIO
        timestamp: serverTimestamp(), // timestamp - OBRIGATÓRIO
        paymentMethod: paymentMethod, // string - OBRIGATÓRIO nas regras
        
        // Campos OPCIONAIS:
        telefone: (saleData.telefone || '').toString().substring(0, 20),
        orderId: saleData.orderId || null,
        source: saleData.source || 'online',
        price: parseFloat(saleData.price || 15.00),
        createdAt: serverTimestamp(),
        deviceId: localStorage.getItem('deviceId') || 'web'
      };
      
      // Adicionar campos condicionais
      if (saleData.expiresAt) firebaseData.expiresAt = saleData.expiresAt;
      if (saleData.confirmedAt) firebaseData.confirmedAt = saleData.confirmedAt;
      
      // LOG DE DEBUG DETALHADO
      console.log('🔍 Dados validados para envio:');
      console.log('- turma (string):', typeof firebaseData.turma, firebaseData.turma);
      console.log('- numero (number):', typeof firebaseData.numero, firebaseData.numero);
      console.log('- nome (string):', typeof firebaseData.nome, firebaseData.nome.length > 0);
      console.log('- status (string):', typeof firebaseData.status, firebaseData.status);
      console.log('- paymentMethod (string):', typeof firebaseData.paymentMethod, firebaseData.paymentMethod);
      console.log('- timestamp:', 'serverTimestamp');
      
      // ENVIO PARA FIREBASE
      console.log('📤 Enviando para coleção "sales"...');
      const docRef = await addDoc(collection(db, 'sales'), firebaseData);
      const firebaseId = docRef.id;
      
      console.log('✅ Venda enviada com sucesso! ID:', firebaseId);
      
      // Atualizar estado local
      const syncedSale = {
        ...saleData,
        id: firebaseId,
        firebaseId,
        synced: true,
        timestamp: new Date().toISOString(),
        status: status,
        paymentMethod: paymentMethod,
        numero: numero // Garantir que seja número
      };
      
      const newSoldNumbers = [...soldNumbers, syncedSale];
      setSoldNumbers(newSoldNumbers);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(newSoldNumbers));
      
      // Disparar evento para atualizar UI e outras abas
      window.dispatchEvent(new CustomEvent('new_sale_added', {
        detail: syncedSale
      }));
      
      // Disparar evento GLOBAL para atualizar TODOS os usuários
      window.dispatchEvent(new CustomEvent('firebase_new_sale', {
        detail: {
          turma: saleData.turma,
          numero: numero,
          status: status,
          timestamp: new Date().toISOString()
        }
      }));
      
      toast.success('✅ Venda registrada no sistema!');
      
      return {
        success: true,
        firebaseId,
        data: syncedSale
      };
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO AO ENVIAR PARA FIREBASE:');
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
      
      // Tratamento de erros específicos
      let userMessage = '❌ Erro ao salvar no servidor';
      
      if (error.code === 'permission-denied') {
        console.error('🔥 PERMISSÃO NEGADA! Verifique:');
        console.error('1. Regras do Firebase Firestore');
        console.error('2. Estrutura dos dados enviados');
        console.error('3. Valores dos campos');
        userMessage = '❌ Permissão negada pelo servidor';
      } else if (error.code === 'invalid-argument') {
        console.error('🔥 ARGUMENTO INVÁLIDO!');
        userMessage = '❌ Dados inválidos enviados ao servidor';
      }
      
      // Salvar localmente em caso de erro
      const localSale = {
        ...saleData,
        id: `local-error-${Date.now()}`,
        synced: false,
        syncError: error.message,
        timestamp: new Date().toISOString(),
        status: saleData.status || 'pendente'
      };
      
      const newSoldNumbers = [...soldNumbers, localSale];
      setSoldNumbers(newSoldNumbers);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(newSoldNumbers));
      
      toast.error(userMessage + '. Venda salva localmente.');
      
      return {
        success: false,
        error: error.message,
        data: localSale
      };
    }
  }, [db, soldNumbers, checkNumberInRealTime]);

  // ========== FUNÇÃO QUE GARANTE ENVIO PARA FIREBASE (EMERGÊNCIA) ==========
  const forceSendToFirebase = useCallback(async (saleData) => {
    console.log('🚀 FORÇANDO ENVIO PARA FIREBASE (BYPASS DE VALIDAÇÃO):', saleData);
    
    if (!db) {
      console.error('❌ Firebase não disponível');
      return { success: false, error: 'Firebase não disponível' };
    }

    try {
      // VALIDAÇÕES ESSENCIAIS
      const validTurmas = ['3° A', '3° B', '3° TECH'];
      if (!saleData.turma || !validTurmas.includes(saleData.turma)) {
        throw new Error(`Turma inválida: ${saleData.turma}`);
      }
      
      const numero = parseInt(saleData.numero);
      if (isNaN(numero) || numero < 1 || numero > 300) {
        throw new Error(`Número inválido: ${saleData.numero}`);
      }
      
      // VERIFICAR SE JÁ EXISTE (EM TEMPO REAL)
      const realTimeCheck = await checkNumberInRealTime(saleData.turma, numero);
      
      if (realTimeCheck.sold) {
        console.error('❌ Número já vendido (verificado em tempo real)');
        return {
          success: false,
          error: 'Este número já foi vendido por outra pessoa',
          alreadySold: true
        };
      }
      
      if (realTimeCheck.reserved) {
        console.error('❌ Número já reservado (verificado em tempo real)');
        return {
          success: false,
          error: 'Este número já está reservado',
          alreadyReserved: true
        };
      }
      
      // PREPARAR DADOS PARA FIREBASE
      const firebaseData = {
        turma: saleData.turma,
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
        deviceId: localStorage.getItem('deviceId') || 'web_emergency',
        confirmedAt: saleData.confirmedAt || null,
        expiresAt: saleData.expiresAt || null
      };
      
      console.log('📤 Enviando para Firebase com bypass...');
      const docRef = await addDoc(collection(db, 'sales'), firebaseData);
      const firebaseId = docRef.id;
      
      console.log('✅ ENVIADO COM SUCESSO! ID:', firebaseId);
      
      // FORÇAR ATUALIZAÇÃO IMEDIATA DO CONTEXTO
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
      
      // DISPARAR EVENTO GLOBAL PARA ATUALIZAR TODAS AS ABAS
      window.dispatchEvent(new CustomEvent('firebase_new_sale', {
        detail: newSale
      }));
      
      // DISPARAR EVENTO PARA ATUALIZAR OUTROS USUÁRIOS
      window.dispatchEvent(new CustomEvent('number_sold', {
        detail: {
          turma: saleData.turma,
          numero: numero,
          status: saleData.status || 'pendente'
        }
      }));
      
      // FORÇAR REFRESH DOS DADOS
      setTimeout(() => {
        refreshData();
      }, 500);
      
      toast.success('✅ Rifa enviada com sucesso (emergência)!');
      
      return {
        success: true,
        firebaseId: firebaseId,
        data: newSale
      };
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO NO FORCE SEND:', error);
      toast.error('❌ Erro ao enviar via emergência');
      return {
        success: false,
        error: error.message
      };
    }
  }, [db, checkNumberInRealTime, refreshData]);

  // ========== FUNÇÕES ESPECÍFICAS ==========
  const confirmPaymentAndSendToFirebase = useCallback(async (raffleData, paymentInfo = {}) => {
    console.log('🚀 Confirmando pagamento PIX e enviando para Firebase...');
    
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
      sale.numero === parseInt(numero) && 
      sale.status === 'pago'
    );
    
    console.log(`🔍 ${turma} Nº ${numero}:`, isSold ? 'VENDIDO' : 'DISPONÍVEL');
    return isSold;
  }, [soldNumbers]);

  const isNumberReserved = useCallback((turma, numero) => {
    return soldNumbers.some(sale => 
      sale.turma === turma && 
      sale.numero === parseInt(numero) && 
      (sale.status === 'pendente' || sale.status === 'reservado')
    );
  }, [soldNumbers]);

  const getAvailableNumbers = useCallback((turma) => {
    const usedNumbers = soldNumbers
      .filter(sale => sale.turma === turma)
      .map(sale => parseInt(sale.numero));
    
    const available = Array.from({ length: 300 }, (_, i) => i + 1)
      .filter(num => !usedNumbers.includes(num));
    
    console.log(`📊 ${turma}: ${available.length} números disponíveis`);
    return available;
  }, [soldNumbers]);

  const markNumbersAsReserved = useCallback((turma, numero, nome, orderId) => {
    console.log('📝 Marcando como reservado localmente...', { turma, numero, nome });
    
    const localReservation = {
      id: `local-${Date.now()}`,
      turma,
      numero: parseInt(numero),
      nome: nome || 'Cliente',
      status: 'pendente',
      paymentMethod: 'dinheiro',
      orderId,
      source: 'local',
      synced: false,
      timestamp: new Date().toISOString()
    };
    
    const newSoldNumbers = [...soldNumbers, localReservation];
    setSoldNumbers(newSoldNumbers);
    localStorage.setItem('terceirao-sold-numbers', JSON.stringify(newSoldNumbers));
    
    return true;
  }, [soldNumbers]);

  // ========== ATUALIZAR STATUS ==========
  const updateSaleStatus = useCallback(async (saleId, newStatus, paymentMethod = null) => {
    const sale = soldNumbers.find(s => s.id === saleId || s.firebaseId === saleId);
    
    if (!sale) {
      console.error('❌ Venda não encontrada para atualização:', saleId);
      toast.error('Venda não encontrada');
      return false;
    }
    
    if (!db) {
      console.error('❌ Firebase não disponível para atualização');
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
        toast.success('✅ Status atualizado no servidor!');
        
        // Atualizar estado local
        const updatedSoldNumbers = soldNumbers.map(s => 
          s.firebaseId === sale.firebaseId 
            ? { ...s, status: newStatus, paymentMethod: paymentMethod || s.paymentMethod }
            : s
        );
        
        setSoldNumbers(updatedSoldNumbers);
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updatedSoldNumbers));
        
        // Disparar evento para atualizar outros usuários
        window.dispatchEvent(new CustomEvent('sale_status_updated', {
          detail: {
            firebaseId: sale.firebaseId,
            status: newStatus,
            turma: sale.turma,
            numero: sale.numero
          }
        }));
        
        return true;
      } else {
        console.error('❌ Venda local sem firebaseId:', sale);
        toast.error('Venda local não pode ser atualizada');
        return false;
      }
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
    console.log('🔄 Forçando atualização de dados...');
    
    if (db) {
      loadInitialData(db);
    } else {
      console.error('❌ Firebase não disponível para refresh');
      toast.error('Servidor não disponível');
    }
    
    // Disparar evento para outras abas
    window.dispatchEvent(new CustomEvent('firebase_force_refresh', {
      detail: { timestamp: new Date().toISOString() }
    }));
    
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
        console.log(`📤 Sincronizando venda local: ${sale.turma} Nº ${sale.numero}`);
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
    } else if (unsynced.length > 0) {
      toast.error('❌ Falha ao sincronizar vendas locais');
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
      firebaseInitialized,
      isOnline,
      lastSync
    };
  }, [soldNumbers, db, firebaseInitialized, isOnline, lastSync]);

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

  // ========== FUNÇÃO DE DEBUG PARA PRODUÇÃO ==========
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
        // Testar número específico que sabemos que existe
        const testTurma = '3° A';
        const testNumero = 1; // Testar com número baixo
        
        console.log(`🧪 Testando verificação em tempo real: ${testTurma} Nº ${testNumero}`);
        const realTimeCheck = await checkNumberInRealTime(testTurma, testNumero);
        console.log('📊 Resultado verificação:', realTimeCheck);
        
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

  // ========== SINCRONIZAÇÃO PERIÓDICA ==========
  useEffect(() => {
    let interval;
    
    if (db && isOnline) {
      // Sincronizar a cada 30 segundos em produção
      interval = setInterval(() => {
        syncAllLocalSales();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [db, isOnline, syncAllLocalSales]);

  // ========== VERIFICAR ADMIN AO INICIAR ==========
  useEffect(() => {
    const adminStatus = localStorage.getItem('terceirao-admin') === 'true';
    setIsAdmin(adminStatus);
    
    // Gerar deviceId único se não existir
    if (!localStorage.getItem('deviceId')) {
      const deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
      console.log('📱 Device ID gerado:', deviceId);
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
      markNumbersAsReserved,
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
      
      // Debug (apenas desenvolvimento)
      debugFirebaseConnection
    }}>
      {children}
      
      {/* Elemento oculto para debug */}
      <div 
        style={{ display: 'none' }}
        data-firebase-status={db ? 'connected' : 'disconnected'}
        data-firebase-error={firebaseError || 'none'}
        data-sold-count={soldNumbers.length}
        data-synced-count={soldNumbers.filter(s => s.synced).length}
        data-firebase-initialized={firebaseInitialized}
        data-online-status={isOnline}
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