import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Heart, Share2, Package, Info, Zap, Check, Users, 
  Tag, Target, Ticket, Users as UsersIcon, Gift, Calendar, 
  MapPin, Crown, Sparkles, Search, Star, Clock,
  ChevronDown, ChevronUp, Shield, Trophy, TrendingUp,
  AlertCircle, CheckCircle, Award, BarChart3
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './RaffleProductCard.css'

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
    </div>
  );
};

export default RaffleProductCard;