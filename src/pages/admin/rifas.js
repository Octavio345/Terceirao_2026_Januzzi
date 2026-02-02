import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminHeader from '../../components/Admin/AdminHeader';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import RaffleManager from '../../components/Admin/RaffleManager';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import './adminRifas.css'

const AdminRifas = () => {
  const { isAdmin } = useRaffleManager();

  if (!isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="admin-layout">
      <AdminHeader />
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-content-wrapper">
          <main className="admin-content">
            <RaffleManager />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminRifas;