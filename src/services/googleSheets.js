const syncWithGoogleSheet = async (item) => {
  setIsSyncing(true);
  
  try {
    // Método alternativo: Salvar em uma API local
    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...item,
        synced: true,
        syncTime: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      // Marcar como sincronizado
      setSoldNumbers(prev => {
        const updated = prev.map(sale => 
          sale.id === item.id ? { ...sale, synced: true } : sale
        );
        localStorage.setItem('terceirao-sold-numbers', JSON.stringify(updated));
        return updated;
      });
      
      setLastSync(new Date().toISOString());
      localStorage.setItem('terceirao-last-sync', new Date().toISOString());
      
      console.log('✅ Sincronizado com sucesso');
    }
  } catch (error) {
    console.log('⚠️ Salvando apenas localmente');
    // Mesmo com erro, mantemos o registro
  } finally {
    setIsSyncing(false);
  }
};