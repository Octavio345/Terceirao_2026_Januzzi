import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminHeader from '../../components/Admin/AdminHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import DashboardContent from '../../components/Admin/Dashboard';
import { useRaffleManager } from '../../context/RaffleManagerContext';

const AdminDashboard = () => {
  const { isAdmin } = useRaffleManager();

  // Se não estiver logado, redireciona para login
  if (!isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-main">
        <AdminSidebar />
        <main className="admin-content">
          <DashboardContent />
        </main>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .admin-main {
          display: flex;
          flex: 1;
        }
        
        .admin-content {
          flex: 1;
          overflow-y: auto;
        }
        
        @media (max-width: 1024px) {
          .admin-main {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;