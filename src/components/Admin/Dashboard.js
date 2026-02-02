import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, AlertCircle, CheckCircle,
  ChevronRight,
  RefreshCw, DollarSign, Users, TrendingUp,
  Clock, Check, Loader2
} from 'lucide-react';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { getStats, soldNumbers, lastSync, refreshData } = useRaffleManager();
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(false);

  // Funções auxiliares para formatação
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getLastSyncTime = () => {
    if (!lastSync) return 'Não sincronizado';
    try {
      const date = new Date(lastSync);
      if (isNaN(date.getTime())) return 'Data inválida';
      return `Sincronizado ${date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } catch {
      return 'Data inválida';
    }
  };

  // Função segura para formatar data
  const formatDateSafe = (dateString) => {
    if (!dateString) return 'Data não informada';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Tentar parse manualmente para formatos comuns
        if (dateString.includes('T')) {
          const isoDate = dateString.split('T')[0];
          return new Date(isoDate).toLocaleDateString('pt-BR');
        }
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  // Função segura para formatar hora
  const formatTimeSafe = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const getFilteredRecentSales = useCallback(() => {
    let filtered = [...soldNumbers];
    
    // Garantir que todas as vendas têm timestamp
    filtered = filtered.map(sale => ({
      ...sale,
      timestamp: sale.timestamp || new Date().toISOString()
    }));
    
    // Aplicar filtro
    if (activeFilter === 'paid') {
      filtered = filtered.filter(sale => sale.status === 'pago');
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter(sale => sale.status === 'pendente');
    } else if (activeFilter === 'reserved') {
      filtered = filtered.filter(sale => sale.status === 'reservado');
    } else if (activeFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(sale => {
        try {
          const saleDate = new Date(sale.timestamp);
          return !isNaN(saleDate.getTime()) && saleDate.toDateString() === today;
        } catch {
          return false;
        }
      });
    } else if (activeFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(sale => {
        try {
          const saleDate = new Date(sale.timestamp);
          return !isNaN(saleDate.getTime()) && saleDate >= oneWeekAgo;
        } catch {
          return false;
        }
      });
    }
    
    // Ordenar por data (mais recente primeiro)
    return filtered
      .sort((a, b) => {
        try {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          return dateB - dateA;
        } catch {
          return 0;
        }
      })
      .slice(0, 10);
  }, [soldNumbers, activeFilter]);

  // Função para atualizar dados
  const handleRefresh = () => {
    setLoading(true);
    if (refreshData) {
      refreshData();
    }
    
    setTimeout(() => {
      try {
        const newStats = getStats();
        setStats(newStats);
        setRecentSales(getFilteredRecentSales());
        toast.success('Dashboard atualizado!');
      } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
        toast.error('Erro ao atualizar dashboard');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  // Inicializar dados
  useEffect(() => {
    console.log('📊 Dashboard - Inicializando...');
    console.log('📊 Números vendidos:', soldNumbers);
    
    try {
      const initialStats = getStats();
      setStats(initialStats);
      setRecentSales(getFilteredRecentSales());
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar dados do dashboard');
    }
    
    // Escutar eventos de atualização
    const handleNewSale = () => {
      console.log('🔄 Dashboard - Nova venda detectada, atualizando...');
      try {
        const newStats = getStats();
        setStats(newStats);
        setRecentSales(getFilteredRecentSales());
      } catch (error) {
        console.error('Erro ao atualizar após evento:', error);
      }
    };
    
    window.addEventListener('new_sale_added', handleNewSale);
    window.addEventListener('data_refreshed', handleNewSale);
    window.addEventListener('firebase_data_updated', handleNewSale);
    
    return () => {
      window.removeEventListener('new_sale_added', handleNewSale);
      window.removeEventListener('data_refreshed', handleNewSale);
      window.removeEventListener('firebase_data_updated', handleNewSale);
    };
  }, [soldNumbers, activeFilter, getStats, getFilteredRecentSales]); // Adicionadas dependências

  // Atualizar quando o filtro mudar
  useEffect(() => {
    setRecentSales(getFilteredRecentSales());
  }, [activeFilter, soldNumbers, getFilteredRecentSales]); // Adicionada dependência

  // Obter status formatado para exibição - CORRIGIDO PARA RESERVADO
  const getStatusBadge = (status, paymentMethod) => {
    if (!status) {
      return {
        text: 'DESCONHECIDO',
        className: 'status-badge desconhecido',
        icon: <AlertCircle size={12} />
      };
    }
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('pago') || statusLower === 'paid') {
      return {
        text: 'PAGO',
        className: 'status-badge pago',
        icon: <Check size={12} />
      };
    } else if (statusLower.includes('pendente') || statusLower === 'pending') {
      return {
        text: paymentMethod === 'dinheiro' ? 'AGUARDANDO DINHEIRO' : 'PENDENTE',
        className: 'status-badge pendente',
        icon: <Clock size={12} />
      };
    } else if (statusLower.includes('reservado') || statusLower === 'reserved' || statusLower === 'reservado') {
      return {
        text: 'RESERVADO',
        className: 'status-badge reservado',
        icon: <AlertCircle size={12} />
      };
    } else {
      return {
        text: status.toUpperCase(),
        className: 'status-badge desconhecido',
        icon: <AlertCircle size={12} />
      };
    }
  };

  // Obter método de pagamento formatado
  const getPaymentMethodIcon = (paymentMethod, status) => {
    if (!paymentMethod) {
      if (status === 'pendente' || status === 'pending') {
        return '⏳';
      }
      return '💳';
    }
    
    if (paymentMethod.toLowerCase().includes('pix')) {
      return '💳';
    } else if (paymentMethod.toLowerCase().includes('dinheiro') || paymentMethod.toLowerCase().includes('cash')) {
      return status === 'pago' || status === 'paid' ? '💰' : '⏳';
    }
    return '💳';
  };

  return (
    <div className="dashboard-container">
      {/* Cabeçalho com ações */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Dashboard</h1>
          <div className="date-display">
            <Calendar size={16} />
            <span>{getCurrentDate()}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="sync-status">
            <CheckCircle size={16} />
            <span>{getLastSyncTime()}</span>
          </div>
          
          <button 
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="spinning" />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {/* Filtros - ADICIONADO FILTRO RESERVADO */}
      <div className="time-filters">
        <button 
          className={`time-filter ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Todos
        </button>
        <button 
          className={`time-filter ${activeFilter === 'paid' ? 'active' : ''}`}
          onClick={() => setActiveFilter('paid')}
        >
          Pago
        </button>
        <button 
          className={`time-filter ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          Pendente
        </button>
        <button 
          className={`time-filter ${activeFilter === 'reserved' ? 'active' : ''}`}
          onClick={() => setActiveFilter('reserved')}
        >
          Reservado
        </button>
        <button 
          className={`time-filter ${activeFilter === 'today' ? 'active' : ''}`}
          onClick={() => setActiveFilter('today')}
        >
          Hoje
        </button>
        <button 
          className={`time-filter ${activeFilter === 'week' ? 'active' : ''}`}
          onClick={() => setActiveFilter('week')}
        >
          Esta Semana
        </button>
      </div>

      {/* Resumo estatístico */}
      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-header">
            <DollarSign size={20} />
            <h3>Total Arrecadado</h3>
          </div>
          <div className="summary-value">{formatCurrency(stats.arrecadado || 0)}</div>
          <div className="summary-subtitle">
            <TrendingUp size={14} />
            <span>Rifas pagas: {stats.totalSold || 0}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-header">
            <Users size={20} />
            <h3>Rifas Vendidas</h3>
          </div>
          <div className="summary-value">{stats.totalSold || 0}</div>
          <div className="summary-subtitle">
            <span>Pendentes: {stats.totalPending || 0}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-header">
            <Clock size={20} />
            <h3>Aguardando Pagamento</h3>
          </div>
          <div className="summary-value">{stats.totalPending || 0}</div>
          <div className="summary-subtitle">
            <span>Dinheiro: {stats.totalPending || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabela de vendas recentes */}
      <div className="recent-sales">
        <div className="section-header">
          <div>
            <h2>Vendas Recentes</h2>
            <p className="section-subtitle">
              Mostrando {recentSales.length} vendas • 
              <span className="filter-info"> Filtro: {
                activeFilter === 'all' ? 'Todos' :
                activeFilter === 'paid' ? 'Pago' :
                activeFilter === 'pending' ? 'Pendente' :
                activeFilter === 'reserved' ? 'Reservado' :
                activeFilter === 'today' ? 'Hoje' : 'Esta semana'
              }</span>
            </p>
          </div>
          <button className="view-all">
            Ver todas
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="sales-table-container">
          {recentSales.length > 0 ? (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>DATA/HORA</th>
                  <th>TURMA</th>
                  <th>NÚMERO</th>
                  <th>COMPRADOR</th>
                  <th>PAGAMENTO</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, index) => {
                  const statusInfo = getStatusBadge(sale.status, sale.paymentMethod);
                  const paymentIcon = getPaymentMethodIcon(sale.paymentMethod, sale.status);
                  
                  return (
                    <tr key={`${sale.id || index}-${index}`}>
                      <td>
                        <div className="datetime-cell">
                          <span className="date">
                            {formatDateSafe(sale.timestamp)}
                          </span>
                          <span className="time">
                            {formatTimeSafe(sale.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="turma-badge">{sale.turma || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="number-badge">
                          #{sale.numero?.toString().padStart(3, '0') || '000'}
                        </span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <strong>{sale.nome || 'Não informado'}</strong>
                          {sale.telefone && (
                            <small>{sale.telefone}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="payment-method">
                          <span className="payment-icon">{paymentIcon}</span>
                          <span className="payment-text">
                            {sale.paymentMethod === 'pix' ? 'PIX' : 
                             sale.paymentMethod === 'dinheiro' ? 'Dinheiro' : 
                             sale.paymentMethod || 'Não informado'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={statusInfo.className}>
                          {statusInfo.icon}
                          <span>{statusInfo.text}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <AlertCircle size={48} />
              <h3>Nenhuma venda encontrada</h3>
              <p>Não há vendas para o filtro selecionado.</p>
              <button 
                className="btn-view-all"
                onClick={() => setActiveFilter('all')}
              >
                Ver todas as vendas
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
       .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .dashboard-container {
          padding: 20px;
          background: #f8f9fa;
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
        }

        /* Cabeçalho */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-title h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 8px 0;
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sync-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #e8f5e9;
          border-radius: 8px;
          color: #2e7d32;
          font-size: 14px;
          white-space: nowrap;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          color: #666;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          background: #f8f9fa;
          border-color: #ccc;
        }

        .refresh-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Filtros de tempo */
        .time-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .time-filters::-webkit-scrollbar {
          display: none;
        }

        .time-filter {
          padding: 10px 20px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .time-filter:hover {
          background: #f8f9fa;
          border-color: #ccc;
        }

        .time-filter.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        /* Resumo estatístico */
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .summary-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          margin: 0;
        }

        .summary-value {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a2e;
          line-height: 1;
          margin-bottom: 8px;
        }

        .summary-subtitle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
        }

        /* Cards de estatísticas */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .stat-header h3 {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          background: #f8f9fa;
        }

        .trend.positive {
          color: #2ecc71;
        }

        .trend.negative {
          color: #e74c3c;
        }

        .trend.neutral {
          color: #666;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #1a1a2e;
          line-height: 1;
          margin-bottom: 16px;
        }

        .stat-progress {
          margin-top: 16px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #f0f0f0;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-bar.small {
          width: 60px;
          height: 4px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          color: #666;
        }

        .stat-details {
          margin-top: 16px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-item span {
          font-size: 13px;
        }

        .detail-value {
          font-weight: 600;
          color: #333;
        }

        .detail-value.pending {
          color: #f57c00;
        }

        /* Turma stats */
        .turma-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .turma-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .turma-name {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .turma-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .turma-value {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          min-width: 30px;
          text-align: right;
        }

        .turma-progress {
          display: flex;
          align-items: center;
        }

        /* Vendas recentes */
        .recent-sales {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
        }

        .section-subtitle {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        .filter-info {
          color: #667eea;
          font-weight: 500;
          margin-left: 4px;
        }

        .view-all {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .view-all:hover {
          background: #f0f2ff;
        }

        .sales-table-container {
          overflow-x: auto;
        }

        .sales-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .sales-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #f0f0f0;
          background: white;
        }

        .sales-table td {
          padding: 16px;
          border-bottom: 1px solid #f8f9fa;
          font-size: 14px;
          color: #333;
        }

        .sales-table tr:last-child td {
          border-bottom: none;
        }

        .sales-table tr:hover td {
          background: #f8f9fa;
        }

        .datetime-cell {
          display: flex;
          flex-direction: column;
        }

        .date {
          font-weight: 500;
        }

        .time {
          font-size: 12px;
          color: #666;
        }

        .turma-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #f0f2ff;
          color: #667eea;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .number-badge {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          color: #333;
          font-size: 14px;
        }

        .customer-cell {
          display: flex;
          flex-direction: column;
        }

        .customer-cell small {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .payment-icon {
          font-size: 16px;
        }

        .payment-text {
          font-size: 13px;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          min-width: 120px;
          justify-content: center;
        }

        .status-badge.pago {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.pendente {
          background: #fff3e0;
          color: #f57c00;
        }

        .status-badge.reservado {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-badge.desconhecido {
          background: #f5f5f5;
          color: #666;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .empty-state h3 {
          margin: 16px 0 8px;
          font-size: 18px;
          color: #666;
        }

        .empty-state p {
          margin-bottom: 20px;
          font-size: 14px;
        }

        .btn-view-all {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-view-all:hover {
          background: #5a6fd8;
        }

        /* Status cards */
        .status-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .status-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border-top: 4px solid;
        }

        .status-card.paid {
          border-color: #2e7d32;
        }

        .status-card.pending {
          border-color: #f57c00;
        }

        .status-card.reserved {
          border-color: #1976d2;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .status-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .status-count {
          font-size: 32px;
          font-weight: 800;
          color: #1a1a2e;
          line-height: 1;
          margin-bottom: 8px;
        }

        .status-percentage {
          font-size: 13px;
          color: #666;
        }

        /* System info */
        .system-info {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .system-info h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 16px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 14px;
          color: #666;
        }

        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .info-value.connected {
          color: #2e7d32;
        }

        .info-value.disconnected {
          color: #e74c3c;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .header-actions {
            justify-content: space-between;
          }

          .stats-summary,
          .stats-cards,
          .status-cards {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 28px;
          }

          .recent-sales {
            padding: 16px;
          }

          .sales-table th,
          .sales-table td {
            padding: 12px 8px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .view-all {
            align-self: flex-start;
          }
        }

        @media (min-width: 769px) and (max-width: 1023px) {
          .dashboard-container {
            padding: 24px;
          }

          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .dashboard-container {
            padding: 32px;
          }

          .header-title h1 {
            font-size: 28px;
          }

          .stat-value {
            font-size: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;