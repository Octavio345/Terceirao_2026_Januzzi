import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  
  const { loginAdmin, isAdmin } = useRaffleManager();
  const navigate = useNavigate();

  // Carregar tentativas anteriores do localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem('admin_login_attempts');
    const savedLockUntil = localStorage.getItem('admin_lock_until');
    
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
    
    if (savedLockUntil) {
      const lockTime = parseInt(savedLockUntil);
      if (Date.now() < lockTime) {
        setLockUntil(lockTime);
      } else {
        // Limpar se expirou
        localStorage.removeItem('admin_lock_until');
        localStorage.removeItem('admin_login_attempts');
      }
    }
  }, []);

  // Se já estiver logado, redireciona para dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Calcular tempo restante do bloqueio
  const getRemainingTime = () => {
    if (!lockUntil) return 0;
    const remaining = Math.ceil((lockUntil - Date.now()) / 1000 / 60);
    return Math.max(0, remaining);
  };

  const remainingMinutes = getRemainingTime();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se está bloqueado
    if (lockUntil && Date.now() < lockUntil) {
      setError(`Acesso bloqueado. Aguarde ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}.`);
      return;
    }
    
    if (!password.trim()) {
      setError('Digite a senha de administrador');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Pequeno delay para simular verificação (remover em produção)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const success = loginAdmin(password);
      
      if (success) {
        // Resetar tentativas em caso de sucesso
        localStorage.removeItem('admin_login_attempts');
        localStorage.removeItem('admin_lock_until');
        setAttempts(0);
        
        // Redirecionar com pequeno delay
        setTimeout(() => {
          navigate('/admin/dashboard', { 
            replace: true,
            state: { from: 'login' }
          });
        }, 200);
      } else {
        // Incrementar tentativas
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('admin_login_attempts', newAttempts.toString());
        
        if (newAttempts >= 5) {
          // Bloquear por 30 minutos após 5 tentativas
          const lockTime = Date.now() + (30 * 60 * 1000);
          setLockUntil(lockTime);
          localStorage.setItem('admin_lock_until', lockTime.toString());
          setError('Muitas tentativas incorretas. Acesso bloqueado por 30 minutos.');
        } else {
          setError(`Senha incorreta. Tentativas restantes: ${5 - newAttempts}`);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSite = () => {
    navigate('/', { replace: true });
  };

  // Renderizar tela de bloqueio
  if (remainingMinutes > 0) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">🔒</span>
              <h1>Acesso Bloqueado</h1>
            </div>
          </div>
          
          <div className="lock-message">
            <AlertCircle size={48} className="lock-icon" />
            <h3>Muitas tentativas incorretas</h3>
            <p>Por segurança, o acesso foi bloqueado temporariamente.</p>
            <div className="countdown">
              <strong>Tempo restante: {remainingMinutes} minuto{remainingMinutes !== 1 ? 's' : ''}</strong>
            </div>
            <p className="lock-instructions">
              Aguarde o tempo indicado ou entre em contato com o administrador do sistema.
            </p>
          </div>
          
          <button
            type="button"
            className="back-button"
            onClick={handleBackToSite}
          >
            <ArrowLeft size={16} />
            <span>Voltar para o site</span>
          </button>
        </div>

        <style jsx>{`
          .login-container {
            min-height: 100vh;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 16px;
            -webkit-tap-highlight-color: transparent;
          }
          
          .login-card {
            background: white;
            border-radius: 20px;
            padding: 32px 24px;
            width: 100%;
            max-width: 440px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            animation: slideUp 0.4s ease-out;
            text-align: center;
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .login-header {
            text-align: center;
            margin-bottom: 32px;
          }
          
          .logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }
          
          .logo-icon {
            font-size: 48px;
            line-height: 1;
          }
          
          .logo h1 {
            font-size: 24px;
            color: #1a1a2e;
            margin: 0;
            font-weight: 700;
            line-height: 1.2;
          }
          
          .lock-message {
            padding: 20px 0;
          }
          
          .lock-icon {
            color: #f44336;
            margin-bottom: 20px;
          }
          
          .lock-message h3 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          
          .lock-message p {
            color: #666;
            margin: 0 0 20px 0;
            line-height: 1.5;
          }
          
          .countdown {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 10px;
            margin: 25px 0;
            color: #856404;
            font-size: 16px;
          }
          
          .lock-instructions {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
            padding: 0 10px;
          }
          
          .back-button {
            background: none;
            border: 2px solid #e0e0e0;
            color: #667eea;
            font-size: 15px;
            cursor: pointer;
            padding: 12px 20px;
            border-radius: 10px;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-weight: 500;
            width: 100%;
            margin-top: 20px;
          }
          
          .back-button:active {
            background: #f8f9fa;
            transform: scale(0.98);
          }
          
          .back-button:hover {
            background: #f8f9fa;
            border-color: #667eea;
          }
          
          @media (max-width: 768px) {
            .login-container {
              padding: 12px;
              align-items: flex-start;
              padding-top: max(20px, env(safe-area-inset-top));
              padding-bottom: max(20px, env(safe-area-inset-bottom));
            }
            
            .login-card {
              margin-top: 20px;
              padding: 28px 20px;
              border-radius: 16px;
            }
            
            .logo h1 {
              font-size: 22px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🎟️</span>
            <h1>Terceirão Rifas</h1>
          </div>
          <p className="subtitle">Área Restrita - Administração</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <User size={18} />
              <span>Usuário</span>
            </label>
            <input
              id="username"
              type="text"
              value="admin"
              disabled
              className="disabled-input"
              placeholder="Usuário administrador"
              aria-label="Usuário administrador"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={18} />
              <span>Senha</span>
            </label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de administrador"
                autoComplete="current-password"
                aria-label="Senha de administrador"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="password-hint">
              A senha foi fornecida pelo administrador do sistema
            </p>
          </div>
          
          {attempts > 0 && (
            <div className="attempts-warning">
              <AlertCircle size={14} />
              <span>Tentativas falhas: {attempts} de 5</span>
            </div>
          )}
          
          {error && (
            <div className="error-message" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            className="login-button"
            disabled={loading || !password.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                <span>Verificando...</span>
              </>
            ) : (
              'Entrar no Painel Admin'
            )}
          </button>
          
          <div className="login-footer">
            <p className="disclaimer">
              ⚠️ Esta área é restrita apenas para administradores autorizados.
              Qualquer acesso não autorizado será registrado.
            </p>
            <button
              type="button"
              className="back-button"
              onClick={handleBackToSite}
              aria-label="Voltar para o site principal"
            >
              <ArrowLeft size={16} />
              <span>Voltar para o site</span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 16px;
          -webkit-tap-highlight-color: transparent;
        }
        
        .login-card {
          background: white;
          border-radius: 20px;
          padding: 32px 24px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          animation: slideUp 0.4s ease-out;
          position: relative;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .logo-icon {
          font-size: 40px;
          line-height: 1;
        }
        
        .logo h1 {
          font-size: 24px;
          color: #1a1a2e;
          margin: 0;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .subtitle {
          color: #666;
          font-size: 14px;
          margin: 0;
          line-height: 1.4;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          line-height: 1;
        }
        
        .form-group input {
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-group input.disabled-input {
          background: #f8f9fa;
          color: #999;
          cursor: not-allowed;
        }
        
        .password-input {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .password-input input {
          flex: 1;
          padding-right: 50px;
        }
        
        .toggle-password {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .toggle-password:hover,
        .toggle-password:active {
          background: #f5f5f5;
        }
        
        .password-hint {
          font-size: 12px;
          color: #999;
          margin: 4px 0 0 0;
          line-height: 1.4;
        }
        
        .attempts-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: #fff3cd;
          color: #856404;
          border-radius: 8px;
          font-size: 13px;
          border: 1px solid #ffeaa7;
        }
        
        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: #ffebee;
          color: #c62828;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
          border: 1px solid #ffcdd2;
        }
        
        .login-button {
          padding: 18px 16px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 56px;
          position: relative;
          overflow: hidden;
        }
        
        .login-button:active:not(:disabled) {
          transform: scale(0.98);
        }
        
        .login-button:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .login-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }
        
        .disclaimer {
          font-size: 12px;
          color: #999;
          line-height: 1.5;
          margin-bottom: 20px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .back-button {
          background: none;
          border: 2px solid #e0e0e0;
          color: #667eea;
          font-size: 15px;
          cursor: pointer;
          padding: 12px 20px;
          border-radius: 10px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          width: 100%;
        }
        
        .back-button:active {
          background: #f8f9fa;
          transform: scale(0.98);
        }
        
        .back-button:hover {
          background: #f8f9fa;
          border-color: #667eea;
        }
        
        @media (max-width: 768px) {
          .login-container {
            padding: 12px;
            align-items: flex-start;
            padding-top: max(20px, env(safe-area-inset-top));
            padding-bottom: max(20px, env(safe-area-inset-bottom));
          }
          
          .login-card {
            margin-top: 20px;
            padding: 28px 20px;
            border-radius: 16px;
          }
          
          .logo h1 {
            font-size: 22px;
          }
          
          .subtitle {
            font-size: 13px;
          }
        }
        
        @media (max-width: 480px) {
          .login-container {
            padding: 8px;
          }
          
          .login-card {
            padding: 24px 16px;
            margin-top: 10px;
          }
          
          .logo h1 {
            font-size: 20px;
          }
          
          .logo-icon {
            font-size: 36px;
          }
          
          .login-button {
            padding: 16px;
            font-size: 15px;
            min-height: 52px;
          }
          
          .form-group input {
            padding: 14px;
            font-size: 15px;
          }
        }
        
        /* Suporte para iPhone notch e area segura */
        @supports (padding: max(0px)) {
          .login-container {
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;