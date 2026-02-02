import React from 'react';
import { LogOut, Settings, Bell, User, Menu} from 'lucide-react';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminHeader = ({ onMenuClick }) => {
  const { isSyncing, lastSync, logoutAdmin } = useRaffleManager();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    toast.success('✅ Logout realizado com sucesso!');
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <header className="admin-header">
        <div className="header-container">
          {/* Left section: Menu toggle and brand */}
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={onMenuClick} 
              aria-label="Abrir menu lateral"
            >
              <Menu size={24} />
            </button>
            
            <div className="header-brand">
              <h1>🎟️ Painel Admin</h1>
              <p className="subtitle">Rifas do Terceirão</p>
            </div>
          </div>

          {/* Middle section: Sync status (desktop only) */}
          <div className="header-center">
            <div className="sync-status-desktop">
              {isSyncing ? (
                <span className="syncing">
                  <span className="sync-dot"></span>
                  Sincronizando...
                </span>
              ) : lastSync ? (
                <span className="synced">
                  ✅ Sincronizado {new Date(lastSync).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              ) : (
                <span className="not-synced">⚠️ Não sincronizado</span>
              )}
            </div>
          </div>

          {/* Right section: Desktop actions */}
          <div className="header-right">
            <div className="desktop-actions">
              <div className="action-group">
                <button className="header-btn notification-btn">
                  <Bell size={20} />
                  <span className="notification-badge">3</span>
                </button>
                
                <button className="header-btn settings-btn">
                  <Settings size={20} />
                </button>
              </div>
              
              <div className="admin-user">
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <span className="user-name">Admin</span>
              </div>
              
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span className="logout-text">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <style jsx>{`
        .admin-header {
          background: white;
          border-bottom: 1px solid #eaeaea;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
        }
        
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 70px;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        /* Left section */
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }
        
        .mobile-menu-toggle {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        
        .mobile-menu-toggle:hover {
          background: #f8f9fa;
        }
        
        .header-brand {
          min-width: 0;
        }
        
        .header-brand h1 {
          font-size: 20px;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .subtitle {
          font-size: 12px;
          color: #666;
          margin: 2px 0 0 0;
          display: block;
        }
        
        /* Center section - desktop only */
        .header-center {
          display: none;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        
        .sync-status-desktop {
          font-size: 13px;
          padding: 8px 16px;
          border-radius: 20px;
          background: #f8f9fa;
          white-space: nowrap;
        }
        
        .syncing {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1976d2;
        }
        
        .sync-dot {
          width: 8px;
          height: 8px;
          background: #1976d2;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .synced {
          color: #2e7d32;
        }
        
        .not-synced {
          color: #f57c00;
        }
        
        /* Right section - desktop only */
        .header-right {
          display: none;
          align-items: center;
          gap: 20px;
          flex: 1;
          justify-content: flex-end;
        }
        
        .desktop-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .action-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .header-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #e0e0e0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        
        .header-btn:hover {
          background: #f8f9fa;
          border-color: #ccc;
        }
        
        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ff6b6b;
          color: white;
          font-size: 10px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .admin-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: #f8f9fa;
          border-radius: 20px;
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .user-name {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          white-space: nowrap;
        }
        
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .logout-btn:hover {
          background: #ffcdd2;
        }
        
        .logout-text {
          font-size: 14px;
        }
        
        /* Responsive styles */
        @media (min-width: 768px) {
          .header-container {
            padding: 0 24px;
            height: 80px;
          }
          
          .header-brand h1 {
            font-size: 24px;
          }
          
          .subtitle {
            font-size: 13px;
          }
          
          .mobile-menu-toggle {
            display: none;
          }
          
          .header-center {
            display: flex;
          }
          
          .header-right {
            display: flex;
          }
        }
        
        @media (min-width: 1024px) {
          .header-container {
            padding: 0 32px;
          }
          
          .header-brand h1 {
            font-size: 26px;
          }
        }
        
        @media (max-width: 767px) {
          .header-container {
            justify-content: flex-start;
          }
          
          .header-center, .header-right {
            display: none;
          }
          
          .header-brand h1 {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminHeader;