import React, { useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { Filter, Search, Package, Grid, List, ChevronDown, Tag, Star, Zap } from 'lucide-react';
import { productsData, categories, categoryColors } from '../../data/products';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar produtos
  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar produtos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
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

  // Contar produtos por categoria
  const categoryCounts = categories.reduce((acc, category) => {
    if (category.id === 'all') {
      acc[category.id] = productsData.length;
    } else {
      acc[category.id] = productsData.filter(p => p.category === category.id).length;
    }
    return acc;
  }, {});

  // Produtos em destaque (com badge)
  const featuredProducts = productsData.filter(p => p.badge).slice(0, 4);

  return (
    <section className="products-section">
      <div className="container">
        {/* Cabeçalho do catálogo */}
        <div className="catalog-header">
          <div className="header-content">
            <div className="header-title">
              <Package size={40} className="title-icon" />
              <div>
                <h1 className="main-title">Catálogo de Produtos</h1>
                <p className="subtitle">Encontre os melhores produtos para apoiar nossa formatura</p>
              </div>
            </div>
            
            <div className="header-stats">
              <div className="stat">
                <span className="stat-number">{productsData.length}</span>
                <span className="stat-label">Produtos</span>
              </div>
              <div className="stat">
                <span className="stat-number">{categories.length - 1}</span>
                <span className="stat-label">Categorias</span>
              </div>
            </div>
          </div>

          {/* Banner de destaque */}
          <div className="featured-banner">
            <div className="banner-content">
              <div className="banner-icon">⚡</div>
              <div className="banner-text">
                <h3>Produtos Exclusivos da Turma</h3>
                <p>Todos os itens são preparados com carinho pelos alunos</p>
              </div>
            </div>
            <div className="banner-decoration"></div>
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

            {/* Busca */}
            <div className="filter-group">
              <label className="filter-label">
                <Search size={16} />
                Buscar produtos
              </label>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Digite o nome ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Categorias */}
            <div className="filter-group">
              <label className="filter-label">
                <Tag size={16} />
                Categorias
              </label>
              <div className="categories-list">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      '--category-color': categoryColors[category.id] || '#6C757D'
                    }}
                  >
                    <span className="category-emoji">{category.emoji}</span>
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">{categoryCounts[category.id]}</span>
                  </button>
                ))}
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
                  Padrão
                </button>
                <button 
                  className={`sort-btn ${sortBy === 'price-low' ? 'active' : ''}`}
                  onClick={() => setSortBy('price-low')}
                >
                  Menor preço
                </button>
                <button 
                  className={`sort-btn ${sortBy === 'price-high' ? 'active' : ''}`}
                  onClick={() => setSortBy('price-high')}
                >
                  Maior preço
                </button>
                <button 
                  className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
                  onClick={() => setSortBy('popular')}
                >
                  Mais populares
                </button>
              </div>
            </div>

            {/* Produtos em destaque */}
            {featuredProducts.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">
                  <Zap size={16} />
                  Em Destaque
                </label>
                <div className="featured-list">
                  {featuredProducts.map(product => (
                    <div key={product.id} className="featured-item">
                      <span className="featured-emoji">{product.emoji}</span>
                      <div className="featured-info">
                        <h4>{product.name}</h4>
                        <p className="featured-price">R$ {product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
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
                Limpar todos os filtros
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
                    </span>
                  )}
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
                    <option value="default">Ordenar por: Padrão</option>
                    <option value="price-low">Ordenar por: Menor preço</option>
                    <option value="price-high">Ordenar por: Maior preço</option>
                    <option value="name">Ordenar por: Nome</option>
                    <option value="popular">Ordenar por: Mais populares</option>
                  </select>
                  <ChevronDown size={16} className="dropdown-icon" />
                </div>
              </div>
            </div>

            {/* Grid/Lista de produtos */}
            {sortedProducts.length > 0 ? (
              <div className={`products-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
                {/* AQUI ESTÁ O USO CORRETO DO PRODUCTCARD */}
                {sortedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index % 10} // Limita o delay máximo para 10 diferentes
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">😕</div>
                <h3 className="empty-title">Nenhum produto encontrado</h3>
                <p className="empty-description">
                  Não encontramos produtos que correspondam aos seus critérios de busca.
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortBy('default');
                  }}
                >
                  Limpar filtros e ver todos
                </button>
              </div>
            )}

            {/* Informações de compra */}
            <div className="purchase-guide">
              <h3 className="guide-title">📦 Como Comprar</h3>
              <div className="guide-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Escolha seus produtos</h4>
                    <p>Selecione os itens e quantidades desejadas</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Anote os detalhes</h4>
                    <p>Escreva nome completo dos produtos e quantidades</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Entre em contato</h4>
                    <p>Envie a lista pelo WhatsApp da turma</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Faça o pagamento</h4>
                    <p>Pague via PIX e envie o comprovante</p>
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

        .featured-banner {
          background: linear-gradient(135deg, var(--color-dark) 0%, #2D3047 100%);
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

        .products-container {
          display: grid;
          gap: var(--space-xl);
        }

        .products-container.grid-view {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .products-container.list-view {
          grid-template-columns: 1fr;
        }

        @media (max-width: 768px) {
          .products-container.grid-view {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
      `}</style>
    </section>
  );
};

export default Products;