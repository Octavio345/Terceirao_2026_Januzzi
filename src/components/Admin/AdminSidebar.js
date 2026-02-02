import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Ticket, Users, DollarSign, 
  Settings, FileText, Bell, Download, RefreshCw, X,
  LogOut
} from 'lucide-react';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import toast from 'react-hot-toast';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutAdmin } = useRaffleManager();
  
  const menuItems = [
    { path: '/admin', icon: <Home size={20} />, label: 'Dashboard', exact: true },
    { path: '/admin/rifas', icon: <Ticket size={20} />, label: 'Gerenciar Rifas' },
    { path: '/admin/vendas', icon: <DollarSign size={20} />, label: 'Vendas' },
    { path: '/admin/clientes', icon: <Users size={20} />, label: 'Clientes' },
    { path: '/admin/relatorios', icon: <FileText size={20} />, label: 'Relatórios' },
    { path: '/admin/config', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  const handleLogout = () => {
    logoutAdmin();
    toast.success('✅ Logout realizado com sucesso!');
    navigate('/admin/login', { replace: true });
    onClose();
  };

  return (
    <>
      {/* Sidebar mobile */}
      <aside className={`admin-sidebar mobile ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎟️</span>
            <span className="logo-text">Admin Rifas</span>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Fechar menu">
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="active-indicator"></span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <button className="action-btn sync-btn">
              <RefreshCw size={18} />
              <span>Sincronizar</span>
            </button>
            
            <button className="action-btn export-btn">
              <Download size={18} />
              <span>Exportar</span>
            </button>
            
            <button className="action-btn notif-btn">
              <Bell size={18} />
              <span>Notificações</span>
            </button>
            
            {/* Botão de logout no mobile sidebar */}
            <button 
              className="action-btn logout-btn-mobile"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar desktop - sempre visível */}
      <aside className="admin-sidebar desktop">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎟️</span>
            <span className="logo-text">Admin Rifas</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="active-indicator"></span>}
              </Link>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-actions">
            <button className="action-btn sync-btn">
              <RefreshCw size={18} />
              <span>Sincronizar</span>
            </button>
            
            <button className="action-btn export-btn">
              <Download size={18} />
              <span>Exportar</span>
            </button>
            
            <button className="action-btn notif-btn">
              <Bell size={18} />
              <span>Notificações</span>
            </button>
          </div>
        </div>
      </aside>
<style jsx>{`
  /* Sidebar mobile */
  .admin-sidebar.mobile {
    position: fixed;
    top: 0;
    left: 0;
    width: 85%;
    max-width: 280px;
    height: 100vh;
    background: white;
    border-right: 1px solid #eaeaea;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    box-shadow: 2px 0 20px rgba(0,0,0,0.1);
    transform: translateX(-100%);
  }
  
  .admin-sidebar.mobile.open {
    transform: translateX(0);
  }
  
  /* Sidebar desktop - INICIALMENTE ESCONDIDO NO MOBILE */
  .admin-sidebar.desktop {
    display: none;
    width: 260px;
    background: white;
    border-right: 1px solid #eaeaea;
    flex-direction: column;
    height: calc(100vh - 80px);
  }
  
  .sidebar-header {
    padding: 20px 16px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .admin-sidebar.desktop .sidebar-header {
    justify-content: center;
  }
  
  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
  }
  
  .sidebar-close {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666;
  }
  
  .sidebar-close:hover {
    background: #f8f9fa;
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 20px 0;
    overflow-y: auto;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    color: #666;
    text-decoration: none;
    position: relative;
    transition: all 0.2s ease;
    margin: 4px 8px;
    border-radius: 12px;
  }
  
  .nav-item:hover {
    background: #f8f9fa;
    color: #333;
  }
  
  .nav-item.active {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
    color: #667eea;
    font-weight: 600;
  }
  
  .nav-item.active .nav-icon {
    color: #667eea;
  }
  
  .active-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #667eea;
    border-radius: 0 4px 4px 0;
  }
  
  .nav-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-label {
    font-size: 15px;
    font-weight: 500;
  }
  
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid #eaeaea;
  }
  
  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    background: white;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }
  
  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .sync-btn {
    background: #e3f2fd;
    border-color: #bbdefb;
    color: #1976d2;
  }
  
  .export-btn {
    background: #e8f5e9;
    border-color: #c8e6c9;
    color: #2e7d32;
  }
  
  .notif-btn {
    background: #fff3e0;
    border-color: #ffe0b2;
    color: #ef6c00;
  }
  
  .logout-btn-mobile {
    background: #ffebee;
    border-color: #ffcdd2;
    color: #c62828;
  }
  
  /* Responsividade */
  @media (min-width: 1024px) {
    .admin-sidebar.mobile {
      display: none;
    }
    
    .admin-sidebar.desktop {
      display: flex;
      position: fixed;
      top: 80px;
      left: 0;
      bottom: 0;
      z-index: 95;
    }
    
    .sidebar-header {
      padding: 24px;
    }
    
    .nav-item {
      padding: 14px 24px;
      margin: 0;
    }
    
    .sidebar-footer {
      padding: 20px;
    }
  }
`}</style>
    </>
  );
};

export default AdminSidebar;