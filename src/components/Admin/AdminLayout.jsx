import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

function AdminLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (isLoginPage) {
    return (
      <div className="login-layout">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="admin-body"> {/* Mudou de admin-container para admin-body */}
        {/* Sidebar sempre visível no desktop, menu mobile no mobile */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Overlay para mobile */}
        <div 
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        {/* Conteúdo principal - centralizado */}
        <div className="admin-content">
          <main className="admin-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;