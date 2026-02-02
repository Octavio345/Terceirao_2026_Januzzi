import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Heart, Check, 
  Ticket, Search, AlertCircle, CheckCircle, 
  Users, X, RefreshCw, Eye, EyeOff,
  Tag, Shield, Clock, Award, Grid
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRaffleManager } from '../../context/RaffleManagerContext';
import './RaffleProductCard.css';

const RaffleProductCard = ({ product, index, viewMode = 'grid' }) => {
  const { addToCart, openCart } = useCart();
  const raffleManager = useRaffleManager();
  
  const getAvailableNumbers = useMemo(() => 
    raffleManager?.getAvailableNumbers || (() => []),
    [raffleManager?.getAvailableNumbers]
  );
  
  const normalizeTurma = useMemo(() => 
    raffleManager?.normalizeTurma || ((turma) => {
      if (!turma) return '3° A';
      const turmaStr = turma.toString().trim();
      const mapping = {
        '3A': '3° A',
        '3B': '3° B', 
        '3TECH': '3° TECH',
        '3 A': '3° A',
        '3 B': '3° B',
        '3 TECH': '3° TECH',
        '3°A': '3° A',
        '3°B': '3° B',
        '3°TECH': '3° TECH',
      };
      if (['3° A', '3° B', '3° TECH'].includes(turmaStr)) return turmaStr;
      return mapping[turmaStr] || '3° A';
    }),
    [raffleManager?.normalizeTurma]
  );
  
  const isSyncing = raffleManager?.isSyncing || false;
  const firebaseConnected = raffleManager?.firebaseConnected || false;
  
  const soldNumbers = useMemo(() => 
    raffleManager?.soldNumbers || [], 
    [raffleManager?.soldNumbers]
  );
  
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedClass, setSelectedClass] = useState('3A');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [searchNumber, setSearchNumber] = useState('');
  const [page, setPage] = useState(1);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [showSoldNumbers, setShowSoldNumbers] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(true);
  const [bannerLoaded, setBannerLoaded] = useState(true);
  
  const numbersPerPage = 36;

  const classColors = useMemo(() => ({
    '3A': {
      primary: '#FF6B6B',
      secondary: '#FFF5F5',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
      light: '#FFF0F0'
    },
    '3B': {
      primary: '#4ECDC4',
      secondary: '#F0FFFF',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #6EDBD6 100%)',
      light: '#E8FFFF'
    },
    '3TECH': {
      primary: '#FFD166',
      secondary: '#FFFDF5',
      gradient: 'linear-gradient(135deg, #FFD166 0%, #FFE082 100%)',
      light: '#FFF9E6'
    }
  }), []);

  const classes = useMemo(() => ({
    '3A': {
      name: '3º ANO A',
      description: 'Turma do Ensino Médio Regular',
      range: { start: 1, end: 300 },
      color: classColors['3A'].primary,
      gradient: classColors['3A'].gradient,
      light: classColors['3A'].light,
      emoji: '👨‍🎓',
      sold: new Set(),
      availableCount: 300,
      status: '300 números disponíveis'
    },
    '3B': {
      name: '3º ANO B',
      description: 'Turma do Ensino Médio Regular',
      range: { start: 1, end: 300},
      color: classColors['3B'].primary,
      gradient: classColors['3B'].gradient,
      light: classColors['3B'].light,
      emoji: '👩‍🎓',
      sold: new Set(),
      availableCount: 300,
      status: '300 números disponíveis'
    },
    '3TECH': {
      name: '3º TECH',
      description: 'Turma do Ensino Técnico',
      range: { start: 1, end: 300 },
      color: classColors['3TECH'].primary,
      gradient: classColors['3TECH'].gradient,
      light: classColors['3TECH'].light,
      emoji: '💻',
      sold: new Set(),
      availableCount: 300,
      status: '300 números disponíveis'
    }
  }), [classColors]); 

  useEffect(() => {
    const updateNumbers = () => {
      setIsLoadingNumbers(true);
      try {
        let numbers;
        if (typeof getAvailableNumbers === 'function') {
          // Usar turma normalizada para buscar números disponíveis
          const normalizedTurma = normalizeTurma(selectedClass);
          numbers = getAvailableNumbers(normalizedTurma);
        } else {
          numbers = Array.from({ length: 300 }, (_, i) => i + 1);
        }
        
        setAvailableNumbers(numbers);
        
        const normalizedSelectedClass = normalizeTurma(selectedClass);
        const soldInClass = soldNumbers.filter(s => 
          normalizeTurma(s.turma) === normalizedSelectedClass && 
          s.status !== 'cancelado'
        );
        
        if (classes[selectedClass]) {
          classes[selectedClass].sold = new Set(soldInClass.map(s => s.numero));
          classes[selectedClass].availableCount = 300 - soldInClass.length;
          classes[selectedClass].status = `${classes[selectedClass].availableCount} números disponíveis • ${soldInClass.length} vendidos`;
        }
        
        setIsLoadingNumbers(false);
      } catch (error) {
        console.error('Erro ao obter números disponíveis:', error);
        setAvailableNumbers(Array.from({ length: 300 }, (_, i) => i + 1));
        setIsLoadingNumbers(false);
      }
    };
    
    updateNumbers();
  }, [selectedClass, soldNumbers, getAvailableNumbers, classes, normalizeTurma]);

  const filteredNumbers = useMemo(() => {
    const allNumbers = Array.from({ length: 300 }, (_, i) => i + 1);
    
    const getSaleDetails = (number) => {
      const normalizedSelectedClass = normalizeTurma(selectedClass);
      const sale = soldNumbers.find(s => 
        normalizeTurma(s.turma) === normalizedSelectedClass && 
        s.numero === number &&
        s.status !== 'cancelado'
      );
      
      if (sale) {
        return {
          status: sale.status || 'pago',
          nome: sale.nome || 'Comprador',
          timestamp: sale.timestamp ? new Date(sale.timestamp).toLocaleDateString('pt-BR') : '',
          isPaid: sale.status === 'pago'
        };
      }
      
      return null;
    };
    
    let filtered = allNumbers.map(num => {
      const saleDetails = getSaleDetails(num);
      const isAvailable = availableNumbers.includes(num);
      const normalizedSelectedClass = normalizeTurma(selectedClass);
      const isSold = soldNumbers.some(s => 
        normalizeTurma(s.turma) === normalizedSelectedClass && 
        s.numero === num && 
        s.status === 'pago'
      );
      const isReserved = !isAvailable && !isSold && saleDetails?.status === 'reservado';
      
      return {
        number: num,
        display: num.toString().padStart(3, '0'),
        selected: selectedNumbers.includes(num),
        sold: isSold,
        reserved: isReserved,
        saleDetails: saleDetails,
        isAvailable: isAvailable
      };
    });

    if (filterMode === 'available') {
      filtered = filtered.filter(num => num.isAvailable);
    } else if (filterMode === 'sold') {
      filtered = filtered.filter(num => num.sold || num.reserved);
    } else if (filterMode === 'reserved') {
      filtered = filtered.filter(num => num.reserved);
    }
    
    if (searchNumber.trim()) {
      const searchNum = parseInt(searchNumber);
      if (isNaN(searchNum)) {
        filtered = filtered.filter(num => 
          num.number.toString().includes(searchNumber) ||
          (num.saleDetails?.nome?.toLowerCase() || '').includes(searchNumber.toLowerCase())
        );
      } else {
        filtered = filtered.filter(num => num.number === searchNum);
      }
    }

    return filtered;
  }, [availableNumbers, searchNumber, selectedNumbers, selectedClass, filterMode, soldNumbers, normalizeTurma]);

  const totalPages = Math.ceil(filteredNumbers.length / numbersPerPage);
  const startIndex = (page - 1) * numbersPerPage;
  const endIndex = startIndex + numbersPerPage;
  const currentNumbers = filteredNumbers.slice(startIndex, endIndex);

  const handleNumberClick = (number, isSold, isReserved, saleDetails) => {
    if (isSold || isReserved) {
      let message = `🎟️ Número ${number.toString().padStart(3, '0')}\n`;
      
      if (saleDetails) {
        if (saleDetails.status === 'reservado') {
          message += `📌 Status: ⏳ RESERVADO (Aguardando pagamento)\n`;
          const expires = saleDetails.expiresAt ? new Date(saleDetails.expiresAt) : null;
          if (expires) {
            const minutesLeft = Math.max(0, Math.floor((expires - Date.now()) / 60000));
            message += `⏰ Expira em: ${minutesLeft} minutos\n`;
          }
        } else {
          message += `📌 Status: ✅ PAGO\n`;
        }
        message += `👤 Comprador: ${saleDetails.nome}\n`;
        if (saleDetails.timestamp) {
          message += `📅 Data: ${saleDetails.timestamp}\n`;
        }
      }
      
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'info', 
          message,
          duration: 5000 
        }
      }));
      return;
    }
    
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        if (prev.length >= 20) {
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: { type: 'warning', message: 'Limite máximo de 20 números', duration: 3000 }
          }));
          return prev;
        }
        
        if (!availableNumbers.includes(number)) {
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: { 
              type: 'error', 
              message: `❌ Número ${number.toString().padStart(3, '0')} foi vendido/reservado enquanto você escolhia!`,
              duration: 4000 
            }
          }));
          return prev;
        }
        
        return [...prev, number];
      }
    });
  };

  const handleAddToCart = () => {
    if (selectedNumbers.length === 0) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { type: 'warning', message: 'Selecione números primeiro', duration: 3000 }
      }));
      return;
    }
    
    const justSoldNumbers = selectedNumbers.filter(num => !availableNumbers.includes(num));
    if (justSoldNumbers.length > 0) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'error', 
          message: `❌ ${justSoldNumbers.length} número(s) foram vendidos/reservados enquanto você escolhia!`,
          duration: 4000 
        }
      }));
      
      setSelectedNumbers(prev => prev.filter(num => !justSoldNumbers.includes(num)));
      return;
    }
    
    const tempOrderId = `TEMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    console.log('🛒 ADICIONANDO RIFAS AO CARRINHO:', {
      quantidade: selectedNumbers.length,
      turma: selectedClass,
      numeros: selectedNumbers,
      status: 'RESERVA LOCAL (AINDA NÃO ENVIADA PARA FIREBASE)',
      nota: 'Admin NÃO VÊ estas rifas até confirmação do pagamento'
    });
    
    selectedNumbers.forEach(number => {
      // Normalizar a turma para o formato correto antes de enviar para o carrinho
      const formattedClass = normalizeTurma(selectedClass);
      
      const raffleItem = {
        ...product,
        id: `${product.id}-${formattedClass}-${number}-${Date.now()}`,
        name: `${product.name} - Nº ${number.toString().padStart(3, '0')}`,
        selectedNumber: number,
        selectedClass: formattedClass, // Usar formato normalizado
        originalClass: selectedClass, // Manter original para exibição
        classInfo: classes[selectedClass],
        quantity: 1,
        price: selectedNumbers.length >= 5 ? 10.00 : 15.00,
        unitPrice: selectedNumbers.length >= 5 ? 10.00 : 15.00,
        raffleType: 'hotplanet',
        isRaffle: true,
        emoji: '🎟️',
        purchaseTime: new Date().toISOString(),
        tempOrderId: tempOrderId,
        status: 'reservado_local',
        needsPaymentConfirmation: true,
        localReservation: true,
        addedAt: new Date().toISOString()
      };
      
      addToCart(raffleItem);
    });
    
    if (openCart) openCart();
    setIsAdded(true);
    
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: {
        type: 'success',
        message: `✅ ${selectedNumbers.length} número(s) reservado(s) no carrinho!\n\n⚠️ **IMPORTANTE - LEIA COM ATENÇÃO:**\n• As rifas estão APENAS no seu navegador\n• O administrador NÃO VÊ estas rifas ainda\n\n📋 **PARA CONFIRMAR A COMPRA:**\n• PIX: Envie comprovante e clique em "Já enviei"\n• DINHEIRO: Clique em "Enviar para WhatsApp"\n\n⏰ **Validade da reserva:** 30 minutos`,
        duration: 8000
      }
    }));
    
    setTimeout(() => {
      setIsAdded(false);
      setSelectedNumbers([]);
    }, 2000);
  };

  const handleQuickSelect = (count) => {
    const available = availableNumbers.filter(n => 
      !selectedNumbers.includes(n)
    );
    
    if (available.length < count) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'warning', 
          message: `Apenas ${available.length} número(s) disponível(is) para esta turma`,
          duration: 3000 
        }
      }));
      return;
    }
    
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const newNumbers = shuffled.slice(0, count);
    
    setSelectedNumbers(prev => {
      const combined = [...prev, ...newNumbers].slice(0, 20);
      return Array.from(new Set(combined)).sort((a, b) => a - b);
    });
    
    if (count === 5) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { 
          type: 'success', 
          message: '🎉 Promoção aplicada! 5 números selecionados por R$ 10,00 cada',
          duration: 3000 
        }
      }));
    }
  };

  const calculateTotal = () => {
    const price = selectedNumbers.length >= 5 ? 10.00 : 15.00;
    return (selectedNumbers.length * price).toFixed(2);
  };

  const getClassStats = () => {
    const normalizedSelectedClass = normalizeTurma(selectedClass);
    const soldInClass = soldNumbers.filter(s => 
      normalizeTurma(s.turma) === normalizedSelectedClass && 
      s.status !== 'cancelado'
    );
    
    const paidCount = soldInClass.filter(s => s.status === 'pago').length;
    const reservedCount = soldInClass.filter(s => s.status === 'pendente' || s.status === 'reservado').length;
    
    return {
      totalSold: soldInClass.length,
      paid: paidCount,
      reserved: reservedCount,
      available: 300 - soldInClass.length
    };
  };

  const renderSyncStatus = () => {
    if (isSyncing) {
      return (
        <div className="sync-status syncing">
          <RefreshCw size={14} className="spin" />
          <span>Sincronizando números vendidos...</span>
        </div>
      );
    }
    
    if (firebaseConnected) {
      return (
        <div className="sync-status success">
          <Shield size={14} />
          <span>✅ Sistema em tempo real • Números atualizados automaticamente</span>
        </div>
      );
    } else {
      return (
        <div className="sync-status warning">
          <AlertCircle size={14} />
          <span>⚠️ Modo offline • Números serão sincronizados ao conectar</span>
        </div>
      );
    }
  };

  const renderStatusIndicator = (status) => {
    switch (status) {
      case 'pago':
        return <span className="status-indicator paid" title="PAGO">💰</span>;
      case 'pendente':
      case 'reservado':
        return <span className="status-indicator reserved" title="RESERVADO">⏳</span>;
      default:
        return <span className="status-indicator sold" title="VENDIDO">✗</span>;
    }
  };

  const renderFilterButtons = () => (
    <div className="filter-buttons">
      <button 
        className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
        onClick={() => setFilterMode('all')}
      >
        <Grid size={14} />
        <span>Todos</span>
      </button>
      <button 
        className={`filter-btn ${filterMode === 'available' ? 'active' : ''}`}
        onClick={() => setFilterMode('available')}
      >
        <CheckCircle size={14} />
        <span>Disponíveis ({getClassStats().available})</span>
      </button>
      <button 
        className={`filter-btn ${filterMode === 'reserved' ? 'active' : ''}`}
        onClick={() => setFilterMode('reserved')}
      >
        <Clock size={14} />
        <span>Reservados ({getClassStats().reserved})</span>
      </button>
      <button 
        className={`filter-btn ${filterMode === 'sold' ? 'active' : ''}`}
        onClick={() => setFilterMode('sold')}
      >
        <Award size={14} />
        <span>Vendidos ({getClassStats().paid})</span>
      </button>
    </div>
  );

  const renderSoldNumbersToggle = () => (
    <button 
      className="toggle-sold-btn"
      onClick={() => setShowSoldNumbers(!showSoldNumbers)}
      title={showSoldNumbers ? 'Ocultar números vendidos' : 'Mostrar números vendidos'}
    >
      {showSoldNumbers ? <EyeOff size={16} /> : <Eye size={16} />}
      <span>{showSoldNumbers ? 'Ocultar vendidos' : 'Mostrar vendidos'}</span>
    </button>
  );

  const renderStatusLegend = () => (
    <div className="status-legend">
      <div className="legend-item">
        <span className="legend-dot available"></span>
        <span>Disponível</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot reserved">⏳</span>
        <span>Reservado (30 min)</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot paid">💰</span>
        <span>Pago</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot selected"></span>
        <span>Selecionado</span>
      </div>
    </div>
  );

  const renderImportantNotice = () => (
    <div className="important-flow-notice">
      <div className="notice-header">
        <AlertCircle size={18} />
        <h4>🎯 COMO FUNCIONA A COMPRA</h4>
      </div>
      <div className="notice-content">
        <div className="flow-steps">
          <div className="flow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Selecione números</strong>
              <p>Reserva local no seu navegador</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Adicione ao carrinho</strong>
              <p>Ainda não vai para o sistema</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Finalize o pedido</strong>
              <p>Escolha PIX ou Dinheiro</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Confirme o pagamento</strong>
              <p>• 💳 PIX: Envie comprovante</p>
              <p>• 💰 DINHEIRO: Envie para WhatsApp</p>
            </div>
          </div>
        </div>
        <div className="critical-note">
          <Shield size={16} />
          <span><strong>Importante:</strong> O administrador só vê suas rifas após a etapa 4!</span>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="raffle-card-list">
        <div className="list-header">
          <div className="list-badge">
            <Ticket size={16} />
            <span>RIFA OFICIAL</span>
          </div>
          <div className="list-actions">
            <button className="action-btn" onClick={() => setIsLiked(!isLiked)}>
              <Heart size={16} fill={isLiked ? "#FF6B6B" : "none"} />
            </button>
          </div>
        </div>
        
        <div className="list-content">
          <h3>{product.name}</h3>
          <p className="list-description">{product.description}</p>
          
          <div className="list-price">
            <span className="price">R$ {calculateTotal()}</span>
            <span className="promo">🎯 5 por R$ 10,00 cada</span>
          </div>
          
          <button className="list-select-btn" onClick={() => handleQuickSelect(5)}>
            <Ticket size={16} />
            <span>Selecionar 5 números</span>
          </button>
        </div>
      </div>
    );
  }

  const currentClass = classes[selectedClass];
  const formattedClassName = normalizeTurma(selectedClass);

  return (
    <div className="raffle-card">
      {/* Card Header with Promo Badges */}
      <div className="card-header">
        <div className="badge-group">
          <div className="badge hot">
            <Award size={14} />
            <span>PROMOÇÃO ESPECIAL</span>
          </div>
          <div className="badge raffle">
            <Ticket size={14} />
            <span>RIFA OFICIAL</span>
          </div>
        </div>
      </div>

      {/* Main Banner */}
      <div className="main-banner">
        <div className="banner-container">
          <img 
            src="" 
            alt="Hot Planet Araçatuba - 1 ingresso + 2 acompanhantes - Prêmio: R$ 117,00 - RIFA DA FORMATURA 2026" 
            className="banner-image"
            onError={(e) => {
              setBannerLoaded(false);
              e.target.style.display = 'none';
            }}
          />
          {!bannerLoaded && (
            <div className="banner-fallback">
              <div className="prize-icon">🏆</div>
              <div className="prize-details">
                <h3>Hot Planet Araçatuba</h3>
                <p>1 ingresso + 2 acompanhantes</p>
                <div className="prize-value">Prêmio: R$ 117,00</div>
                <div className="rifa-info">RIFA DA FORMATURA 2026</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <div className="product-header">
          <div className="title-section">
            <h2>{product.name}</h2>
            <p className="product-description">{product.description}</p>
          </div>
          
          <div className="price-section">
            <div className="price-main">
              <span className="price-label">A partir de</span>
              <span className="price-amount">R$ 15,00</span>
              <span className="price-unit">por número</span>
            </div>
            <div className="price-promo">
              <Tag size={16} />
              <span>5 por R$ 10,00 cada</span>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎟️</div>
            <div className="stat-content">
              <span className="stat-value">900</span>
              <span className="stat-label">Total de números</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <span className="stat-value">300</span>
              <span className="stat-label">Por turma</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-value">R$ 117</span>
              <span className="stat-label">Prêmio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      {renderSyncStatus()}

      {/* Important Notice */}
      {renderImportantNotice()}

      {/* Class Selector */}
      <div className="class-selector">
        <h4 className="section-title">
          <Users size={18} />
          <span>Escolha sua turma:</span>
        </h4>
        
        <div className="class-grid">
          {Object.entries(classes).map(([key, classInfo]) => {
            const stats = getClassStats();
            const isActive = selectedClass === key;
            
            return (
              <button
                key={key}
                className={`class-card ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setSelectedClass(key);
                  setSelectedNumbers([]);
                  setPage(1);
                  setFilterMode('all');
                }}
                style={{
                  '--class-color': classInfo.color,
                  '--class-light': classInfo.light
                }}
              >
                <div className="class-header">
                  <span className="class-emoji">{classInfo.emoji}</span>
                  <span className="class-name">{classInfo.name}</span>
                </div>
                <div className="class-stats">
                  <span className="class-range">1-300</span>
                  <div className="class-status">
                    <span className="available">{stats.available} disp.</span>
                    <span className="separator">•</span>
                    <span className="sold">{stats.paid} pago(s)</span>
                  </div>
                </div>
                {isActive && (
                  <div className="active-indicator">
                    <CheckCircle size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Selected Class Info */}
        <div className="selected-class-info">
          <div className="class-banner" style={{ background: currentClass.gradient }}>
            <span className="class-emoji-large">{currentClass.emoji}</span>
            <div className="class-details">
              <h5>{formattedClassName}</h5>
              <p>{currentClass.description}</p>
            </div>
          </div>
          <div className="class-stats-details">
            <div className="stat-item">
              <span className="stat-label">Disponíveis:</span>
              <span className="stat-value highlight">{getClassStats().available}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Preço atual:</span>
              <span className="stat-value">
                {selectedNumbers.length >= 5 ? 'R$ 10,00' : 'R$ 15,00'}/número
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Vendidos:</span>
              <span className="stat-value">
                {getClassStats().paid} pagos + {getClassStats().reserved} reservados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Numbers */}
      {selectedNumbers.length > 0 && (
        <div className="selected-numbers">
          <div className="selected-header">
            <h4>
              <Ticket size={18} />
              <span>Seus números ({selectedNumbers.length}/20):</span>
            </h4>
            <button 
              className="clear-btn"
              onClick={() => setSelectedNumbers([])}
            >
              <X size={16} />
              <span>Limpar</span>
            </button>
          </div>
          <div className="numbers-list">
            {selectedNumbers.sort((a, b) => a - b).map(num => (
              <span key={num} className="selected-number">
                <span className="number-display">{num.toString().padStart(3, '0')}</span>
                <button 
                  className="remove-btn"
                  onClick={() => setSelectedNumbers(prev => prev.filter(n => n !== num))}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="selected-summary">
            <div className="summary-main">
              <span className="summary-label">{selectedNumbers.length} número{selectedNumbers.length > 1 ? 's' : ''}</span>
              <span className="summary-price">R$ {calculateTotal()}</span>
            </div>
            {selectedNumbers.length >= 5 && (
              <div className="summary-promo">
                <Tag size={14} />
                <span>🎯 PROMOÇÃO ATIVA • R$ 10,00 cada</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Selection */}
      <div className="quick-selection">
        <h4 className="section-title">
          <Ticket size={18} />
          <span>Seleção rápida:</span>
        </h4>
        <div className="quick-grid">
          <button className="quick-card" onClick={() => handleQuickSelect(1)}>
            <span className="quick-number">1</span>
            <span className="quick-label">número</span>
            <span className="quick-price">R$ 15,00</span>
          </button>
          <button className="quick-card" onClick={() => handleQuickSelect(3)}>
            <span className="quick-number">3</span>
            <span className="quick-label">números</span>
            <span className="quick-price">R$ 45,00</span>
          </button>
          <button className="quick-card promo" onClick={() => handleQuickSelect(5)}>
            <div className="promo-badge">PROMO</div>
            <span className="quick-number">5</span>
            <span className="quick-label">números</span>
            <span className="quick-price">R$ 50,00</span>
            <span className="promo-text">R$ 10,00 cada</span>
          </button>
        </div>
      </div>

      {/* Number Selector */}
      <div className="number-selector">
        <div className="selector-header">
          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar número ou nome do comprador..."
              value={searchNumber}
              onChange={(e) => {
                setSearchNumber(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="controls-container">
            {renderFilterButtons()}
            {renderSoldNumbersToggle()}
          </div>
          
          <div className="pagination-container">
            <button 
              className="page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ←
            </button>
            <span className="page-info">Página {page} de {totalPages}</span>
            <button 
              className="page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        </div>

        {renderStatusLegend()}

        <div className="numbers-grid">
          {isLoadingNumbers ? (
            <div className="loading-state">
              <RefreshCw size={24} className="spin" />
              <span>Carregando números disponíveis...</span>
            </div>
          ) : currentNumbers.length === 0 ? (
            <div className="empty-state">
              <Search size={32} />
              <p>Nenhum número encontrado</p>
              {filterMode === 'available' && (
                <p className="hint">Todos os números desta turma foram vendidos/reservados!</p>
              )}
            </div>
          ) : (
            currentNumbers.map((num) => {
              const saleDetails = num.saleDetails;
              const isReserved = num.reserved;
              const isPaid = num.sold;
              const isAvailable = num.isAvailable;
              
              return (
                <button
                  key={num.number}
                  className={`number-card 
                    ${num.selected ? 'selected' : ''} 
                    ${!isAvailable ? (isPaid ? 'sold' : 'reserved') : ''}
                  `}
                  onClick={() => handleNumberClick(num.number, isPaid, isReserved, saleDetails)}
                  disabled={!isAvailable}
                  title={
                    !isAvailable 
                      ? (saleDetails 
                          ? `Número ${num.display}\nStatus: ${saleDetails.status === 'pago' ? '✅ PAGO' : '⏳ RESERVADO'}\nComprador: ${saleDetails.nome}\nData: ${saleDetails.timestamp || 'Não informada'}`
                          : `Número ${num.display} já VENDIDO/RESERVADO`
                        )
                      : `Selecionar número ${num.display}`
                  }
                >
                  <span className="number-display">{num.display}</span>
                  
                  {!isAvailable && saleDetails && (
                    <span className="status-badge">
                      {renderStatusIndicator(saleDetails.status)}
                    </span>
                  )}
                  
                  {num.selected && (
                    <span className="selected-badge">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="stats-overview">
          <div className="stat-box">
            <span className="stat-label">Mostrando</span>
            <span className="stat-value">{filteredNumbers.length}</span>
          </div>
          <div className="stat-box available">
            <span className="stat-label">Disponíveis</span>
            <span className="stat-value">{getClassStats().available}</span>
          </div>
          <div className="stat-box reserved">
            <span className="stat-label">Reservados</span>
            <span className="stat-value">{getClassStats().reserved}</span>
          </div>
          <div className="stat-box sold">
            <span className="stat-label">Vendidos</span>
            <span className="stat-value">{getClassStats().paid}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="card-footer">
        <div className="footer-content">
          <div className="total-section">
            <div className="total-label">Total a pagar</div>
            <div className="total-amount">R$ {calculateTotal()}</div>
            {selectedNumbers.length >= 5 && (
              <div className="promo-badge">
                <Tag size={12} />
                <span>Promoção aplicada</span>
              </div>
            )}
          </div>
          <button 
            className={`cta-button ${selectedNumbers.length === 0 ? 'disabled' : ''} ${isAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={selectedNumbers.length === 0}
          >
            {isAdded ? (
              <>
                <Check size={20} />
                <span>Adicionado ao carrinho</span>
              </>
            ) : (
              <>
                <ShoppingBag size={20} />
                <span>Reservar {selectedNumbers.length} número{selectedNumbers.length > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .raffle-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          margin: 0 auto;
          max-width: 100%;
          border: 1px solid #f1f1f1;
        }

        .raffle-card:hover {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        /* Card Header */
        .card-header {
          padding: 20px 24px 0;
        }

        .badge-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          transition: all 0.3s ease;
        }

        .badge.hot {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
        }

        .badge.raffle {
          background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        /* Main Banner */
        .main-banner {
          position: relative;
          margin: 20px;
          border-radius: 16px;
          overflow: hidden;
          height: 160px;
        }

        @media (max-width: 768px) {
          .main-banner {
            height: 140px;
            margin: 16px;
          }
        }

        @media (max-width: 480px) {
          .main-banner {
            height: 120px;
            margin: 12px;
            border-radius: 14px;
          }
        }

        .banner-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
        }

        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .banner-fallback {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1A1C2E 0%, #2D3047 100%);
          text-align: center;
          color: white;
          padding: 20px;
        }

        @media (max-width: 480px) {
          .banner-fallback {
            padding: 16px;
          }
          
          .prize-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
          
          .prize-details h3 {
            font-size: 18px;
            margin-bottom: 4px;
          }
          
          .prize-details p {
            font-size: 14px;
            margin-bottom: 8px;
            opacity: 0.9;
          }
          
          .prize-value {
            font-size: 20px;
            margin-bottom: 12px;
            font-weight: 700;
            color: #FFD166;
          }
          
          .rifa-info {
            background: rgba(255, 255, 255, 0.1);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            color: #FFD166;
            font-weight: 600;
          }
        }

        /* Card Body */
        .card-body {
          padding: 0 24px 24px;
        }

        .product-header {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (min-width: 640px) {
          .product-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
        }

        .title-section h2 {
          font-size: 24px;
          margin: 0 0 8px 0;
          color: #1A1C2E;
          font-weight: 800;
          line-height: 1.3;
          background: linear-gradient(135deg, #1A1C2E 0%, #2D3047 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-section .product-description {
          color: #64748B;
          line-height: 1.6;
          font-size: 15px;
          max-width: 500px;
        }

        .price-section {
          text-align: center;
          min-width: 200px;
        }

        .price-main {
          margin-bottom: 12px;
        }

        .price-label {
          display: block;
          font-size: 12px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .price-amount {
          display: block;
          font-size: 32px;
          font-weight: 900;
          color: #1A1C2E;
          line-height: 1;
          margin-bottom: 4px;
        }

        .price-unit {
          display: block;
          font-size: 14px;
          color: #94A3B8;
          font-weight: 500;
        }

        .price-promo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #FFD166 0%, #FFE082 100%);
          border-radius: 12px;
          color: #92400E;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(255, 209, 102, 0.25);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: #F8FAFC;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          border: 1px solid #F1F5F9;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
          font-size: 24px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: linear-gradient(135deg, #667EEA, #764BA2);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .stat-content {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 900;
          color: #1A1C2E;
          line-height: 1.2;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #64748B;
          margin-top: 4px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Sync Status */
        .sync-status {
          padding: 16px 24px;
          margin: 0 24px 24px;
          border-radius: 16px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .sync-status.syncing {
          background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
          color: #1976D2;
          border: 1px solid #BBDEFB;
        }

        .sync-status.success {
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
          color: #2E7D32;
          border: 1px solid #C8E6C9;
        }

        .sync-status.warning {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
          color: #F57C00;
          border: 1px solid #FFE0B2;
        }

        /* Important Notice */
        .important-flow-notice {
          background: linear-gradient(135deg, #FFF9E6 0%, #FFEFBF 100%);
          border: 1px solid #FFD166;
          border-radius: 16px;
          margin: 0 24px 24px;
          padding: 20px;
          color: #92400E;
        }

        .notice-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .notice-header h4 {
          margin: 0;
          font-size: 16px;
          color: #92400E;
          font-weight: 800;
        }

        .flow-steps {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .flow-steps {
            grid-template-columns: 1fr;
          }
        }

        .flow-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(255, 209, 102, 0.3);
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-content strong {
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
        }

        .step-content p {
          margin: 0;
          font-size: 13px;
          color: #92400E;
          opacity: 0.9;
          line-height: 1.4;
        }

        .critical-note {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 209, 102, 0.2);
          padding: 14px;
          border-radius: 12px;
          border-left: 4px solid #FFD166;
          font-weight: 600;
          font-size: 14px;
        }

        /* Class Selector */
        .class-selector {
          padding: 0 24px 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          color: #1A1C2E;
          margin: 0 0 20px 0;
          font-weight: 800;
        }

        .class-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .class-grid {
            grid-template-columns: 1fr;
          }
        }

        .class-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
          background: var(--class-light);
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .class-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .class-card.active {
          border-color: var(--class-color);
          background: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .class-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .class-emoji {
          font-size: 24px;
        }

        .class-name {
          font-weight: 800;
          color: #1A1C2E;
          font-size: 16px;
        }

        .class-stats {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .class-range {
          font-size: 14px;
          color: #64748B;
          font-weight: 600;
        }

        .class-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .class-status .available {
          color: #10B981;
          font-weight: 700;
        }

        .class-status .separator {
          color: #CBD5E1;
        }

        .class-status .sold {
          color: #EF4444;
          font-weight: 700;
        }

        .active-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          color: #10B981;
        }

        .selected-class-info {
          background: #F8FAFC;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (min-width: 640px) {
          .selected-class-info {
            flex-direction: row;
            align-items: center;
          }
        }

        .class-banner {
          flex: 1;
          padding: 20px;
          border-radius: 12px;
          color: white;
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 200px;
        }

        .class-emoji-large {
          font-size: 32px;
        }

        .class-details h5 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        .class-details p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .class-stats-details {
          flex: 2;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .class-stats-details {
            grid-template-columns: 1fr;
          }
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-item .stat-label {
          font-size: 12px;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stat-item .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #1A1C2E;
        }

        .stat-item .stat-value.highlight {
          color: #10B981;
          font-size: 20px;
          font-weight: 800;
        }

        /* Selected Numbers */
        .selected-numbers {
          padding: 0 24px 24px;
        }

        .selected-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .selected-header h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 18px;
          color: #1A1C2E;
          font-weight: 800;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          background: #FEE2E2;
          transform: translateY(-1px);
        }

        .numbers-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
          min-height: 52px;
        }

        .selected-number {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: linear-gradient(135deg, #667EEA, #764BA2);
          color: white;
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
          transition: all 0.3s ease;
          position: relative;
        }

        .selected-number:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
        }

        .remove-btn {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          font-size: 10px;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .selected-summary {
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #E2E8F0;
        }

        .summary-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .summary-label {
          font-size: 16px;
          color: #64748B;
          font-weight: 600;
        }

        .summary-price {
          font-size: 32px;
          font-weight: 900;
          color: #1A1C2E;
        }

        .summary-promo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #FFD166 0%, #FFE082 100%);
          color: #92400E;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(255, 209, 102, 0.25);
        }

        /* Quick Selection */
        .quick-selection {
          padding: 0 24px 24px;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 640px) {
          .quick-grid {
            grid-template-columns: 1fr;
          }
        }

        .quick-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          background: white;
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .quick-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .quick-card.promo {
          background: linear-gradient(135deg, #FFD166 0%, #FFE082 100%);
          border-color: #FFD166;
          color: #92400E;
        }

        .quick-card.promo .promo-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #EF4444;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
        }

        .quick-number {
          font-size: 40px;
          font-weight: 900;
          margin-bottom: 8px;
          line-height: 1;
          color: #1A1C2E;
        }

        .quick-card.promo .quick-number {
          color: #92400E;
        }

        .quick-label {
          font-size: 14px;
          color: #64748B;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .quick-card.promo .quick-label {
          color: #92400E;
        }

        .quick-price {
          font-size: 20px;
          font-weight: 800;
          color: #1A1C2E;
        }

        .quick-card.promo .quick-price {
          color: #92400E;
        }

        .promo-text {
          font-size: 12px;
          color: #92400E;
          opacity: 0.8;
          margin-top: 8px;
          font-weight: 600;
        }

        /* Number Selector */
        .number-selector {
          padding: 0 24px 24px;
          color: black;
        }

        .selector-header {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .search-container {
          position: relative;
        }

        .search-container svg {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
        }

        .search-container input {
          width: 100%;
          padding: 18px 20px 18px 52px;
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          font-size: 16px;
          box-sizing: border-box;
          transition: all 0.3s ease;
          background: white;
          color: #1A1C2E;
        }

        .search-container input:focus {
          outline: none;
          border-color: #667EEA;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-container input::placeholder {
          color: #94A3B8;
        }

        .controls-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .controls-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748B;
        }

        .filter-btn:hover {
          background: #F8FAFC;
          transform: translateY(-1px);
        }

        .filter-btn.active {
          background: #667EEA;
          color: white;
          border-color: #667EEA;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .toggle-sold-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #64748B;
          min-width: fit-content;
        }

        .toggle-sold-btn:hover {
          background: #F8FAFC;
          transform: translateY(-1px);
        }

        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .page-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #E2E8F0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          font-weight: 700;
          color: #64748B;
          transition: all 0.3s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: #F8FAFC;
          transform: translateY(-1px);
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          color: #64748B;
          font-weight: 600;
          min-width: 120px;
          text-align: center;
        }

        /* Status Legend */
        .status-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 24px;
          padding: 20px;
          background: #F8FAFC;
          border-radius: 16px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #64748B;
          font-weight: 600;
        }

        .legend-dot {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .legend-dot.available {
          background: linear-gradient(135deg, #10B981, #34D399);
          border: none;
        }

        .legend-dot.reserved {
          background: linear-gradient(135deg, #F59E0B, #FBBF24);
          border: none;
          font-size: 12px;
          color: white;
        }

        .legend-dot.paid {
          background: linear-gradient(135deg, #3B82F6, #60A5FA);
          border: none;
          font-size: 12px;
          color: white;
        }

        .legend-dot.selected {
          background: linear-gradient(135deg, #667EEA, #764BA2);
          border: none;
        }

        /* Numbers Grid */
        .numbers-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        @media (max-width: 1024px) {
          .numbers-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 640px) {
          .numbers-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 380px) {
          .numbers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .number-card {
          aspect-ratio: 1;
          border-radius: 12px;
          border: 2px solid #E2E8F0;
          background: white;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s ease;
          color: #1A1C2E;
          min-height: 52px;
        }

        .number-card:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .number-card.selected {
          background: linear-gradient(135deg, #667EEA, #764BA2);
          color: black;
          border-color: #667EEA;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
          font-weight: 900;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .number-card.sold {
          background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
          color: #DC2626;
          border-color: #FECACA;
          cursor: not-allowed;
        }

        .number-card.reserved {
          background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
          color: #D97706;
          border-color: #FDE68A;
          cursor: not-allowed;
        }

        .number-card:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .status-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          font-size: 12px;
        }

        .selected-badge {
          position: absolute;
          bottom: 6px;
          right: 6px;
          color: black;
          font-size: 12px;
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #64748B;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .hint {
          font-size: 14px;
          color: #EF4444;
          margin-top: 8px;
          text-align: center;
          font-weight: 600;
        }

        /* Stats Overview */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 768px) {
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }
        }

        .stat-box {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          border: 1px solid #E2E8F0;
          transition: all 0.3s ease;
        }

        .stat-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
        }

        .stat-box.available {
          border-top: 4px solid #10B981;
        }

        .stat-box.reserved {
          border-top: 4px solid #F59E0B;
        }

        .stat-box.sold {
          border-top: 4px solid #EF4444;
        }

        .stat-box .stat-label {
          font-size: 12px;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-box .stat-value {
          font-size: 24px;
          font-weight: 900;
          color: #1A1C2E;
        }

        /* Card Footer */
        .card-footer {
          padding: 24px;
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-top: 1px solid #E2E8F0;
        }

        .footer-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (min-width: 640px) {
          .footer-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .total-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .total-label {
          font-size: 14px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .total-amount {
          font-size: 40px;
          font-weight: 900;
          color: #1A1C2E;
          line-height: 1;
          background: linear-gradient(135deg, #667EEA, #764BA2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .promo-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: linear-gradient(135deg, #FFD166, #FFE082);
          color: #92400E;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          max-width: fit-content;
        }

        .cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 22px 32px;
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          box-shadow: 0 8px 24px rgba(255, 107, 107, 0.25);
        }

        @media (min-width: 640px) {
          .cta-button {
            width: auto;
            min-width: 240px;
          }
        }

        .cta-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 107, 107, 0.35);
        }

        .cta-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .cta-button.added {
          background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
        }

        .cta-button.added:hover {
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.35);
        }

        /* Animations */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        /* Responsive Adjustments for Mobile */
        @media (max-width: 480px) {
          .raffle-card {
            border-radius: 20px;
            margin: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          }
          
          .card-header {
            padding: 16px 16px 0;
          }
          
          .badge {
            padding: 8px 12px;
            font-size: 11px;
            border-radius: 40px;
          }
          
          .main-banner {
            height: 100px;
            margin: 10px;
            border-radius: 12px;
          }
          
          .banner-fallback {
            padding: 12px;
          }
          
          .prize-icon {
            font-size: 28px;
            margin-bottom: 6px;
          }
          
          .prize-details h3 {
            font-size: 16px;
            margin-bottom: 4px;
          }
          
          .prize-details p {
            font-size: 12px;
            margin-bottom: 6px;
          }
          
          .prize-value {
            font-size: 18px;
            margin-bottom: 8px;
          }
          
          .rifa-info {
            font-size: 10px;
            padding: 4px 10px;
          }
          
          .card-body {
            padding: 0 16px 16px;
          }
          
          .title-section h2 {
            font-size: 20px;
          }
          
          .title-section .product-description {
            font-size: 14px;
          }
          
          .price-amount {
            font-size: 28px;
          }
          
          .price-promo {
            font-size: 13px;
            padding: 8px 12px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          
          .stat-card {
            padding: 12px;
            border-radius: 12px;
          }
          
          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
            border-radius: 12px;
          }
          
          .stat-value {
            font-size: 16px;
          }
          
          .stat-label {
            font-size: 10px;
          }
          
          .sync-status,
          .important-flow-notice {
            margin: 0 16px 16px;
            padding: 16px;
            border-radius: 14px;
            font-size: 13px;
          }
          
          .flow-steps {
            gap: 12px;
          }
          
          .flow-step {
            padding: 12px;
            border-radius: 10px;
          }
          
          .step-number {
            width: 28px;
            height: 28px;
            font-size: 13px;
          }
          
          .step-content strong {
            font-size: 13px;
          }
          
          .step-content p {
            font-size: 12px;
          }
          
          .class-selector,
          .selected-numbers,
          .quick-selection,
          .number-selector {
            padding: 0 16px 16px;
          }
          
          .class-grid {
            gap: 10px;
          }
          
          .class-card {
            padding: 16px;
            border-radius: 14px;
          }
          
          .class-emoji {
            font-size: 20px;
          }
          
          .class-name {
            font-size: 14px;
          }
          
          .class-range {
            font-size: 13px;
          }
          
          .class-status {
            font-size: 12px;
          }
          
          .selected-class-info {
            padding: 16px;
            border-radius: 14px;
            gap: 16px;
          }
          
          .class-banner {
            padding: 16px;
            border-radius: 10px;
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }
          
          .class-emoji-large {
            font-size: 28px;
          }
          
          .class-details h5 {
            font-size: 16px;
          }
          
          .class-details p {
            font-size: 13px;
          }
          
          .class-stats-details {
            gap: 12px;
          }
          
          .selected-header h4 {
            font-size: 16px;
          }
          
          .clear-btn {
            padding: 8px 12px;
            font-size: 13px;
          }
          
          .selected-number {
            padding: 10px 14px;
            font-size: 14px;
            border-radius: 10px;
          }
          
          .selected-summary {
            padding: 16px;
            border-radius: 14px;
          }
          
          .summary-price {
            font-size: 28px;
          }
          
          .summary-promo {
            padding: 10px 12px;
            font-size: 13px;
          }
          
          .quick-grid {
            gap: 10px;
          }
          
          .quick-card {
            padding: 20px;
            border-radius: 14px;
          }
          
          .quick-number {
            font-size: 32px;
          }
          
          .quick-price {
            font-size: 18px;
          }
          
          .search-container input {
            padding: 16px 16px 16px 48px;
            font-size: 15px;
            border-radius: 14px;
          }
          
          .filter-buttons {
            justify-content: center;
            gap: 6px;
          }
          
          .filter-btn,
          .toggle-sold-btn {
            padding: 10px 12px;
            font-size: 12px;
            border-radius: 10px;
          }
          
          .numbers-grid {
            gap: 8px;
          }
          
          .number-card {
            font-size: 14px;
            min-height: 44px;
            border-radius: 10px;
          }
          
          .status-legend {
            padding: 16px;
            border-radius: 14px;
            gap: 16px;
          }
          
          .legend-item {
            font-size: 12px;
          }
          
          .stats-overview {
            gap: 12px;
          }
          
          .stat-box {
            padding: 16px;
            border-radius: 10px;
          }
          
          .stat-box .stat-value {
            font-size: 20px;
          }
          
          .card-footer {
            padding: 16px;
            border-radius: 0 0 20px 20px;
          }
          
          .total-amount {
            font-size: 32px;
          }
          
          .cta-button {
            padding: 20px 24px;
            font-size: 16px;
            border-radius: 14px;
            margin-top: 8px;
          }
        }

        /* Ajustes específicos para telas muito pequenas */
        @media (max-width: 360px) {
          .numbers-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          
          .number-card {
            min-height: 40px;
            font-size: 13px;
          }
          
          .quick-grid {
            grid-template-columns: 1fr;
          }
          
          .class-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .flow-steps {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RaffleProductCard;