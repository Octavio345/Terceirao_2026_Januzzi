// components/ProductsGrid/ProductsGrid.js
import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import RaffleProductCard from '../RaffleProductCard/RaffleProductCard';
import './ProductsGrid.css';

const ProductsGrid = ({ products, viewMode = 'grid' }) => {
  // Separa a rifa dos outros produtos
  const raffleProduct = products.find(product => product.category === 'rifas');
  const otherProducts = products.filter(product => product.category !== 'rifas');

  return (
    <div className="products-container">
      {/* RIFA EM DESTAQUE (SEMPRE VISÍVEL) */}
      {raffleProduct && (
        <div className="raffle-featured-section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">🎟️</span>
              RIFA DA FORMATURA
            </h2>
            <p className="section-subtitle">
              Participe e concorra a prêmios incríveis enquanto apoia nossa formatura!
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

      {/* OUTROS PRODUTOS */}
      <div className="other-products-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">🛒</span>
            Nossos Produtos
          </h2>
          <p className="section-subtitle">
            Delícias especiais para você saborear
          </p>
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
      </div>
    </div>
  );
};

export default ProductsGrid;