import React, { useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import RaffleProductCard from '../RaffleProductCard/RaffleProductCard'; // Importe o novo componente
import { Filter, Search, Package, Grid, List, ChevronDown, Tag, Star, Zap, Ticket } from 'lucide-react';
import { productsData, categories, categoryColors } from '../../data/products';
import './Products.css'

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

  // Verificar se há rifas nos produtos filtrados
  const hasRaffles = sortedProducts.some(product => product.category === 'rifas');

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

          {/* Banner de destaque - Especial para rifas */}
          {hasRaffles && (
            <div className="raffle-featured-banner">
              <div className="banner-content">
                <div className="banner-icon">🎟️</div>
                <div className="banner-text">
                  <h3>🎁 RIFA ESPECIAL: Ingresso Hot Planet!</h3>
                  <p>Adquira números da rifa e concorra a 1 ingresso + 2 acompanhantes</p>
                </div>
              </div>
              <div className="banner-decoration"></div>
            </div>
          )}

          {/* Banner padrão quando não há rifas */}
          {!hasRaffles && (
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
          )}
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

            {/* Instruções especiais para rifas */}
            {selectedCategory === 'rifas' && (
              <div className="raffle-instructions-sidebar">
                <div className="instructions-header">
                  <Ticket size={16} />
                  <h4>Como Funciona a Rifa</h4>
                </div>
                <div className="instructions-content">
                  <div className="instruction-step">
                    <div className="step-number">1</div>
                    <p>Selecione sua turma</p>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">2</div>
                    <p>Escolha até 10 números</p>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">3</div>
                    <p>Adicione ao carrinho</p>
                  </div>
                  <div className="instruction-step">
                    <div className="step-number">4</div>
                    <p>Finalize o pedido</p>
                  </div>
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
                {sortedProducts.map((product, index) => {
                  // Usar RaffleProductCard para produtos do tipo 'rifas'
                  if (product.category === 'rifas') {
                    return (
                      <RaffleProductCard 
                        key={product.id} 
                        product={product} 
                        index={index % 10}
                      />
                    );
                  } else {
                    // Usar ProductCard normal para outros produtos
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

            {/* Informações específicas para rifas */}
            {hasRaffles && (
              <div className="raffle-info-section">
                <h3 className="raffle-info-title">
                  <Ticket size={24} />
                  Informações Importantes sobre as Rifas
                </h3>
                <div className="raffle-info-grid">
                  <div className="info-card">
                    <div className="info-icon">🏆</div>
                    <div className="info-content">
                      <h4>Prêmio Principal</h4>
                      <p>1 ingresso Hot Planet Araçatuba + 2 acompanhantes</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">👥</div>
                    <div className="info-content">
                      <h4>Divisão por Turma</h4>
                      <p>3ºA (001-099) • 3ºB (100-199) • 3ºTech (200-299)</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">📅</div>
                    <div className="info-content">
                      <h4>Sorteio</h4>
                      <p>Será realizado presencialmente na escola</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">🎯</div>
                    <div className="info-content">
                      <h4>Como Participar</h4>
                      <p>Selecione sua turma, escolha seus números e adicione ao carrinho</p>
                    </div>
                  </div>
                </div>
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
                    <h4>Adicione ao carrinho</h4>
                    <p>Confira os itens selecionados</p>
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
    </section>
  );
};

export default Products;