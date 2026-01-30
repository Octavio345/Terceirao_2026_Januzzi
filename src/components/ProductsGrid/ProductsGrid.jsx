import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import RaffleProductCard from '../RaffleProductCard/RaffleProductCard';
import './ProductsGrid.css';

const ProductsGrid = ({ products, viewMode = 'grid' }) => {
  // PROCESSAMENTO LOCAL - GARANTIR QUE APENAS RIFAS ESTEJAM DISPONÍVEIS
  const processProducts = (products) => {
    return products.map(product => {
      const isRaffle = product.category === 'rifas';
      
      if (!isRaffle) {
        return {
          ...product,
          available: false,
          stock: 0,
          isUnavailable: true,
          badge: 'indisponível',
          description: `${product.description} 🔒 INDISPONÍVEL`,
          tags: [...(product.tags || []), 'indisponível']
        };
      }
      return {
        ...product,
        available: true,
        isRaffle: true,
        isUnavailable: false
      };
    });
  };

  const processedProducts = processProducts(products);
  
  const raffleProduct = processedProducts.find(product => product.category === 'rifas');
  const otherProducts = processedProducts.filter(product => product.category !== 'rifas');

  return (
    <div className="products-container">
      {/* RIFA EM DESTAQUE - ÚNICA DISPONÍVEL */}
      {raffleProduct && (
        <div className="raffle-featured-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">🎟️</span>
              RIFA DA FORMATURA 2026
              <span className="available-tag">DISPONÍVEL</span>
            </h2>
            <p className="section-subtitle">
              Único produto disponível para compra no momento!
            </p>
          </div>
          <div className="raffle-featured-card">
            <RaffleProductCard 
              product={raffleProduct} 
              index={0}
              viewMode="grid"
            />
          </div>
        </div>
      )}

      {/* OUTROS PRODUTOS COM AVISO GRANDE */}
      {otherProducts.length > 0 && (
        <div className="other-products-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">🛒</span>
              Outros Produtos
              <span className="unavailable-tag">INDISPONÍVEIS</span>
            </h2>
            <p className="section-subtitle">
              Serão liberados em breve. Apenas a rifa está disponível no momento.
            </p>
            
            <div className="availability-alert">
              <div className="alert-icon">⚠️</div>
              <div className="alert-text">
                <h4>ATENÇÃO: ESTES PRODUTOS NÃO ESTÃO DISPONÍVEIS</h4>
                <p>Você pode visualizá-los, mas não pode adicioná-los ao carrinho.</p>
                <p className="alert-note">
                  <strong>Nota:</strong> Os produtos serão liberados para compra em breve.
                </p>
              </div>
            </div>
          </div>
          
          <div className={`products-grid ${viewMode}`}>
            {otherProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
              />
            ))}
          </div>
          
          <div className="unavailable-warning">
            <div className="warning-icon">🚫</div>
            <div className="warning-content">
              <h3>Todos estes produtos estão INDISPONÍVEIS</h3>
              <p>No momento, apenas a Rifa da Formatura 2026 está disponível para compra.</p>
              <p>Os demais produtos (doces, salgados, bebidas e combos) serão liberados em breve.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;