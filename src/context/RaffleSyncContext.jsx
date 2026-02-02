import React, { createContext, useContext, useState, useEffect } from 'react';

const RaffleManagerContext = createContext();

export const RaffleManagerProvider = ({ children }) => {
  const [soldNumbers, setSoldNumbers] = useState(() => {
    // Carrega do localStorage ou inicia vazio
    const saved = localStorage.getItem('terceirao-sold-numbers');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem('terceirao-last-sync') || null;
  });

  // Verificar se número está vendido
  const isNumberSold = (className, number) => {
    return soldNumbers.some(item => 
      item.turma === className && 
      item.numero === number &&
      item.status !== 'cancelado'
    );
  };

  // Obter números disponíveis por turma
  const getAvailableNumbers = (className) => {
    const soldInClass = soldNumbers
      .filter(item => item.turma === className && item.status !== 'cancelado')
      .map(item => item.numero);
    
    // Gera array de 1 a 300 e remove os vendidos
    return Array.from({ length: 300 }, (_, i) => i + 1)
      .filter(num => !soldInClass.includes(num));
  };

  // Marcar número como vendido
  const markNumberAsSold = (className, number, buyerInfo = {}) => {
    const newSold = {
      id: `${className}-${number}-${Date.now()}`,
      turma: className,
      numero: number,
      nome: buyerInfo.nome || 'Comprador Online',
      telefone: buyerInfo.telefone || '',
      status: 'reservado',
      timestamp: new Date().toISOString(),
      synced: false
    };

    const updated = [...soldNumbers, newSold];
    setSoldNumbers(updated);
    localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
    
    // Tentar sincronizar
    syncWithGoogleSheet(newSold);
    
    // Notificar outras abas
    broadcastToOtherTabs('NUMBER_SOLD', newSold);
    
    return newSold;
  };

  // ADMIN: Adicionar venda manualmente
  const addManualSale = (saleData) => {
    const newSale = {
      id: `${saleData.turma}-${saleData.numero}-${Date.now()}`,
      turma: saleData.turma,
      numero: saleData.numero,
      nome: saleData.nome || '',
      telefone: saleData.telefone || '',
      status: saleData.status || 'pago',
      timestamp: saleData.timestamp || new Date().toISOString(),
      synced: false,
      manual: true
    };

    const updated = [...soldNumbers, newSale];
    setSoldNumbers(updated);
    localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
    
    syncWithGoogleSheet(newSale);
    return newSale;
  };

  // ADMIN: Remover venda
  const removeSale = (id) => {
    const updated = soldNumbers.filter(item => item.id !== id);
    setSoldNumbers(updated);
    localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
  };

  // ADMIN: Atualizar status
  const updateSaleStatus = (id, status) => {
    const updated = soldNumbers.map(item => 
      item.id === id ? { ...item, status, synced: false } : item
    );
    setSoldNumbers(updated);
    localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
  };

  // Sincronizar com Google Sheets (simplificado)
  const syncWithGoogleSheet = async (item) => {
    setIsSyncing(true);
    
    try {
      // Método SIMPLES usando Google Forms
      const formId = process.env.REACT_APP_GOOGLE_FORM_ID;
      
      if (formId) {
        const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
        
        const formData = new URLSearchParams();
        formData.append('entry.2005620554', item.turma); // Turma
        formData.append('entry.1065046570', item.numero); // Número
        formData.append('entry.1166974658', item.nome); // Nome
        formData.append('entry.839337160', item.telefone); // Telefone
        formData.append('entry.123456789', item.status); // Status
        
        await fetch(formUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });
      }

      // Marcar como sincronizado
      const updated = soldNumbers.map(sale => 
        sale.id === item.id ? { ...sale, synced: true } : sale
      );
      setSoldNumbers(updated);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
      
      setLastSync(new Date().toISOString());
      localStorage.setItem('terceirao-last-sync', new Date().toISOString());
      
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Carregar dados do Google Sheets
  const loadFromGoogleSheet = async () => {
    try {
      const sheetId = process.env.REACT_APP_GOOGLE_SHEET_ID;
      if (!sheetId) return;
      
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      
      const rows = csvText.split('\n').slice(1);
      const sheetData = rows
        .map(row => {
          const [data, turma, numero, nome, telefone, status] = row.split(',');
          if (!numero) return null;
          
          return {
            id: `${turma}-${numero}-${data}`,
            turma: turma?.trim(),
            numero: parseInt(numero),
            nome: nome?.trim() || '',
            telefone: telefone?.trim() || '',
            status: status?.trim() || 'pago',
            timestamp: data?.trim() || new Date().toISOString(),
            synced: true,
            fromSheet: true
          };
        })
        .filter(Boolean);
      
      // Combinar dados
      const combined = [...soldNumbers.filter(s => !s.fromSheet), ...sheetData];
      const unique = Array.from(
        new Map(combined.map(item => [`${item.turma}-${item.numero}`, item])).values()
      );
      
      setSoldNumbers(unique);
      localStorage.setItem('terceirao-sold-numbers', JSON.stringify(unique));
      
    } catch (error) {
      console.error('Erro ao carregar da planilha:', error);
    }
  };

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Data', 'Turma', 'Número', 'Nome', 'Telefone', 'Status'];
    const csvRows = [
      headers.join(','),
      ...soldNumbers.map(item => [
        new Date(item.timestamp).toLocaleDateString('pt-BR'),
        item.turma,
        item.numero,
        `"${item.nome.replace(/"/g, '""')}"`,
        item.telefone,
        item.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rifas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Sincronizar entre abas do navegador
  const broadcastToOtherTabs = (type, data) => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type,
        data
      });
    }
    
    // Também usar localStorage para abas na mesma origem
    localStorage.setItem('terceirao-last-update', JSON.stringify({
      type,
      data,
      timestamp: Date.now()
    }));
  };

  // Login do admin
  const loginAdmin = (password) => {
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'terceirao2024';
    if (password === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem('terceirao-admin', 'true');
      return true;
    }
    return false;
  };

  // Logout do admin
  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('terceirao-admin');
  };

  // Verificar login ao carregar
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('terceirao-admin') === 'true';
    setIsAdmin(isLoggedIn);
    
    // Sincronizar dados a cada 5 minutos
    const syncInterval = setInterval(() => {
      if (soldNumbers.some(item => !item.synced)) {
        soldNumbers.filter(item => !item.synced).forEach(syncWithGoogleSheet);
      }
    }, 5 * 60 * 1000);
    
    // Escutar atualizações de outras abas
    const handleStorageChange = (e) => {
      if (e.key === 'terceirao-sold-numbers') {
        setSoldNumbers(JSON.parse(e.newValue || '[]'));
      }
    };
    
    const handleMessage = (e) => {
      if (e.data.type === 'NUMBER_SOLD') {
        const newSold = e.data.data;
        setSoldNumbers(prev => {
          const exists = prev.some(item => 
            item.turma === newSold.turma && item.numero === newSold.numero
          );
          return exists ? prev : [...prev, newSold];
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);
    
    // Carregar dados da planilha ao iniciar
    loadFromGoogleSheet();
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <RaffleManagerContext.Provider value={{
      // Estado
      soldNumbers,
      isAdmin,
      isSyncing,
      lastSync,
      
      // Funções do usuário
      isNumberSold,
      getAvailableNumbers,
      markNumberAsSold,
      
      // Funções do admin
      addManualSale,
      removeSale,
      updateSaleStatus,
      exportToCSV,
      loadFromGoogleSheet,
      
      // Login
      loginAdmin,
      logoutAdmin,
      
      // Estatísticas
      getStats: () => ({
        total: soldNumbers.length,
        turma3A: soldNumbers.filter(n => n.turma === '3A').length,
        turma3B: soldNumbers.filter(n => n.turma === '3B').length,
        turma3TECH: soldNumbers.filter(n => n.turma === '3TECH').length,
        pagos: soldNumbers.filter(n => n.status === 'pago').length,
        reservados: soldNumbers.filter(n => n.status === 'reservado').length,
        arrecadado: soldNumbers.filter(n => n.status === 'pago').length * 15
      })
    }}>
      {children}
    </RaffleManagerContext.Provider>
  );
};

export const useRaffleManager = () => useContext(RaffleManagerContext);