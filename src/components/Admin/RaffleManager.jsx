import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, Download, RefreshCw, 
   CheckCircle, XCircle, 
   Users, AlertCircle,
   Clock, CheckSquare,
  ChevronDown, Edit3, Save, X,
  Calendar, Phone, Hash, User, 
  Shield,  TrendingUp,
} from 'lucide-react';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import './RaffleManager.css';
import toast from 'react-hot-toast';

const RaffleManager = () => {
  const { 
    soldNumbers, 
    isAdmin, 
    isSyncing, 
    lastSync,
    addManualSale,
    removeSale,
    updateSaleStatus,
    exportToCSV,
    loadFromGoogleSheet,
    syncAllPending,
    getStats,
    firebaseConnected
  } = useRaffleManager();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurma, setFilterTurma] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  
  const [formData, setFormData] = useState({
    turma: '3A',
    numero: '',
    nome: '',
    telefone: '',
    status: 'reservado'
  });

  // Estatísticas
  const stats = getStats();
  
  // 🔥 NOVO: Estatísticas em tempo real
  const getRealTimeStats = () => ({
    total: soldNumbers.length,
    pagos: soldNumbers.filter(n => n.status === 'pago').length,
    reservados: soldNumbers.filter(n => n.status === 'reservado').length,
    cancelados: soldNumbers.filter(n => n.status === 'cancelado').length,
    porTurma: {
      '3A': soldNumbers.filter(n => n.turma === '3A').length,
      '3B': soldNumbers.filter(n => n.turma === '3B').length,
      '3TECH': soldNumbers.filter(n => n.turma === '3TECH').length
    },
    arrecadado: soldNumbers.filter(n => n.status === 'pago').length * 15,
    pendente: soldNumbers.filter(n => n.status === 'reservado').length * 15
  });

  const realTimeStats = getRealTimeStats();

  // 🔥 ATUALIZADO: Filtrar e ordenar vendas
  const filteredSales = useMemo(() => {
    let filtered = soldNumbers.filter(sale => {
      const matchesSearch = 
        !searchTerm ||
        sale.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.telefone?.includes(searchTerm) ||
        sale.numero.toString().includes(searchTerm) ||
        sale.turma.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTurma = 
        filterTurma === 'all' || sale.turma === filterTurma;
      
      const matchesStatus = 
        filterStatus === 'all' || sale.status === filterStatus;
      
      return matchesSearch && matchesTurma && matchesStatus;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'timestamp') {
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
      }
      
      if (sortConfig.key === 'numero') {
        aValue = parseInt(a.numero);
        bValue = parseInt(b.numero);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [soldNumbers, searchTerm, filterTurma, filterStatus, sortConfig]);

  // 🔥 NOVO: Função de ordenação
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      turma: '3A',
      numero: '',
      nome: '',
      telefone: '',
      status: 'reservado'
    });
    setEditingSale(null);
  };

  // 🔥 ATUALIZADO: Adicionar venda manual
  const handleAddSale = (e) => {
    e.preventDefault();
    
    if (!formData.numero || !formData.nome) {
      toast.error('Preencha número e nome do comprador');
      return;
    }
    
    const numero = parseInt(formData.numero);
    if (isNaN(numero) || numero < 1 || numero > 300) {
      toast.error('Número deve ser entre 1 e 300');
      return;
    }
    
    // Verificar se número já está vendido
    const isAlreadySold = soldNumbers.some(
      sale => sale.turma === formData.turma && 
             sale.numero === numero && 
             sale.status !== 'cancelado'
    );
    
    if (isAlreadySold && !editingSale) {
      toast.error(`Número ${numero} já está vendido na turma ${formData.turma}`);
      return;
    }
    
    if (editingSale) {
      // Atualizar venda existente
      updateSaleStatus(editingSale.id, formData.status);
      toast.success('✅ Venda atualizada com sucesso!');
    } else {
      // Adicionar nova venda
      addManualSale({
        turma: formData.turma,
        numero: numero,
        nome: formData.nome,
        telefone: formData.telefone,
        status: formData.status
      });
      toast.success('✅ Venda adicionada com sucesso!');
    }
    
    resetForm();
    setShowAddForm(false);
  };

  // 🔥 NOVO: Marcar como pago em lote
  const handleBulkMarkAsPaid = () => {
    if (selectedRows.length === 0) {
      toast.error('Selecione pelo menos uma venda');
      return;
    }
    
    const confirm = window.confirm(
      `Deseja marcar ${selectedRows.length} venda(s) como PAGAS?`
    );
    
    if (!confirm) return;
    
    let successCount = 0;
    selectedRows.forEach(id => {
      const sale = soldNumbers.find(s => s.id === id);
      if (sale && sale.status !== 'pago') {
        updateSaleStatus(id, 'pago');
        successCount++;
      }
    });
    
    toast.success(`✅ ${successCount} venda(s) marcadas como PAGAS!`);
    setSelectedRows([]);
    setShowBulkActions(false);
  };

  // 🔥 NOVO: Marcar como reservado em lote
  const handleBulkMarkAsReserved = () => {
    if (selectedRows.length === 0) {
      toast.error('Selecione pelo menos uma venda');
      return;
    }
    
    const confirm = window.confirm(
      `Deseja marcar ${selectedRows.length} venda(s) como RESERVADAS?`
    );
    
    if (!confirm) return;
    
    let successCount = 0;
    selectedRows.forEach(id => {
      const sale = soldNumbers.find(s => s.id === id);
      if (sale && sale.status !== 'reservado') {
        updateSaleStatus(id, 'reservado');
        successCount++;
      }
    });
    
    toast.success(`✅ ${successCount} venda(s) marcadas como RESERVADAS!`);
    setSelectedRows([]);
    setShowBulkActions(false);
  };

  // 🔥 NOVO: Cancelar em lote
  const handleBulkCancel = () => {
    if (selectedRows.length === 0) {
      toast.error('Selecione pelo menos uma venda');
      return;
    }
    
    const confirm = window.confirm(
      `Deseja CANCELAR ${selectedRows.length} venda(s)? Esta ação não pode ser desfeita.`
    );
    
    if (!confirm) return;
    
    let successCount = 0;
    selectedRows.forEach(id => {
      const sale = soldNumbers.find(s => s.id === id);
      if (sale && sale.status !== 'cancelado') {
        updateSaleStatus(id, 'cancelado');
        successCount++;
      }
    });
    
    toast.success(`✅ ${successCount} venda(s) canceladas!`);
    setSelectedRows([]);
    setShowBulkActions(false);
  };

  // 🔥 NOVO: Selecionar/deselecionar todas
  const toggleSelectAll = () => {
    if (selectedRows.length === filteredSales.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredSales.map(sale => sale.id));
    }
  };

  // 🔥 NOVO: Toggle seleção individual
  const toggleRowSelection = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 🔥 NOVO: Status badge melhorado
  const StatusBadge = ({ status, sale }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'pago':
          return {
            color: '#10B981',
            bg: '#D1FAE5',
            icon: '✅',
            label: 'PAGO'
          };
        case 'reservado':
          return {
            color: '#F59E0B',
            bg: '#FEF3C7',
            icon: '⏳',
            label: 'RESERVADO'
          };
        case 'cancelado':
          return {
            color: '#EF4444',
            bg: '#FEE2E2',
            icon: '❌',
            label: 'CANCELADO'
          };
        default:
          return {
            color: '#6B7280',
            bg: '#F3F4F6',
            icon: '❓',
            label: 'DESCONHECIDO'
          };
      }
    };
    
    const config = getStatusConfig(status);
    
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: config.bg,
          color: config.color,
          border: `1px solid ${config.color}20`
        }}
      >
        <span className="status-icon">{config.icon}</span>
        <span className="status-label">{config.label}</span>
        {sale?.synced === false && (
          <span className="sync-indicator" title="Não sincronizado">🔄</span>
        )}
      </span>
    );
  };

  // 🔥 NOVO: Botão de ação rápida
  const QuickActionButton = ({ icon, label, color, onClick, disabled = false }) => (
    <button
      className="quick-action-btn"
      onClick={onClick}
      disabled={disabled}
      style={{
        '--color': color,
        '--bg': `${color}15`
      }}
    >
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
    </button>
  );

  // 🔥 NOVO: Filtros avançados
  const AdvancedFilters = () => (
    <div className="advanced-filters">
      <div className="filter-group">
        <label>
          <Filter size={14} />
          Status:
        </label>
        <div className="filter-chips">
          {['all', 'pago', 'reservado', 'cancelado'].map(status => (
            <button
              key={status}
              className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'Todos' : 
               status === 'pago' ? '✅ Pagos' :
               status === 'reservado' ? '⏳ Reservados' : '❌ Cancelados'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-group">
        <label>
          <Users size={14} />
          Turma:
        </label>
        <div className="filter-chips">
          {['all', '3A', '3B', '3TECH'].map(turma => (
            <button
              key={turma}
              className={`filter-chip ${filterTurma === turma ? 'active' : ''}`}
              onClick={() => setFilterTurma(turma)}
            >
              {turma === 'all' ? 'Todas' : turma}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Se não for admin, mostrar mensagem
  if (!isAdmin) {
    return (
      <div className="admin-error">
        <AlertCircle size={48} />
        <h2>Acesso Negado</h2>
        <p>Você precisa fazer login como administrador para acessar esta página.</p>
      </div>
    );
  }

  // Função para corrigir o nome da classe CSS
  const getTurmaClass = (turma) => {
    switch(turma) {
      case '3A': return 'turma-3A';
      case '3B': return 'turma-3B';
      case '3TECH': return 'turma-3TECH';
      default: return 'turma-default';
    }
  };

  return (
    <div className="raffle-manager">
      {/* 🔥 ATUALIZADO: Cabeçalho */}
      <div className="manager-header">
        <div className="header-left">
          <h1>🎟️ Gerenciador de Rifas</h1>
          <p className="subtitle">
            <span className="stat-badge total">{realTimeStats.total} vendas</span>
            <span className="stat-badge paid">💰 {realTimeStats.pagos} pagas</span>
            <span className="stat-badge reserved">⏳ {realTimeStats.reservados} reservadas</span>
            <span className="stat-badge revenue">💵 R$ {realTimeStats.arrecadado}</span>
          </p>
        </div>
        
        <div className="header-right">
          <div className="sync-status">
            {isSyncing ? (
              <span className="syncing">
                <RefreshCw size={16} className="spin" />
                <span>Sincronizando...</span>
              </span>
            ) : firebaseConnected ? (
              <span className="success">
                <CheckCircle size={16} />
                <span>
                  ✅ Conectado
                  {lastSync && (
                    <span className="last-sync">
                      • {new Date(lastSync).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </span>
              </span>
            ) : (
              <span className="warning">
                <AlertCircle size={16} />
                <span>⚠️ Offline</span>
              </span>
            )}
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-icon"
              onClick={() => setShowFilters(!showFilters)}
              title="Filtros"
            >
              <Filter size={18} />
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={syncAllPending}
              disabled={isSyncing || !firebaseConnected}
            >
              <RefreshCw size={18} className={isSyncing ? 'spin' : ''} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={18} />
              Nova Venda
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 NOVO: Filtros avançados */}
      {showFilters && <AdvancedFilters />}

      {/* 🔥 ATUALIZADO: Estatísticas em destaque */}
      <div className="highlight-stats">
        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">R$ {realTimeStats.arrecadado}</span>
            <span className="stat-label">Arrecadado (pagos)</span>
            <span className="stat-trend">
              <TrendingUp size={12} />
              +R$ {realTimeStats.pendente} pendente
            </span>
          </div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-icon">🎟️</div>
          <div className="stat-info">
            <span className="stat-value">{realTimeStats.total}</span>
            <span className="stat-label">Vendas Totais</span>
            <div className="stat-breakdown">
              <span className="breakdown-item paid">✅ {realTimeStats.pagos} pagas</span>
              <span className="breakdown-item reserved">⏳ {realTimeStats.reservados} reservadas</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="class-breakdown">
              <div className="class-item">
                <span className="class-name">3º A:</span>
                <span className="class-count">{realTimeStats.porTurma['3A']}</span>
              </div>
              <div className="class-item">
                <span className="class-name">3º B:</span>
                <span className="class-count">{realTimeStats.porTurma['3B']}</span>
              </div>
              <div className="class-item">
                <span className="class-name">3º TECH:</span>
                <span className="class-count">{realTimeStats.porTurma['3TECH']}</span>
              </div>
            </div>
            <span className="stat-label">Vendas por Turma</span>
          </div>
        </div>
      </div>

      {/* 🔥 ATUALIZADO: Barra de busca e ações */}
      <div className="action-bar">
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, número ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="action-buttons">
          {selectedRows.length > 0 && (
            <>
              <button 
                className="btn btn-success"
                onClick={handleBulkMarkAsPaid}
              >
                <CheckSquare size={16} />
                Marcar como Pago ({selectedRows.length})
              </button>
              
              <button 
                className="btn btn-warning"
                onClick={handleBulkMarkAsReserved}
              >
                <Clock size={16} />
                Marcar como Reservado
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={handleBulkCancel}
              >
                <XCircle size={16} />
                Cancelar
              </button>
              
              <button 
                className="btn btn-icon"
                onClick={() => setSelectedRows([])}
                title="Limpar seleção"
              >
                <X size={16} />
              </button>
            </>
          )}
          
          <button 
            className="btn btn-secondary"
            onClick={exportToCSV}
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* 🔥 ATUALIZADO: Tabela de vendas */}
      <div className="sales-table-container">
        <div className="table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredSales.length && filteredSales.length > 0}
                    onChange={toggleSelectAll}
                    disabled={filteredSales.length === 0}
                  />
                </th>
                <th 
                  className="sortable"
                  onClick={() => requestSort('timestamp')}
                >
                  <div className="th-content">
                    <Calendar size={14} />
                    <span>Data/Hora</span>
                    {sortConfig.key === 'timestamp' && (
                      <ChevronDown size={12} className={sortConfig.direction === 'desc' ? 'desc' : 'asc'} />
                    )}
                  </div>
                </th>
                <th onClick={() => requestSort('turma')}>
                  <div className="th-content">
                    <span>Turma</span>
                    {sortConfig.key === 'turma' && (
                      <ChevronDown size={12} className={sortConfig.direction === 'desc' ? 'desc' : 'asc'} />
                    )}
                  </div>
                </th>
                <th onClick={() => requestSort('numero')}>
                  <div className="th-content">
                    <Hash size={14} />
                    <span>Número</span>
                    {sortConfig.key === 'numero' && (
                      <ChevronDown size={12} className={sortConfig.direction === 'desc' ? 'desc' : 'asc'} />
                    )}
                  </div>
                </th>
                <th onClick={() => requestSort('nome')}>
                  <div className="th-content">
                    <User size={14} />
                    <span>Comprador</span>
                    {sortConfig.key === 'nome' && (
                      <ChevronDown size={12} className={sortConfig.direction === 'desc' ? 'desc' : 'asc'} />
                    )}
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Phone size={14} />
                    <span>Telefone</span>
                  </div>
                </th>
                <th onClick={() => requestSort('status')}>
                  <div className="th-content">
                    <span>Status</span>
                    {sortConfig.key === 'status' && (
                      <ChevronDown size={12} className={sortConfig.direction === 'desc' ? 'desc' : 'asc'} />
                    )}
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <Shield size={14} />
                    <span>Sinc.</span>
                  </div>
                </th>
                <th className="actions-column">Ações</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    <div className="empty-content">
                      <Search size={48} />
                      <p>Nenhuma venda encontrada</p>
                      {searchTerm && (
                        <button 
                          className="btn btn-link"
                          onClick={() => setSearchTerm('')}
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr 
                    key={sale.id}
                    className={selectedRows.includes(sale.id) ? 'selected' : ''}
                  >
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(sale.id)}
                        onChange={() => toggleRowSelection(sale.id)}
                      />
                    </td>
                    
                    <td>
                      <div className="timestamp-cell">
                        <div className="date">
                          {new Date(sale.timestamp).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="time">
                          {new Date(sale.timestamp).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </td>
                    
                    {/* CORREÇÃO AQUI: Alterado para usar getTurmaClass */}
                    <td>
                      <span className={`turma-badge ${getTurmaClass(sale.turma)}`}>
                        {sale.turma}
                      </span>
                    </td>
                    
                    <td>
                      <div className="number-cell">
                        <span className="number-display">
                          #{sale.numero.toString().padStart(3, '0')}
                        </span>
                      </div>
                    </td>
                    
                    <td>
                      <div className="buyer-cell">
                        <div className="buyer-name">
                          {sale.nome || 'Não informado'}
                        </div>
                        {sale.source === 'manual' && (
                          <span className="source-badge" title="Venda manual">✏️</span>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <div className="phone-cell">
                        {sale.telefone ? (
                          <>
                            <Phone size={12} />
                            <span>{sale.telefone}</span>
                          </>
                        ) : (
                          <span className="empty-field">—</span>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      <StatusBadge status={sale.status} sale={sale} />
                    </td>
                    
                    <td>
                      {sale.synced ? (
                        <span className="sync-badge success" title="Sincronizado">
                          <CheckCircle size={14} />
                        </span>
                      ) : (
                        <span className="sync-badge warning" title="Não sincronizado">
                          <AlertCircle size={14} />
                        </span>
                      )}
                    </td>
                    
                    <td className="actions-column">
                      <div className="action-buttons">
                        {/* 🔥 NOVO: Botões de ação rápida por status */}
                        {sale.status !== 'pago' && (
                          <button
                            className="action-btn success"
                            onClick={() => updateSaleStatus(sale.id, 'pago')}
                            title="Marcar como Pago"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        
                        {sale.status !== 'reservado' && (
                          <button
                            className="action-btn warning"
                            onClick={() => updateSaleStatus(sale.id, 'reservado')}
                            title="Marcar como Reservado"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        
                        {sale.status !== 'cancelado' && (
                          <button
                            className="action-btn danger"
                            onClick={() => {
                              if (window.confirm('Deseja cancelar esta venda?')) {
                                updateSaleStatus(sale.id, 'cancelado');
                              }
                            }}
                            title="Cancelar Venda"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        
                        <button
                          className="action-btn info"
                          onClick={() => {
                            setEditingSale(sale);
                            setFormData({
                              turma: sale.turma,
                              numero: sale.numero.toString(),
                              nome: sale.nome || '',
                              telefone: sale.telefone || '',
                              status: sale.status || 'reservado'
                            });
                            setShowAddForm(true);
                          }}
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* 🔥 NOVO: Paginação e resumo */}
        <div className="table-footer">
          <div className="footer-info">
            Mostrando <strong>{filteredSales.length}</strong> de <strong>{soldNumbers.length}</strong> vendas
            {searchTerm && ` • Busca: "${searchTerm}"`}
          </div>
          
          <div className="footer-actions">
            <button 
              className="btn btn-link"
              onClick={exportToCSV}
            >
              <Download size={14} />
              Exportar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 ATUALIZADO: Modal Adicionar/Editar Venda */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingSale ? '✏️ Editar Venda' : '➕ Nova Venda Manual'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSale}>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    <span className="label-icon">👥</span>
                    Turma *
                  </label>
                  <div className="class-selector">
                    {['3A', '3B', '3TECH'].map(turma => (
                      <button
                        key={turma}
                        type="button"
                        className={`class-option ${formData.turma === turma ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, turma})}
                      >
                        {turma}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>
                    <span className="label-icon">🔢</span>
                    Número (1-300) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    required
                    placeholder="Ex: 42"
                    className="number-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <span className="label-icon">👤</span>
                    Nome do Comprador *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                    placeholder="Nome completo"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <span className="label-icon">📱</span>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <span className="label-icon">🏷️</span>
                    Status *
                  </label>
                  <div className="status-selector">
                    {[
                      { value: 'pago', label: '✅ Pago', color: '#10B981' },
                      { value: 'reservado', label: '⏳ Reservado', color: '#F59E0B' },
                      { value: 'cancelado', label: '❌ Cancelado', color: '#EF4444' }
                    ].map(status => (
                      <button
                        key={status.value}
                        type="button"
                        className={`status-option ${formData.status === status.value ? 'selected' : ''}`}
                        onClick={() => setFormData({...formData, status: status.value})}
                        style={{
                          '--status-color': status.color
                        }}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Save size={16} />
                  {editingSale ? 'Atualizar Venda' : 'Salvar Venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 NOVO: Quick Actions Bar */}
      <div className="quick-actions-bar">
        <div className="actions-title">⚡ Ações Rápidas:</div>
        <div className="quick-actions-grid">
          <QuickActionButton
            icon="✅"
            label="Marcar Reservados como Pagos"
            color="#10B981"
            onClick={() => {
              const reservados = filteredSales.filter(s => s.status === 'reservado');
              if (reservados.length === 0) {
                toast.error('Nenhuma venda reservada encontrada');
                return;
              }
              const confirm = window.confirm(`Marcar ${reservados.length} venda(s) reservadas como PAGAS?`);
              if (confirm) {
                reservados.forEach(sale => updateSaleStatus(sale.id, 'pago'));
                toast.success(`✅ ${reservados.length} venda(s) marcadas como PAGAS!`);
              }
            }}
          />
          
          <QuickActionButton
            icon="🔄"
            label="Sincronizar Tudo"
            color="#3B82F6"
            onClick={syncAllPending}
            disabled={isSyncing}
          />
          
          <QuickActionButton
            icon="📊"
            label="Ver Relatórios"
            color="#8B5CF6"
            onClick={() => {
              // Função para gerar relatório rápido
              const report = `
🎟️ RELATÓRIO RÁPIDO - ${new Date().toLocaleDateString('pt-BR')}

📈 ESTATÍSTICAS:
• Total de Vendas: ${realTimeStats.total}
• Pagas: ${realTimeStats.pagos} (R$ ${realTimeStats.arrecadado})
• Reservadas: ${realTimeStats.reservados} (R$ ${realTimeStats.pendente} pendente)
• Canceladas: ${realTimeStats.cancelados}

👥 POR TURMA:
• 3º A: ${realTimeStats.porTurma['3A']} vendas
• 3º B: ${realTimeStats.porTurma['3B']} vendas  
• 3º TECH: ${realTimeStats.porTurma['3TECH']} vendas

💰 ARRECADAÇÃO TOTAL: R$ ${realTimeStats.arrecadado}
💸 PENDENTE: R$ ${realTimeStats.pendente}
              `;
              
              alert(report);
            }}
          />
          
          <QuickActionButton
            icon="🎯"
            label="Exportar Tudo"
            color="#EC4899"
            onClick={exportToCSV}
          />
        </div>
      </div>
    </div>
  );
};

export default RaffleManager;