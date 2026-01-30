import React, { useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import RaffleProductCard from '../RaffleProductCard/RaffleProductCard';
import { Filter, Search, Package, Grid, List, ChevronDown, Tag, Star, Ticket, AlertCircle } from 'lucide-react';
import { productsData, categories, categoryColors } from '../../data/products';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  // FUNÇÃO SIMPLES PARA PROCESSAR OS PRODUTOS - AQUI É ONDE A MÁGICA ACONTECE!
  const processProducts = (products) => {
    return products.map(product => {
      // Se não for rifa, marca como INDISPONÍVEL
      if (product.category !== 'rifas') {
        return {
          ...product,
          available: false,       // Força indisponível
          stock: 0,               // Estoque zero
          // Adiciona mensagem clara
          description: `${product.description} 🔒 INDISPONÍVEL - Apenas rifas estão disponíveis no momento`,
          // Flag para UI
          isUnavailable: true
        };
      }
      // Se for rifa, mantém disponível
      return {
        ...product,
        available: true,
        isRaffle: true
      };
    });
  };

  // Processa os produtos uma vez
  const processedProducts = processProducts(productsData);

  // Filtrar produtos
  const filteredProducts = processedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar produtos - COLOCA RIFAS SEMPRE EM PRIMEIRO
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Rifas sempre primeiro
    if (a.category === 'rifas' && b.category !== 'rifas') return -1;
    if (b.category === 'rifas' && a.category !== 'rifas') return 1;
    
    switch(sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
        return (a.badge === 'popular' ? -1 : 1);
      default:
        return 0;
    }
  });

  // Contar produtos disponíveis (apenas rifas)
  const availableProductsCount = processedProducts.filter(p => p.category === 'rifas').length;

  // Contar produtos por categoria
  const categoryCounts = categories.reduce((acc, category) => {
    if (category.id === 'all') {
      acc[category.id] = processedProducts.length;
    } else {
      acc[category.id] = processedProducts.filter(p => p.category === category.id).length;
    }
    return acc;
  }, {});



  // Mostrar contagem de indisponíveis
  const unavailableCount = sortedProducts.filter(p => p.category !== 'rifas').length;

  return (
    <section className="products-section">
      <div className="container">
        {/* Cabeçalho com aviso GRANDE */}
        <div className="catalog-header">
          <div className="header-content">
            <div className="header-title">
              <Package size={40} className="title-icon" />
              <div>
                <h1 className="main-title">Catálogo de Produtos</h1>
                <p className="subtitle">
                  {selectedCategory === 'rifas' 
                    ? '🎟️ Participe da nossa Rifa Especial!' 
                    : '⚠️ APENAS RIFAS DISPONÍVEIS - Demais produtos serão liberados em breve'}
                </p>
              </div>
            </div>
            
            <div className="header-stats">
              <div className="stat">
                <span className="stat-number" style={{color: '#28a745'}}>{availableProductsCount}</span>
                <span className="stat-label">Disponíveis</span>
              </div>
              <div className="stat">
                <span className="stat-number" style={{color: '#dc3545'}}>{unavailableCount}</span>
                <span className="stat-label">Indisponíveis</span>
              </div>
            </div>
          </div>

          {/* BANNER DE AVISO GRANDE */}
          <div className="availability-banner">
            <div className="banner-content">
              <div className="banner-icon">🚨</div>
              <div className="banner-text">
                <h3>ATENÇÃO: APENAS A RIFA ESTÁ DISPONÍVEL</h3>
                <p>Os produtos de doces, salgados, bebidas e combos NÃO podem ser comprados no momento. 
                Serão liberados em breve. <strong>Apenas a Rifa da Formatura está disponível para compra!</strong></p>
                <div className="banner-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setSelectedCategory('rifas')}
                  >
                    🎟️ Ir para Rifa
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSortBy('default');
                    }}
                  >
                    Ver Todos os Produtos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="catalog-content">
          {/* Sidebar de filtros */}
          <aside className={`catalog-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="sidebar-header">
              <h3 className="sidebar-title">
                <Filter size={20} />
                Filtros
              </h3>
              <button 
                className="close-filters"
                onClick={() => setShowFilters(false)}
              >
                &times;
              </button>
            </div>

            {/* AVISO VISÍVEL */}
            <div className="availability-notice-sidebar">
              <AlertCircle size={24} color="#dc3545" />
              <div className="notice-content-sidebar">
                <h4>Status de Disponibilidade</h4>
                <div className="availability-status">
                  <span className="status-item available">✅ Rifas: DISPONÍVEL</span>
                  <span className="status-item unavailable">❌ Outros: INDISPONÍVEL</span>
                </div>
              </div>
            </div>

            {/* Busca */}
            <div className="filter-group">
              <label className="filter-label">
                <Search size={16} />
                Buscar produtos
              </label>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Categorias com status claro */}
            <div className="filter-group">
              <label className="filter-label">
                <Tag size={16} />
                Categorias
              </label>
              <div className="categories-list">
                {categories.map(category => {
                  const isRaffle = category.id === 'rifas';
                  const isAll = category.id === 'all';
                  const isActive = selectedCategory === category.id;
                  const isDisabled = !isRaffle && !isAll;
                  
                  return (
                    <button
                      key={category.id}
                      className={`category-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedCategory(category.id);
                        }
                      }}
                      disabled={isDisabled}
                      style={{
                        '--category-color': categoryColors[category.id] || '#6C757D',
                        opacity: isDisabled ? 0.6 : 1
                      }}
                      title={isDisabled ? 'Esta categoria está indisponível no momento' : ''}
                    >
                      <span className="category-emoji">{category.emoji}</span>
                      <span className="category-name">
                        {category.name}
                        {isRaffle && <span className="availability-badge available">DISPONÍVEL</span>}
                        {isDisabled && <span className="availability-badge unavailable">INDISPONÍVEL</span>}
                      </span>
                      <span className="category-count">{categoryCounts[category.id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ordenação */}
            <div className="filter-group">
              <label className="filter-label">
                <Star size={16} />
                Ordenar por
              </label>
              <div className="sort-options">
                <button 
                  className={`sort-btn ${sortBy === 'default' ? 'active' : ''}`}
                  onClick={() => setSortBy('default')}
                >
                  🎟️ Rifas primeiro
                </button>
                <button 
                  className={`sort-btn ${sortBy === 'price-low' ? 'active' : ''}`}
                  onClick={() => setSortBy('price-low')}
                >
                  💰 Menor preço
                </button>
                <button 
                  className={`sort-btn ${sortBy === 'price-high' ? 'active' : ''}`}
                  onClick={() => setSortBy('price-high')}
                >
                  💵 Maior preço
                </button>
              </div>
            </div>

            {/* Instruções da rifa */}
            {selectedCategory === 'rifas' || selectedCategory === 'all' ? (
              <div className="raffle-instructions-sidebar">
                <div className="instructions-header">
                  <Ticket size={16} />
                  <h4>🎟️ Como Participar</h4>
                </div>
                <div className="instructions-content">
                  <div className="instruction-step">
                    <div className="step-number">1</div>
                    <p>Escolha números disponíveis</p>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">2</div>
                    <p>Adicione ao carrinho</p>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">3</div>
                    <p>Finalize o pedido</p>
                  </div>
                </div>
                <div className="raffle-prize">
                  <div className="prize-icon">🏆</div>
                  <div className="prize-text">
                    <strong>Prêmio:</strong> 1 ingresso Hot Planet + 2 acompanhantes
                  </div>
                </div>
              </div>
            ) : (
              <div className="unavailable-notice-sidebar">
                <div className="unavailable-icon">🚫</div>
                <div className="unavailable-text">
                  <h4>Categoria Indisponível</h4>
                  <p>Esta categoria não está disponível para compra no momento.</p>
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => setSelectedCategory('rifas')}
                  >
                    Ver Rifa Disponível
                  </button>
                </div>
              </div>
            )}

            {/* Botão limpar filtros */}
            {(searchTerm || selectedCategory !== 'all' || sortBy !== 'default') && (
              <button 
                className="btn btn-outline w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSortBy('default');
                }}
              >
                Limpar filtros
              </button>
            )}
          </aside>

          {/* Conteúdo principal */}
          <main className="catalog-main">
            {/* Controles superiores */}
            <div className="catalog-controls">
              <div className="controls-left">
                <button 
                  className="filters-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} />
                  Filtros
                </button>
                
                <div className="results-info">
                  <span className="results-count">
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  </span>
                  {selectedCategory !== 'all' && (
                    <span className="category-selected">
                      na categoria "{categories.find(c => c.id === selectedCategory)?.name}"
                      {selectedCategory !== 'rifas' && (
                        <span className="unavailable-tag"> (INDISPONÍVEL)</span>
                      )}
                    </span>
                  )}
                  <div className="availability-count">
                    <span className="available-count">✅ {sortedProducts.filter(p => p.category === 'rifas').length} disponíveis</span>
                    <span className="unavailable-count">❌ {sortedProducts.filter(p => p.category !== 'rifas').length} indisponíveis</span>
                  </div>
                </div>
              </div>

              <div className="controls-right">
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Visualização em grade"
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="Visualização em lista"
                  >
                    <List size={18} />
                  </button>
                </div>

                <div className="sort-dropdown">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="default">🎟️ Rifas primeiro</option>
                    <option value="price-low">💰 Menor preço</option>
                    <option value="price-high">💵 Maior preço</option>
                    <option value="name">📝 Nome A-Z</option>
                  </select>
                  <ChevronDown size={16} className="dropdown-icon" />
                </div>
              </div>
            </div>

            {/* AVISO VISÍVEL quando não está vendo rifas */}
            {selectedCategory !== 'rifas' && selectedCategory !== 'all' && (
              <div className="category-unavailable-alert">
                <div className="alert-content">
                  <div className="alert-icon">🚫</div>
                  <div className="alert-text">
                    <h4>ESTA CATEGORIA NÃO ESTÁ DISPONÍVEL</h4>
                    <p>Os produtos desta categoria não podem ser comprados no momento. 
                    <strong> Apenas a Rifa da Formatura está disponível.</strong></p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSelectedCategory('rifas')}
                    >
                      🎟️ Ir para Rifa Disponível
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid/Lista de produtos */}
            {sortedProducts.length > 0 ? (
              <div className={`products-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
                {sortedProducts.map((product, index) => {
                  // Se for rifa, mostra normalmente
                  if (product.category === 'rifas') {
                    return (
                      <RaffleProductCard 
                        key={product.id} 
                        product={product} 
                        index={index % 10}
                      />
                    );
                  } else {
                    // Se não for rifa, passa com flag de indisponível
                    return (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        index={index % 10}
                      />
                    );
                  }
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">😕</div>
                <h3 className="empty-title">Nenhum produto encontrado</h3>
                <p className="empty-description">
                  Não encontramos produtos que correspondam aos seus critérios.
                  {selectedCategory !== 'rifas' && ' Lembre-se: apenas a Rifa está disponível!'}
                </p>
                <div className="empty-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('rifas');
                      setSortBy('default');
                    }}
                  >
                    🎟️ Ver Rifa
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSortBy('default');
                    }}
                  >
                    Ver Todos
                  </button>
                </div>
              </div>
            )}

            {/* Seção informativa */}
            <div className="availability-info-section">
              <div className="info-header">
                <h3>📋 Informações Importantes</h3>
                <p>Entenda a disponibilidade dos produtos</p>
              </div>
              <div className="info-grid">
                <div className="info-card available-card">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <h4>DISPONÍVEL AGORA</h4>
                    <p><strong>Rifa da Formatura 2026</strong></p>
                    <ul>
                      <li>🎟️ Preço: R$ 15,00 por número</li>
                      <li>🏆 Prêmio: 1 ingresso Hot Planet + 2 acompanhantes</li>
                      <li>📅 Sorteio: 15/03/2026 na escola</li>
                    </ul>
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => setSelectedCategory('rifas')}
                    >
                      Participar Agora
                    </button>
                  </div>
                </div>
                
                <div className="info-card unavailable-card">
                  <div className="card-icon">⏳</div>
                  <div className="card-content">
                    <h4>INDISPONÍVEIS TEMPORARIAMENTE</h4>
                    <p><strong>Serão liberados em breve:</strong></p>
                    <ul>
                      <li>🍰 Doces & Sobremesas</li>
                      <li>🥪 Salgados & Lanches</li>
                      <li>🥤 Bebidas & Refrigerantes</li>
                      <li>🎁 Combos Especiais</li>
                    </ul>
                    <p className="coming-soon">Em breve disponíveis!</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <style jsx>{`
        .products-section {
          padding: var(--space-2xl) 0;
          background: var(--color-light-gray);
          min-height: 100vh;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--space-lg);
        }

        .catalog-header {
          margin-bottom: var(--space-2xl);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-xl);
          flex-wrap: wrap;
          gap: var(--space-lg);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex: 1;
          min-width: 300px;
        }

        .title-icon {
          color: var(--color-yellow);
          background: rgba(255, 209, 102, 0.1);
          padding: var(--space-sm);
          border-radius: var(--radius-lg);
          flex-shrink: 0;
        }

        .main-title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 800;
          color: var(--color-dark);
          margin-bottom: var(--space-xs);
          line-height: 1.1;
        }

        .subtitle {
          color: #666;
          font-size: clamp(1rem, 1.5vw, 1.125rem);
          max-width: 600px;
        }

        .header-stats {
          display: flex;
          gap: var(--space-xl);
          background: var(--color-white);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          flex-shrink: 0;
        }

        .stat {
          text-align: center;
          min-width: 80px;
        }

        .stat-number {
          display: block;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800;
          color: var(--color-yellow);
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.25rem;
        }

        /* Banner de disponibilidade */
        .availability-banner {
          background: linear-gradient(135deg, #FFF3CD 0%, #FFECB5 100%);
          border: 2px solid #FFC107;
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          position: relative;
          overflow: hidden;
          color: #856404;
          margin-bottom: var(--space-lg);
        }

        /* Banner especial para rifas */
        .raffle-featured-banner {
          background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          position: relative;
          overflow: hidden;
          color: var(--color-white);
          margin-top: var(--space-lg);
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          position: relative;
          z-index: 2;
          flex-wrap: wrap;
        }

        .banner-icon {
          font-size: clamp(2rem, 4vw, 3rem);
          animation: float 3s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .banner-text {
          flex: 1;
          min-width: 250px;
        }

        .banner-text h3 {
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .banner-text p {
          opacity: 0.9;
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .banner-decoration {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: radial-gradient(circle at 80% 20%, rgba(255, 209, 102, 0.1) 0%, transparent 50%);
          z-index: 1;
        }

        .catalog-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-xl);
        }

        @media (max-width: 992px) {
          .catalog-content {
            grid-template-columns: 1fr;
          }
          
          .catalog-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 90%;
            max-width: 400px;
            height: 100vh;
            background: var(--color-white);
            z-index: 1000;
            padding: var(--space-xl);
            overflow-y: auto;
            transition: left 0.4s var(--ease-bounce);
            box-shadow: var(--shadow-xl);
          }
          
          .catalog-sidebar.show {
            left: 0;
          }
        }

        @media (min-width: 993px) {
          .filters-toggle {
            display: none;
          }
          
          .close-filters {
            display: none;
          }
        }

        /* Aviso de disponibilidade na sidebar */
        .availability-notice-sidebar {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          margin-bottom: var(--space-lg);
          border: 1px solid #dee2e6;
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
        }

        .notice-icon-sidebar {
          color: #6c757d;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notice-content-sidebar h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.25rem;
        }

        .notice-content-sidebar p {
          font-size: 0.75rem;
          color: #6c757d;
          line-height: 1.4;
          margin: 0;
        }

        /* Categorias indisponíveis */
        .disabled-category {
          opacity: 0.6;
          cursor: not-allowed !important;
        }

        .disabled-category:hover {
          transform: none !important;
          background: var(--color-light-gray) !important;
        }

        .disabled-category.active {
          opacity: 0.8;
        }

        .unavailable-badge {
          display: inline-block;
          background: #6c757d;
          color: white;
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-sm);
          margin-left: 0.5rem;
          vertical-align: middle;
        }

        /* Instruções para rifas na sidebar */
        .raffle-instructions-sidebar {
          background: linear-gradient(135deg, #fff9db 0%, #ffec99 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
          margin-bottom: var(--space-lg);
          border: 2px solid var(--color-yellow);
        }

        .instructions-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: var(--space-md);
          color: var(--color-dark);
          font-weight: 600;
        }

        .instructions-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .instruction-step {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
          color: #666;
        }

        .instruction-step .step-number {
          width: 24px;
          height: 24px;
          background: var(--color-yellow);
          color: var(--color-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
          padding-bottom: var(--space-md);
          border-bottom: 2px solid var(--color-light-gray);
        }

        .sidebar-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          color: var(--color-dark);
          font-weight: 700;
        }

        .close-filters {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .close-filters:hover {
          background: var(--color-light-gray);
          color: var(--color-dark);
        }

        .filter-group {
          margin-bottom: var(--space-xl);
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--color-dark);
          margin-bottom: var(--space-md);
          font-size: 0.95rem;
        }

        .search-container {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.5rem;
          border: 2px solid var(--color-gray);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          transition: all var(--transition-normal);
          background: var(--color-light-gray);
          font-family: inherit;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-yellow);
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.1);
          background: var(--color-white);
        }

        .search-input::placeholder {
          color: #999;
        }

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .category-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border: none;
          background: var(--color-light-gray);
          border-radius: var(--radius-md);
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .category-btn::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: var(--category-color, #6C757D);
          transition: width var(--transition-normal);
          z-index: 1;
        }

        .category-btn:hover::before {
          width: 4px;
        }

        .category-btn.active {
          background: var(--color-white);
          border: 2px solid var(--category-color, #6C757D);
          transform: translateX(5px);
        }

        .category-btn.active::before {
          width: 4px;
        }

        .category-emoji {
          font-size: 1.25rem;
          margin-right: 0.75rem;
          z-index: 2;
          position: relative;
        }

        .category-name {
          flex: 1;
          font-weight: 500;
          color: var(--color-dark);
          z-index: 2;
          position: relative;
          display: flex;
          align-items: center;
        }

        .category-count {
          background: var(--color-gray);
          color: #666;
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
          z-index: 2;
          position: relative;
        }

        .category-btn.active .category-count {
          background: var(--category-color, #6C757D);
          color: white;
        }

        .sort-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sort-btn {
          padding: 0.75rem 1rem;
          border: 2px solid var(--color-gray);
          background: var(--color-white);
          border-radius: var(--radius-md);
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-normal);
          font-weight: 500;
        }

        .sort-btn:hover {
          border-color: var(--color-yellow);
          transform: translateX(3px);
        }

        .sort-btn.active {
          border-color: var(--color-yellow);
          background: rgba(255, 209, 102, 0.1);
          font-weight: 600;
        }

        .featured-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .featured-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--color-light-gray);
          border-radius: var(--radius-md);
          transition: all var(--transition-normal);
          cursor: pointer;
        }

        .featured-item:hover {
          transform: translateX(3px);
          background: var(--color-white);
          box-shadow: var(--shadow-sm);
        }

        .featured-emoji {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .featured-info {
          flex: 1;
          min-width: 0;
        }

        .featured-info h4 {
          font-size: 0.875rem;
          color: var(--color-dark);
          margin-bottom: 0.125rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .featured-price {
          font-size: 0.875rem;
          color: var(--color-yellow);
          font-weight: 700;
        }

        .catalog-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .catalog-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--color-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .filters-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--gradient-primary);
          color: var(--color-dark);
          border: none;
          border-radius: var(--radius-md);
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-normal);
          flex-shrink: 0;
        }

        .filters-toggle:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .results-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 200px;
        }

        .results-count {
          font-weight: 700;
          color: var(--color-dark);
          font-size: 1.125rem;
        }

        .category-selected {
          font-size: 0.875rem;
          color: #666;
        }

        .availability-hint {
          font-size: 0.75rem;
          color: #ff9800;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          flex-wrap: wrap;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
          background: var(--color-light-gray);
          padding: 0.25rem;
          border-radius: var(--radius-md);
        }

        .view-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: #999;
          transition: all var(--transition-fast);
        }

        .view-btn:hover {
          color: var(--color-dark);
          background: var(--color-white);
        }

        .view-btn.active {
          background: var(--color-white);
          color: var(--color-yellow);
          box-shadow: var(--shadow-sm);
        }

        .sort-dropdown {
          position: relative;
          min-width: 200px;
        }

        .sort-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--color-gray);
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 0.95rem;
          appearance: none;
          cursor: pointer;
          background: var(--color-white);
          color: var(--color-dark);
          font-weight: 500;
        }

        .sort-select:focus {
          outline: none;
          border-color: var(--color-yellow);
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.1);
        }

        .dropdown-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #666;
        }

        /* Aviso de categoria indisponível */
        .category-unavailable-notice {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          border: 2px solid #dee2e6;
          animation: slideIn 0.5s var(--ease-smooth);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notice-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .notice-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .notice-text h4 {
          color: #495057;
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }

        .notice-text p {
          color: #6c757d;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: var(--space-md);
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .products-container {
          display: grid;
          gap: var(--space-xl);
        }

        .products-container.grid-view {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .products-container.list-view {
          grid-template-columns: 1fr;
        }

        @media (max-width: 768px) {
          .products-container.grid-view {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--space-md);
          }
        }

        @media (max-width: 480px) {
          .products-container.grid-view {
            grid-template-columns: 1fr;
          }
          
          .catalog-controls {
            flex-direction: column;
            align-items: stretch;
            gap: var(--space-md);
          }
          
          .controls-left, .controls-right {
            width: 100%;
          }
          
          .sort-dropdown {
            min-width: 100%;
          }
          
          .notice-content {
            flex-direction: column;
            text-align: center;
          }
        }

        .empty-state {
          text-align: center;
          padding: var(--space-2xl) var(--space-xl);
          background: var(--color-white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
          animation: fadeIn 0.6s var(--ease-smooth);
        }

        .empty-icon {
          font-size: clamp(3rem, 6vw, 4rem);
          margin-bottom: var(--space-lg);
          opacity: 0.5;
        }

        .empty-title {
          font-size: clamp(1.5rem, 3vw, 1.75rem);
          color: var(--color-dark);
          margin-bottom: var(--space-md);
        }

        .empty-description {
          color: #666;
          max-width: 500px;
          margin: 0 auto var(--space-xl);
          line-height: 1.6;
          font-size: clamp(0.875rem, 1.5vw, 1rem);
        }

        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-family: inherit;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all var(--transition-normal);
          text-decoration: none;
          text-align: center;
        }

        .btn-primary {
          background: var(--color-yellow);
          color: var(--color-dark);
        }

        .btn-primary:hover {
          background: var(--color-yellow-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .btn-outline {
          background: transparent;
          border: 2px solid var(--color-dark);
          color: var(--color-dark);
        }

        .btn-outline:hover {
          background: var(--color-dark);
          color: var(--color-white);
        }

        .w-full {
          width: 100%;
        }

        /* Aviso geral sobre disponibilidade */
        .general-availability-notice {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          border: 2px solid #2196f3;
          margin-top: var(--space-xl);
        }

        .notice-title {
          text-align: center;
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          color: #1565c0;
          margin-bottom: var(--space-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
        }

        .notice-content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-lg);
        }

        .notice-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: rgba(255, 255, 255, 0.9);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }

        .notice-item:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-sm);
        }

        .notice-item-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notice-item-content h4 {
          color: #1565c0;
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }

        .notice-item-content p {
          color: #1976d2;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Seção de informações das rifas */
        .raffle-info-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          margin-top: var(--space-xl);
          border: 2px solid var(--color-yellow);
        }

        .raffle-info-title {
          text-align: center;
          font-size: clamp(1.5rem, 3vw, 1.75rem);
          color: var(--color-dark);
          margin-bottom: var(--space-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
        }

        .raffle-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-lg);
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: white;
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }

        .info-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .info-content h4 {
          color: var(--color-dark);
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }

        .info-content p {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Informações de compra */
        .purchase-guide {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-md);
          margin-top: var(--space-xl);
        }

        .guide-title {
          text-align: center;
          font-size: clamp(1.5rem, 3vw, 1.75rem);
          color: var(--color-dark);
          margin-bottom: var(--space-xl);
        }

        .guide-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-lg);
        }

        .step {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-lg);
          background: var(--color-light-gray);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }

        .step:hover {
          transform: translateY(-5px);
          background: var(--color-white);
          box-shadow: var(--shadow-md);
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: var(--gradient-primary);
          color: var(--color-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .step-content h4 {
          color: var(--color-dark);
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }

        .step-content p {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Animações */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Variables fallback */
        :global(*) {
          --space-xs: 0.5rem;
          --space-sm: 0.75rem;
          --space-md: 1rem;
          --space-lg: 1.5rem;
          --space-xl: 2rem;
          --space-2xl: 3rem;
          --color-dark: #1A1A2E;
          --color-yellow: #FFD166;
          --color-yellow-dark: #E5BC59;
          --color-light-gray: #F8F9FA;
          --color-gray: #E9ECEF;
          --color-white: #FFFFFF;
          --gradient-primary: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          --radius-sm: 0.25rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-full: 9999px;
          --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
          --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
          --shadow-xl: 0 10px 40px rgba(0, 0, 0, 0.15);
          --transition-fast: 0.2s ease;
          --transition-normal: 0.3s ease;
          --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
          --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
            /* Estilos adicionais para disponibilidade */
        .availability-banner {
          background: linear-gradient(135deg, #FFF3CD 0%, #FFECB5 100%);
          border: 3px solid #FFC107;
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          margin-bottom: var(--space-lg);
          position: relative;
          overflow: hidden;
        }

        .availability-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #FFC107, #FF9800);
        }

        .banner-content {
          position: relative;
          z-index: 2;
        }

        .banner-icon {
          font-size: 2.5rem;
          margin-bottom: var(--space-md);
          animation: bounce 2s infinite;
        }

        .banner-text h3 {
          color: #856404;
          font-size: 1.5rem;
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .banner-text p {
          color: #856404;
          margin-bottom: var(--space-lg);
          font-size: 1.1rem;
          line-height: 1.5;
        }

        .banner-actions {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .availability-status {
          color: #dc3545;
          font-weight: 600;
          margin-left: 5px;
        }

        .available-badge {
          background: #28a745;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
          font-weight: 600;
        }

        .unavailable-badge {
          background: #6c757d;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
          font-weight: 600;
        }

        .availability-summary {
          display: flex;
          gap: var(--space-md);
          margin-top: var(--space-sm);
        }

        .available-count, .unavailable-count {
          font-size: 0.85rem;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .available-count {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }

        .unavailable-count {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }

        .category-unavailable-notice {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          border: 2px solid #dee2e6;
          margin-bottom: var(--space-xl);
        }

        .notice-actions {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-top: var(--space-md);
        }

        .or-text {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .availability-info-section {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          border: 2px solid #2196f3;
          margin-top: var(--space-xl);
        }

        .info-title {
          text-align: center;
          color: #1565c0;
          margin-bottom: var(--space-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-lg);
        }

        .info-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }

        .info-card.available {
          border-top: 4px solid #28a745;
        }

        .info-card.unavailable {
          border-top: 4px solid #ffc107;
        }

        .info-card.instructions {
          border-top: 4px solid #9c27b0;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .card-icon {
          font-size: 1.5rem;
        }

        .card-header h4 {
          color: var(--color-dark);
          margin: 0;
          font-size: 1.1rem;
        }

        .card-content {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .card-content ul, .card-content ol {
          padding-left: var(--space-md);
          margin: var(--space-sm) 0;
        }

        .card-content li {
          margin-bottom: var(--space-xs);
        }

        .raffle-promo-banner {
          background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          color: white;
          text-align: center;
          margin-top: var(--space-xl);
        }

        .promo-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
        }

        .promo-icon {
          font-size: 3rem;
          animation: bounce 2s infinite;
        }

        .promo-text h3 {
          font-size: 1.5rem;
          margin-bottom: var(--space-xs);
        }

        .promo-text p {
          opacity: 0.9;
          margin-bottom: var(--space-md);
        }

        .btn-promo {
          background: white;
          color: #7b2cbf;
          border: none;
          padding: 0.75rem 2rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          transition: all var(--transition-normal);
        }

        .btn-promo:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
           /* BANNER DE AVISO */
        .availability-banner {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border-radius: 15px;
          padding: 25px;
          margin: 20px 0;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(220, 53, 69, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 8px 30px rgba(220, 53, 69, 0.3); }
          50% { box-shadow: 0 8px 40px rgba(220, 53, 69, 0.5); }
          100% { box-shadow: 0 8px 30px rgba(220, 53, 69, 0.3); }
        }

        .banner-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          animation: bounce 1s infinite;
        }

        .banner-text h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .banner-text p {
          opacity: 0.9;
          margin-bottom: 20px;
          font-size: 1.1rem;
          line-height: 1.5;
        }

        .banner-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        /* AVISO NA SIDEBAR */
        .availability-notice-sidebar {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .availability-status {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 5px;
        }

        .status-item {
          font-size: 0.85rem;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
          font-weight: 600;
        }

        .status-item.available {
          background: #d4edda;
          color: #155724;
        }

        .status-item.unavailable {
          background: #f8d7da;
          color: #721c24;
        }

        /* BADGES DE DISPONIBILIDADE */
        .availability-badge {
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .availability-badge.available {
          background: #28a745;
          color: white;
        }

        .availability-badge.unavailable {
          background: #6c757d;
          color: white;
        }

        /* BOTÕES DESABILITADOS */
        .category-btn.disabled {
          cursor: not-allowed !important;
          opacity: 0.6;
          position: relative;
        }

        .category-btn.disabled:hover::after {
          content: 'Indisponível';
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 0.8rem;
          white-space: nowrap;
          z-index: 100;
        }

        /* NOTAÇÃO DE INDISPONÍVEL */
        .unavailable-tag {
          color: #dc3545;
          font-weight: 700;
          margin-left: 5px;
          font-size: 0.9rem;
        }

        .availability-count {
          display: flex;
          gap: 15px;
          margin-top: 5px;
          flex-wrap: wrap;
        }

        .available-count, .unavailable-count {
          font-size: 0.85rem;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .available-count {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }

        .unavailable-count {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
        }

        /* ALERTA DE CATEGORIA INDISPONÍVEL */
        .category-unavailable-alert {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          border: 2px solid #f5c6cb;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 25px;
          text-align: center;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .alert-icon {
          font-size: 3rem;
          animation: shake 0.5s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .alert-text h4 {
          color: #721c24;
          margin-bottom: 10px;
          font-size: 1.3rem;
        }

        .alert-text p {
          color: #721c24;
          margin-bottom: 15px;
          font-size: 1rem;
        }

        /* SEÇÃO INFORMATIVA */
        .availability-info-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          padding: 25px;
          margin-top: 30px;
          border: 2px solid #dee2e6;
        }

        .info-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .info-header h3 {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }

        .info-card {
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
        }

        .available-card {
          background: white;
          border-top: 4px solid #28a745;
        }

        .unavailable-card {
          background: white;
          border-top: 4px solid #6c757d;
        }

        .card-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
        }

        .card-content h4 {
          font-size: 1.2rem;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .available-card .card-content h4 {
          color: #28a745;
        }

        .unavailable-card .card-content h4 {
          color: #6c757d;
        }

        .card-content ul {
          padding-left: 20px;
          margin: 10px 0;
        }

        .card-content li {
          margin-bottom: 5px;
          color: #666;
        }

        .coming-soon {
          font-style: italic;
          color: #999;
          margin-top: 10px;
        }

        /* BOTÕES PEQUENOS */
        .btn-small {
          padding: 6px 15px;
          font-size: 0.9rem;
        }

        /* RESPONSIVIDADE */
        @media (max-width: 768px) {
          .availability-banner {
            padding: 20px;
          }
          
          .banner-text h3 {
            font-size: 1.3rem;
          }
          
          .banner-text p {
            font-size: 1rem;
          }
          
          .banner-actions {
            flex-direction: column;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default Products;