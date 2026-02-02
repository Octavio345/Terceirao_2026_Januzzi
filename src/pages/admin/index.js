import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRaffleManager } from '../../context/RaffleManagerContext';

const AdminIndex = () => {
  const { isAdmin } = useRaffleManager();

  // Redireciona baseado no status de login
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <Navigate to="/admin/login" />;
  }
};

export default AdminIndex;