// src/components/Admin/SalesManager.jsx
import React, { useState, useMemo } from 'react';
import { 
  Search, XCircle, Clock, 
  Edit, Save, X, DollarSign, User, Phone, Calendar,
  RefreshCw, Download
} from 'lucide-react';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import toast from 'react-hot-toast';

const SalesManager = () => {
  const { 
    soldNumbers, 
    updateSaleStatus, 
    removeSale,
    exportToCSV,
    syncAllLocalSales,
    firebaseConnected
  } = useRaffleManager();
  
  const [search, setSearch] = useState('');
  const [filterTurma, setFilterTurma] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Filtrar vendas
  const filteredSales = useMemo(() => {
    return soldNumbers.filter(sale => {
      const matchesSearch = 
        !search ||
        sale.nome?.toLowerCase().includes(search.toLowerCase()) ||
        sale.telefone?.includes(search) ||
        sale.numero.toString().includes(search) ||
        sale.turma.toLowerCase().includes(search.toLowerCase());
      
      const matchesTurma = 
        filterTurma === 'all' || sale.turma === filterTurma;
      
      const matchesStatus = 
        filterStatus === 'all' || sale.status === filterStatus;
      
      return matchesSearch && matchesTurma && matchesStatus;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [soldNumbers, search, filterTurma, filterStatus]);

  // Iniciar edição
  const startEdit = (sale) => {
    setEditingId(sale.id);
    setEditForm({
      nome: sale.nome || '',
      telefone: sale.telefone || '',
      status: sale.status || 'reservado'
    });
  };

  // Salvar edição
  const saveEdit = async () => {
    if (!editingId) return;
    
    try {
      await updateSaleStatus(editingId, editForm.status);
      
      toast.success('✅ Status atualizado!');
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      toast.error('❌ Erro ao atualizar');
    }
  };

  // Cancelar edição
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Excluir venda
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await removeSale(id);
        toast.success('🗑️ Venda excluída');
      } catch (error) {
        toast.error('❌ Erro ao excluir');
      }
    }
  };

  // Renderizar status
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pago':
        return <span className="status-badge paid">💰 Pago</span>;
      case 'reservado':
        return <span className="status-badge reserved">⏳ Reservado</span>;
      case 'cancelado':
        return <span className="status-badge cancelled">❌ Cancelado</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  // Ações rápidas
  const quickActions = [
    { status: 'pago', label: 'Marcar como Pago', icon: <DollarSign size={16} /> },
    { status: 'reservado', label: 'Marcar como Reservado', icon: <Clock size={16} /> },
    { status: 'cancelado', label: 'Cancelar Venda', icon: <XCircle size={16} /> }
  ];

  return (
    <div className="sales-manager">
      {/* Cabeçalho */}
      <div className="manager-header">
        <div className="header-left">
          <h1>Gerenciar Vendas</h1>
          <p className="subtitle">
            {soldNumbers.length} vendas totais • 
            {soldNumbers.filter(s => s.status === 'pago').length} pagas • 
            {soldNumbers.filter(s => s.status === 'reservado').length} reservadas
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={syncAllLocalSales}
            disabled={!firebaseConnected}
          >
            <RefreshCw size={16} />
            {firebaseConnected ? 'Sincronizar' : 'Offline'}
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={exportToCSV}
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, número ou turma..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          <select value={filterTurma} onChange={(e) => setFilterTurma(e.target.value)}>
            <option value="all">Todas as Turmas</option>
            <option value="3A">3º ANO A</option>
            <option value="3B">3º ANO B</option>
            <option value="3TECH">3º TECH</option>
          </select>
          
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos os Status</option>
            <option value="pago">Pago</option>
            <option value="reservado">Reservado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Turma</th>
              <th>Número</th>
              <th>Comprador</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Nenhuma venda encontrada
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className={editingId === sale.id ? 'editing' : ''}>
                  <td>
                    <div className="timestamp">
                      <Calendar size={14} />
                      {new Date(sale.timestamp).toLocaleDateString('pt-BR')}
                      <br />
                      <small>{new Date(sale.timestamp).toLocaleTimeString('pt-BR')}</small>
                    </div>
                  </td>
                  
                  <td>
                    <span className={`turma-badge ${sale.turma}`}>
                      {sale.turma}
                    </span>
                  </td>
                  
                  <td>
                    <span className="number-display">
                      #{sale.numero.toString().padStart(3, '0')}
                    </span>
                  </td>
                  
                  <td>
                    {editingId === sale.id ? (
                      <input
                        type="text"
                        value={editForm.nome}
                        onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                        placeholder="Nome"
                      />
                    ) : (
                      <div className="buyer-info">
                        <User size={14} />
                        <span>{sale.nome || 'Não informado'}</span>
                      </div>
                    )}
                  </td>
                  
                  <td>
                    {editingId === sale.id ? (
                      <input
                        type="tel"
                        value={editForm.telefone}
                        onChange={(e) => setEditForm({...editForm, telefone: e.target.value})}
                        placeholder="Telefone"
                      />
                    ) : (
                      <div className="phone-info">
                        <Phone size={14} />
                        <span>{sale.telefone || 'Não informado'}</span>
                      </div>
                    )}
                  </td>
                  
                  <td>
                    {editingId === sale.id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      >
                        <option value="pago">Pago</option>
                        <option value="reservado">Reservado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    ) : (
                      renderStatusBadge(sale.status)
                    )}
                  </td>
                  
                  <td>
                    {editingId === sale.id ? (
                      <div className="edit-actions">
                        <button className="btn-icon save" onClick={saveEdit}>
                          <Save size={16} />
                        </button>
                        <button className="btn-icon cancel" onClick={cancelEdit}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button 
                          className="btn-icon edit"
                          onClick={() => startEdit(sale)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        
                        {/* Ações rápidas de status */}
                        <div className="quick-status-actions">
                          {quickActions.map(action => (
                            sale.status !== action.status && (
                              <button
                                key={action.status}
                                className={`status-action ${action.status}`}
                                onClick={() => updateSaleStatus(sale.id, action.status)}
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                            )
                          ))}
                        </div>
                        
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDelete(sale.id)}
                          title="Excluir"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Estatísticas */}
      <div className="stats-footer">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{filteredSales.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pagos:</span>
          <span className="stat-value paid">
            {filteredSales.filter(s => s.status === 'pago').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Reservados:</span>
          <span className="stat-value reserved">
            {filteredSales.filter(s => s.status === 'reservado').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cancelados:</span>
          <span className="stat-value cancelled">
            {filteredSales.filter(s => s.status === 'cancelado').length}
          </span>
        </div>
      </div>

      <style jsx>{`
        .sales-manager {
          padding: 24px;
          background: #f8f9fa;
          min-height: 100vh;
        }
        
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .header-left h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }
        
        .subtitle {
          color: #666;
          font-size: 14px;
          margin: 0;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .btn {
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-primary {
          background: #4CAF50;
          color: white;
        }
        
        .btn-primary:hover {
          background: #45a049;
        }
        
        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          border: 1px solid #ddd;
        }
        
        .btn-secondary:hover {
          background: #e0e0e0;
        }
        
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Filtros */
        .filters-section {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
        }
        
        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        
        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .filter-buttons {
          display: flex;
          gap: 12px;
        }
        
        .filter-buttons select {
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          min-width: 150px;
          background: white;
        }
        
        /* Tabela */
        .sales-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .sales-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .sales-table th {
          background: #f8f9fa;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .sales-table td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .sales-table tr:hover {
          background: #f8f9fa;
        }
        
        .sales-table tr.editing {
          background: #fff8e1;
        }
        
        .empty-state {
          text-align: center;
          padding: 48px !important;
          color: #666;
        }
        
        /* Badges */
        .turma-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .turma-badge.3A {
          background: #FFE6E6;
          color: #FF6B6B;
        }
        
        .turma-badge.3B {
          background: #E6FFFD;
          color: #4ECDC4;
        }
        
        .turma-badge.3TECH {
          background: #FFF9E6;
          color: #FFD166;
        }
        
        .number-display {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 14px;
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }
        
        /* Status Badges */
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .status-badge.paid {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.reserved {
          background: #fff3e0;
          color: #f57c00;
        }
        
        .status-badge.cancelled {
          background: #ffebee;
          color: #c62828;
        }
        
        /* Ações */
        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-icon.edit {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .btn-icon.edit:hover {
          background: #bbdefb;
        }
        
        .btn-icon.save {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .btn-icon.save:hover {
          background: #c8e6c9;
        }
        
        .btn-icon.cancel {
          background: #ffebee;
          color: #c62828;
        }
        
        .btn-icon.cancel:hover {
          background: #ffcdd2;
        }
        
        .btn-icon.delete {
          background: #ffebee;
          color: #c62828;
        }
        
        .btn-icon.delete:hover {
          background: #ffcdd2;
        }
        
        .quick-status-actions {
          display: flex;
          gap: 4px;
        }
        
        .status-action {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          font-size: 12px;
        }
        
        .status-action.pago {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-action.reservado {
          background: #fff3e0;
          color: #f57c00;
        }
        
        .status-action.cancelado {
          background: #ffebee;
          color: #c62828;
        }
        
        .status-action:hover {
          opacity: 0.8;
        }
        
        /* Estatísticas */
        .stats-footer {
          display: flex;
          gap: 24px;
          margin-top: 24px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #666;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #1a1a2e;
        }
        
        .stat-value.paid {
          color: #2e7d32;
        }
        
        .stat-value.reserved {
          color: #f57c00;
        }
        
        .stat-value.cancelled {
          color: #c62828;
        }
        
        /* Inputs de edição */
        .sales-table input,
        .sales-table select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          width: 100%;
        }
        
        .edit-actions {
          display: flex;
          gap: 8px;
        }
        
        @media (max-width: 1024px) {
          .sales-table {
            display: block;
            overflow-x: auto;
          }
          
          .filters-section {
            flex-direction: column;
          }
          
          .search-box {
            min-width: 100%;
          }
        }
        
        @media (max-width: 768px) {
          .sales-manager {
            padding: 16px;
          }
          
          .manager-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .stats-footer {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesManager;