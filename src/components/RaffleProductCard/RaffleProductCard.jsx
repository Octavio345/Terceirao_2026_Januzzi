import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Heart, Share2,  Info, Zap, Check, Users, 
   Target, Ticket, Gift, Calendar, 
  MapPin,  Sparkles, Search, Clock,
  ChevronDown, ChevronUp, Shield, Trophy,
  AlertCircle, CheckCircle,  BarChart3
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const RaffleProductCard = ({ product, index, viewMode = 'grid' }) => {
  const { addToCart, openCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedClass, setSelectedClass] = useState('3A');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [searchNumber, setSearchNumber] = useState('');
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [activeTab, setActiveTab] = useState('numbers');
  const [expanded, setExpanded] = useState(false); // ← ADICIONE ESTA LINHA

  // CONFIGURAÇÕES DAS TURMAS - ESTADO INICIAL
  const classes = useMemo(() => ({
    '3A': {
      name: '3º ANO A',
      description: 'Turma do Ensino Médio Regular',
      range: { start: 1, end: 99 },
      color: '#FF6B6B',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #C44569 100%)',
      emoji: '👨‍🎓',
      sold: new Set(),
      availableCount: 99,
      status: 'Aguardando primeira venda',
      stats: {
        total: 99,
        sold: 0,
        percentage: 0
      }
    },
    '3B': {
      name: '3º ANO B',
      description: 'Turma do Ensino Médio Regular',
      range: { start: 100, end: 199 },
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #1A936F 100%)',
      emoji: '👩‍🎓',
      sold: new Set(),
      availableCount: 100,
      status: 'Números disponíveis',
      stats: {
        total: 100,
        sold: 0,
        percentage: 0
      }
    },
    '3TECH': {
      name: '3º TECH',
      description: 'Turma do Ensino Técnico',
      range: { start: 200, end: 299 },
      color: '#FFD166',
      gradient: 'linear-gradient(135deg, #FFD166 0%, #F8961E 100%)',
      emoji: '💻',
      sold: new Set(),
      availableCount: 100,
      status: 'Pode ser o primeiro!',
      stats: {
        total: 100,
        sold: 0,
        percentage: 0
      }
    }
  }), []);

  // Contagem regressiva realista
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const target = new Date('2024-12-20T18:00:00');
      
      const diff = target - now;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days} dias ${hours}h`);
      } else if (hours > 0) {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}min`);
      } else {
        setTimeRemaining('Sorteio em andamento');
      }
    };
    
    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const availableNumbers = useMemo(() => {
    const classInfo = classes[selectedClass];
    const numbers = [];
    
    for (let i = classInfo.range.start; i <= classInfo.range.end; i++) {
      const isSold = classInfo.sold.has(i);
      const isSelected = selectedNumbers.includes(i);
      
      numbers.push({
        number: i,
        display: i.toString().padStart(3, '0'),
        sold: isSold,
        selected: isSelected
      });
    }
    
    return numbers;
  }, [selectedClass, classes, selectedNumbers]);

  const filteredNumbers = useMemo(() => {
    if (!searchNumber.trim()) {
      return availableNumbers;
    }
    
    const searchNum = parseInt(searchNumber);
    if (isNaN(searchNum)) {
      return availableNumbers.filter(num => 
        num.display.includes(searchNumber)
      );
    }
    
    return availableNumbers.filter(num => 
      num.number === searchNum
    );
  }, [availableNumbers, searchNumber]);

  const numbersToShow = showAllNumbers ? filteredNumbers : filteredNumbers.slice(0, 30);

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  const handleShareClick = () => {
    const raffleInfo = `🎟️ **RIFA DO 3º ANO - HOT PLANET ARACATUBA**\n\n🏆 **PRÊMIO:** 1 ingresso Hot Planet + 2 acompanhantes\n💰 **Valor:** R$ ${product.price.toFixed(2)} por número\n📅 **Sorteio:** 20/12/2024\n🎯 **Números disponíveis:** 001-299\n\nCompre agora: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Rifa Oficial do Terceirão 2024',
        text: raffleInfo,
        url: window.location.href,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(raffleInfo)
        .then(() => {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 2000);
        })
        .catch(console.error);
    }
  };

  const handleNumberClick = (number) => {
    if (classes[selectedClass].sold.has(number)) return;
    
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        if (prev.length >= 10) {
          alert('Limite máximo de 10 números por pedido.');
          return prev;
        }
        return [...prev, number];
      }
    });
  };

  const handleQuickSelect = (count) => {
    const classInfo = classes[selectedClass];
    const available = availableNumbers.filter(n => !n.sold && !selectedNumbers.includes(n.number));
    
    if (available.length < count) {
      alert(`Apenas ${available.length} números disponíveis nesta turma.`);
      return;
    }
    
    const startNumber = classInfo.range.start;
    const newNumbers = [];
    
    for (let i = 0; i < count; i++) {
      const num = startNumber + i;
      if (num <= classInfo.range.end && !classInfo.sold.has(num) && !selectedNumbers.includes(num)) {
        newNumbers.push(num);
      }
    }
    
    setSelectedNumbers(prev => {
      const combined = [...prev, ...newNumbers].slice(0, 10);
      return Array.from(new Set(combined)).sort((a, b) => a - b);
    });
  };

  const handleAddToCart = () => {
    if (selectedNumbers.length === 0) {
      alert('Selecione pelo menos um número para continuar.');
      return;
    }
    
    const raffleItem = {
      ...product,
      selectedNumbers: [...selectedNumbers].sort((a, b) => a - b),
      selectedClass: selectedClass,
      classInfo: classes[selectedClass],
      quantity: selectedNumbers.length,
      unitPrice: product.price,
      timestamp: new Date().toISOString()
    };
    
    addToCart(raffleItem);
    if (openCart) openCart();
    setIsAdded(true);
    
    setTimeout(() => {
      setIsAdded(false);
      setSelectedNumbers([]);
    }, 3000);
  };

  const calculateTotal = () => {
    const baseTotal = selectedNumbers.length * product.price;
    
    let discount = 0;
    if (selectedNumbers.length >= 10) discount = 15;
    else if (selectedNumbers.length >= 5) discount = 10;
    else if (selectedNumbers.length >= 3) discount = 5;
    
    return (baseTotal * (100 - discount) / 100).toFixed(2);
  };

  const formatNumbersList = () => {
    return selectedNumbers
      .sort((a, b) => a - b)
      .map(n => n.toString().padStart(3, '0'))
      .join(', ');
  };

  // Renderização simplificada para modo lista
  if (viewMode === 'list') {
    return (
      <div className="raffle-list-item">
        <div className="list-header">
          <div className="list-icon">
            <Ticket size={24} className="ticket-icon" />
          </div>
          <div className="list-info">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="list-tags">
              <span className="tag new">
                <Sparkles size={12} />
                Lançamento
              </span>
              <span className="tag time">
                <Clock size={12} />
                {timeRemaining}
              </span>
            </div>
          </div>
          <div className="list-price">
            <span className="price">R$ {product.price.toFixed(2)}</span>
            <span className="unit">por número</span>
          </div>
        </div>
        
        <button 
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ver menos' : 'Selecionar números'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {/* Conteúdo expandido */}
        {expanded && (
          <div className="expanded-content">
            <div className="expanded-class-selector">
              <div className="class-buttons-mini">
                {Object.entries(classes).map(([key, classInfo]) => (
                  <button
                    key={key}
                    className={`class-btn-mini ${selectedClass === key ? 'active' : ''}`}
                    onClick={() => setSelectedClass(key)}
                    style={{ 
                      backgroundColor: selectedClass === key ? classInfo.color : 'transparent',
                      color: selectedClass === key ? 'white' : classInfo.color
                    }}
                  >
                    {classInfo.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="expanded-actions">
              <button 
                className="btn-select"
                onClick={() => handleQuickSelect(3)}
              >
                Selecionar 3 números
              </button>
              
              <button 
                className={`btn-add ${selectedNumbers.length > 0 ? 'active' : ''}`}
                onClick={handleAddToCart}
                disabled={selectedNumbers.length === 0}
              >
                {selectedNumbers.length > 0 ? `Adicionar ${selectedNumbers.length}` : 'Selecione números'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  // Modo grid (padrão)
  return (
    <div className="raffle-card">
      {/* Cabeçalho do card */}
      <div className="card-header">
        <div className="card-badges">
          <div className="badge official">
            <Shield size={14} />
            <span>RIFA OFICIAL</span>
          </div>
          <div className="badge new">
            <Sparkles size={14} />
            <span>LANÇAMENTO</span>
          </div>
        </div>
        
        <div className="card-actions">
          <button 
            className={`action-btn like ${isLiked ? 'active' : ''}`}
            onClick={handleLikeClick}
            title={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={20} fill={isLiked ? "#FF6B6B" : "none"} />
          </button>
          <button 
            className={`action-btn share ${isAnimating ? 'animating' : ''}`}
            onClick={handleShareClick}
            title="Compartilhar rifa"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Banner do prêmio */}
      <div className="prize-section">
        <div className="prize-content">
          <div className="prize-icon">
            <Trophy size={32} />
          </div>
          <div className="prize-details">
            <span className="prize-label">PRÊMIO PRINCIPAL</span>
            <h2 className="prize-title">Hot Planet Araçatuba</h2>
            <p className="prize-subtitle">1 ingresso + 2 acompanhantes</p>
          </div>
          <div className="prize-value">
            <span className="value">R$ 249,90</span>
            <span className="label">Valor do prêmio</span>
          </div>
        </div>
      </div>

      {/* Informações principais */}
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>Sorteio: 20/12/2024</span>
          </div>
          <div className="meta-item">
            <MapPin size={16} />
            <span>Araçatuba-SP</span>
          </div>
          <div className="meta-item">
            <Users size={16} />
            <span>Para 3 pessoas</span>
          </div>
        </div>
      </div>

      {/* Status da rifa */}
      <div className="raffle-status">
        <div className="status-card">
          <div className="status-header">
            <BarChart3 size={20} />
            <h4>Status da Rifa</h4>
          </div>
          <div className="status-content">
            <div className="stat-item">
              <span className="stat-label">Números totais:</span>
              <span className="stat-value">299</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Números vendidos:</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-label">Disponibilidade:</span>
              <span className="stat-value success">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de turmas */}
      <div className="class-selector">
        <h4 className="section-title">
          <Users size={20} />
          Selecione sua turma:
        </h4>
        
        <div className="class-grid">
          {Object.entries(classes).map(([key, classInfo]) => (
            <div
              key={key}
              className={`class-card ${selectedClass === key ? 'selected' : ''}`}
              onClick={() => setSelectedClass(key)}
              style={{ 
                borderColor: classInfo.color,
                background: selectedClass === key ? 
                  `linear-gradient(135deg, ${classInfo.color}15 0%, ${classInfo.color}05 100%)` : 
                  'white'
              }}
            >
              <div className="class-header">
                <div className="class-icon">{classInfo.emoji}</div>
                <div className="class-info">
                  <h5>{classInfo.name}</h5>
                  <p>{classInfo.description}</p>
                </div>
              </div>
              
              <div className="class-stats">
                <div className="stat">
                  <span className="number">{classInfo.availableCount}</span>
                  <span className="label">disponíveis</span>
                </div>
                <div className="stat">
                  <span className="number">0</span>
                  <span className="label">vendidos</span>
                </div>
              </div>
              
              <div className="class-footer">
                <span className="status-badge available">
                  <CheckCircle size={12} />
                  {classInfo.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Selection */}
      <div className="quick-selection">
        <h4 className="section-title">
          <Zap size={20} />
          Seleção Rápida
        </h4>
        
        <div className="quick-buttons">
          <button className="quick-btn" onClick={() => handleQuickSelect(1)}>
            1 número
          </button>
          <button className="quick-btn" onClick={() => handleQuickSelect(3)}>
            3 números
          </button>
          <button className="quick-btn highlight" onClick={() => handleQuickSelect(5)}>
            5 números (-10%)
          </button>
          <button className="quick-btn best" onClick={() => handleQuickSelect(10)}>
            10 números (-15%)
          </button>
        </div>
      </div>

      {/* Seletor de números */}
      <div className="number-selector">
        <div className="selector-header">
          <h4 className="section-title">
            <Target size={20} />
            Selecione seus números
            <span className="counter">({selectedNumbers.length}/10)</span>
          </h4>
          
          <div className="header-actions">
            <button 
              className="clear-btn"
              onClick={() => setSelectedNumbers([])}
              disabled={selectedNumbers.length === 0}
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder={`Buscar número (${classes[selectedClass].range.start.toString().padStart(3, '0')}-${classes[selectedClass].range.end.toString().padStart(3, '0')})...`}
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Números selecionados */}
        {selectedNumbers.length > 0 && (
          <div className="selected-display">
            <div className="selected-header">
              <Check size={18} className="check-icon" />
              <div className="selected-info">
                <h5>Números selecionados</h5>
                <p className="numbers">{formatNumbersList()}</p>
              </div>
            </div>
            
            <div className="selected-summary">
              <div className="summary-row">
                <span>Valor total:</span>
                <span>R$ {calculateTotal()}</span>
              </div>
              {selectedNumbers.length >= 3 && (
                <div className="summary-row discount">
                  <span>Desconto aplicado:</span>
                  <span>
                    {selectedNumbers.length >= 10 ? '15%' : 
                     selectedNumbers.length >= 5 ? '10%' : '5%'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grade de números */}
        <div className="numbers-section">
          <div className="numbers-grid">
            {numbersToShow.map((num) => (
              <button
                key={num.number}
                className={`number-cell ${num.selected ? 'selected' : ''}`}
                onClick={() => handleNumberClick(num.number)}
                title={`Número ${num.display}`}
              >
                <span className="number">{num.display}</span>
                {num.selected && <Check size={12} className="selected-icon" />}
              </button>
            ))}
          </div>
          
          {filteredNumbers.length > 30 && (
            <button 
              className="show-more-btn"
              onClick={() => setShowAllNumbers(!showAllNumbers)}
            >
              {showAllNumbers ? 'Mostrar menos' : `Ver mais ${filteredNumbers.length - 30} números`}
            </button>
          )}
        </div>
      </div>

      {/* Informações do sorteio */}
      <div className="raffle-info">
        <div className="info-tabs">
          <button 
            className={`info-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Info size={16} />
            Detalhes
          </button>
          <button 
            className={`info-tab ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <Shield size={16} />
            Regras
          </button>
          <button 
            className={`info-tab ${activeTab === 'prize' ? 'active' : ''}`}
            onClick={() => setActiveTab('prize')}
          >
            <Gift size={16} />
            Prêmio
          </button>
        </div>
        
        <div className="info-content">
          {activeTab === 'details' && (
            <div className="tab-content">
              <ul className="info-list">
                <li><CheckCircle size={14} /> Sorteio presencial na escola</li>
                <li><CheckCircle size={14} /> Data: 20 de dezembro de 2024</li>
                <li><CheckCircle size={14} /> Horário: 18:00 horas</li>
                <li><CheckCircle size={14} /> Resultado no grupo da turma</li>
              </ul>
            </div>
          )}
          
          {activeTab === 'rules' && (
            <div className="tab-content">
              <ul className="info-list">
                <li><AlertCircle size={14} /> Máximo 10 números por pedido</li>
                <li><AlertCircle size={14} /> Ingresso válido por 6 meses</li>
                <li><AlertCircle size={14} /> Pode transferir para amigo</li>
                <li><AlertCircle size={14} /> Comprovante obrigatório</li>
              </ul>
            </div>
          )}
          
          {activeTab === 'prize' && (
            <div className="tab-content">
              <ul className="info-list">
                <li><Gift size={14} /> 1 ingresso Hot Planet</li>
                <li><Gift size={14} /> + 2 acompanhantes</li>
                <li><Gift size={14} /> Validade: 6 meses</li>
                <li><Gift size={14} /> Estacionamento incluído</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé com ações */}
      <div className="card-footer">
        <div className="price-section">
          <div className="price-display">
            <span className="price-label">Valor por número:</span>
            <span className="price">R$ {product.price.toFixed(2)}</span>
          </div>
          
          {selectedNumbers.length > 0 && (
            <div className="total-display">
              <span className="total-label">Total selecionado:</span>
              <span className="total">R$ {calculateTotal()}</span>
            </div>
          )}
        </div>
        
        <button 
          className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${selectedNumbers.length === 0 ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={selectedNumbers.length === 0}
        >
          <ShoppingBag size={20} />
          <span className="btn-text">
            {isAdded ? 'Adicionado!' : 
             selectedNumbers.length === 0 ? 'Selecione números' : 
             `Comprar ${selectedNumbers.length} número${selectedNumbers.length > 1 ? 's' : ''}`}
          </span>
          {selectedNumbers.length > 0 && (
            <span className="btn-price">R$ {calculateTotal()}</span>
          )}
        </button>
      </div>

      <style jsx>{`
        .raffle-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          border: 1px solid #f0f0f0;
          animation: cardEntrance 0.6s ease-out forwards;
          animation-delay: ${index * 0.1}s;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes cardEntrance {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .raffle-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
          border-color: #FFD166;
        }

        /* Header */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 20px 0;
        }

        .card-badges {
          display: flex;
          gap: 8px;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge.official {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .badge.new {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: #000;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid #e0e0e0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: white;
          border-color: #FFD166;
          color: #1A1A2E;
          transform: scale(1.1);
        }

        .action-btn.like.active {
          color: #FF6B6B;
          border-color: #FF6B6B;
        }

        .action-btn.share.animating {
          color: #667eea;
          border-color: #667eea;
        }

        /* Prize Section */
        .prize-section {
          background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);
          padding: 24px;
          margin: 20px 20px 0;
          border-radius: 16px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .prize-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.3;
          animation: sparkle 20s linear infinite;
        }

        @keyframes sparkle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .prize-content {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .prize-icon {
          background: rgba(255, 255, 255, 0.1);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .prize-details {
          flex: 1;
        }

        .prize-label {
          font-size: 12px;
          font-weight: 600;
          opacity: 0.8;
          letter-spacing: 1px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        .prize-title {
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 4px 0;
          line-height: 1.2;
        }

        .prize-subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }

        .prize-value {
          text-align: center;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .prize-value .value {
          display: block;
          font-size: 18px;
          font-weight: 800;
        }

        .prize-value .label {
          font-size: 11px;
          opacity: 0.8;
          display: block;
        }

        /* Product Info */
        .product-info {
          padding: 20px;
        }

        .product-title {
          font-size: 24px;
          font-weight: 800;
          color: #1A1A2E;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .product-description {
          color: #666;
          font-size: 15px;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .product-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
          padding: 6px 12px;
          background: #f8f9fa;
          border-radius: 20px;
        }

        /* Raffle Status */
        .raffle-status {
          padding: 0 20px;
        }

        .status-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 16px;
          padding: 20px;
          border: 2px solid #e0e0e0;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #1A1A2E;
        }

        .status-header h4 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .status-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .stat-item:last-child {
          border-bottom: none;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #1A1A2E;
        }

        .stat-item.highlight .stat-value.success {
          color: #28a745;
        }

        /* Class Selector */
        .class-selector {
          padding: 20px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          color: #1A1A2E;
          margin: 0 0 16px 0;
        }

        .class-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .class-card {
          border: 2px solid;
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .class-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .class-card.selected {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .class-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .class-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .class-info h5 {
          font-size: 16px;
          font-weight: 700;
          color: #1A1A2E;
          margin: 0 0 4px 0;
        }

        .class-info p {
          font-size: 12px;
          color: #666;
          margin: 0;
          line-height: 1.3;
        }

        .class-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .class-stats .stat {
          text-align: center;
          flex: 1;
        }

        .class-stats .number {
          display: block;
          font-size: 20px;
          font-weight: 800;
          color: #1A1A2E;
          line-height: 1;
        }

        .class-stats .label {
          display: block;
          font-size: 11px;
          color: #666;
          margin-top: 4px;
        }

        .class-footer {
          text-align: center;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: #28a745;
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-badge.available {
          background: #28a745;
        }

        /* Quick Selection */
        .quick-selection {
          padding: 0 20px 20px;
        }

        .quick-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .quick-btn {
          padding: 14px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1A1A2E;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-btn:hover {
          border-color: #FFD166;
          background: rgba(255, 209, 102, 0.1);
        }

        .quick-btn.highlight {
          background: #FFD166;
          border-color: #FFD166;
          color: #1A1A2E;
        }

        .quick-btn.best {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border-color: transparent;
          color: white;
          grid-column: span 2;
        }

        /* Number Selector */
        .number-selector {
          padding: 0 20px 20px;
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .counter {
          margin-left: 8px;
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        .clear-btn {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #dc3545;
          color: #dc3545;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-btn:hover:not(:disabled) {
          background: #dc3545;
          color: white;
        }

        .clear-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Search */
        .search-box {
          position: relative;
          margin-bottom: 16px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .search-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          font-size: 15px;
          color: #1A1A2E;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #FFD166;
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.1);
        }

        /* Selected Display */
        .selected-display {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          border: 2px solid #28a745;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .selected-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .check-icon {
          color: #28a745;
          flex-shrink: 0;
        }

        .selected-info h5 {
          font-size: 16px;
          font-weight: 700;
          color: #155724;
          margin: 0 0 4px 0;
        }

        .selected-info .numbers {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          color: #155724;
          line-height: 1.4;
          margin: 0;
          word-break: break-word;
        }

        .selected-summary {
          padding-top: 12px;
          border-top: 1px solid rgba(21, 87, 36, 0.2);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 14px;
          color: #155724;
        }

        .summary-row.discount {
          color: #28a745;
          font-weight: 600;
        }

        /* Numbers Grid */
        .numbers-section {
          margin-top: 20px;
        }

        .numbers-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .numbers-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (max-width: 480px) {
          .numbers-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .number-cell {
          aspect-ratio: 1;
          position: relative;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Courier New', monospace;
          font-weight: 800;
          color: #1A1A2E;
          font-size: 14px;
          padding: 0;
        }

        .number-cell:hover:not(.selected) {
          border-color: #FFD166;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 209, 102, 0.2);
        }

        .number-cell.selected {
          background: #FFD166;
          border-color: #FFD166;
          color: #1A1A2E;
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(255, 209, 102, 0.4);
        }

        .selected-icon {
          position: absolute;
          bottom: 4px;
          right: 4px;
          color: #1A1A2E;
          opacity: 0.8;
        }

        .show-more-btn {
          width: 100%;
          padding: 14px;
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
          color: #1A1A2E;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .show-more-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        /* Raffle Info */
        .raffle-info {
          padding: 0 20px 20px;
        }

        .info-tabs {
          display: flex;
          gap: 1px;
          background: #f0f0f0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .info-tab {
          flex: 1;
          padding: 12px;
          background: white;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .info-tab:hover {
          background: #f8f9fa;
        }

        .info-tab.active {
          background: #FFD166;
          color: #1A1A2E;
        }

        .info-content {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #f0f0f0;
        }

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .info-list li {
          padding: 8px 0;
          font-size: 14px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-list li:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }

        /* Card Footer */
        .card-footer {
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 640px) {
          .card-footer {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .price-section {
          flex: 1;
        }

        .price-display, .total-display {
          display: flex;
          flex-direction: column;
        }

        .price-label, .total-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }

        .price {
          font-size: 28px;
          font-weight: 800;
          color: #1A1A2E;
          line-height: 1;
        }

        .total {
          font-size: 22px;
          font-weight: 800;
          color: #1A1A2E;
          line-height: 1;
        }

        .add-to-cart-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 32px;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 240px;
          box-shadow: 0 8px 24px rgba(40, 167, 69, 0.3);
        }

        @media (max-width: 640px) {
          .add-to-cart-btn {
            width: 100%;
            min-width: auto;
          }
        }

        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(40, 167, 69, 0.4);
          background: linear-gradient(135deg, #218838 0%, #1caa7e 100%);
        }

        .add-to-cart-btn:disabled {
          background: #cccccc;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }

        .add-to-cart-btn.disabled:hover {
          transform: none;
        }

        .add-to-cart-btn.added {
          background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
        }

        .btn-text {
          flex: 1;
          text-align: left;
        }

        .btn-price {
          font-size: 18px;
          font-weight: 800;
          opacity: 0.9;
        }

        /* List View */
        .raffle-list-item {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .raffle-list-item:hover {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border-color: #FFD166;
        }

        .list-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .list-icon {
          flex-shrink: 0;
        }

        .ticket-icon {
          color: #FFD166;
        }

        .list-info h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1A1A2E;
          margin: 0 0 8px 0;
        }

        .list-info p {
          font-size: 14px;
          color: #666;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .list-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tag.new {
          background: #fff0f0;
          color: #ff6b6b;
        }

        .tag.time {
          background: #f0f8ff;
          color: #667eea;
        }

        .list-price {
          text-align: right;
          flex-shrink: 0;
          margin-left: auto;
        }

        .list-price .price {
          display: block;
          font-size: 24px;
          font-weight: 800;
          color: #1A1A2E;
          line-height: 1;
        }

        .list-price .unit {
          font-size: 13px;
          color: #666;
        }

        .expand-btn {
          width: 100%;
          padding: 12px;
          background: #f8f9fa;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1A1A2E;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .expand-btn:hover {
          background: #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default RaffleProductCard;