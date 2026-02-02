import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRaffleManager } from '../context/RaffleManagerContext';
import { Loader2, ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = 'admin' }) => {
  const { isAdmin, currentUser, authReady, firebaseConnected } = useRaffleManager();
  const location = useLocation();

  if (!authReady) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <Loader2 size={40} style={styles.spinnerIcon} />
        </div>
        <p style={styles.loadingText}>Verificando autenticação...</p>
      </div>
    );
  }

  if (!firebaseConnected) {
    return (
      <div style={styles.errorContainer}>
        <ShieldAlert size={48} style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Erro de Conexão</h2>
        <p style={styles.errorText}>Não foi possível conectar ao servidor de autenticação.</p>
        <p style={styles.hintText}>Verifique sua conexão com a internet.</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div style={styles.unauthorizedContainer}>
        <ShieldAlert size={48} style={styles.unauthorizedIcon} />
        <h2 style={styles.unauthorizedTitle}>Acesso Negado</h2>
        <p style={styles.unauthorizedText}>Você não tem permissão para acessar esta área.</p>
        <p style={styles.hintText}>Entre em contato com o administrador do sistema.</p>
      </div>
    );
  }

  return children;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem'
  },
  loadingSpinner: {
    marginBottom: '1rem',
    animation: 'spin 1s linear infinite'
  },
  spinnerIcon: {
    color: '#667eea'
  },
  loadingText: {
    color: '#666',
    fontSize: '1rem'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem'
  },
  errorIcon: {
    color: '#f44336',
    marginBottom: '1rem'
  },
  errorTitle: {
    color: '#333',
    marginBottom: '0.5rem',
    fontSize: '1.5rem'
  },
  errorText: {
    color: '#666',
    marginBottom: '0.5rem'
  },
  hintText: {
    color: '#999',
    fontSize: '0.9rem'
  },
  unauthorizedContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem'
  },
  unauthorizedIcon: {
    color: '#ff9800',
    marginBottom: '1rem'
  },
  unauthorizedTitle: {
    color: '#333',
    marginBottom: '0.5rem',
    fontSize: '1.5rem'
  },
  unauthorizedText: {
    color: '#666',
    marginBottom: '0.5rem'
  }
};

export default ProtectedRoute;