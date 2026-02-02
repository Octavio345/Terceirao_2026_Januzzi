import React, { useEffect } from 'react';
import { useRaffleManager } from '../context/RaffleManagerContext';

const RealTimeSync = () => {
  const raffleManager = useRaffleManager();
  
  useEffect(() => {
    // Sincronizar a cada 10 segundos
    const syncInterval = setInterval(() => {
      if (raffleManager && raffleManager.refreshData) {
        raffleManager.refreshData();
      }
    }, 10000);
    
    // Sincronizar quando a página ganha foco
    const handleVisibilityChange = () => {
      if (!document.hidden && raffleManager && raffleManager.refreshData) {
        raffleManager.refreshData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [raffleManager]);
  
  return null; // Este componente não renderiza nada
};

export default RealTimeSync;