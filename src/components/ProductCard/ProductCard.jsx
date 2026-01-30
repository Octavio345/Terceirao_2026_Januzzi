// ATUALIZE O ProductCard PARA ADICIONAR LÓGICA DE INDISPONIBILIDADE

import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, Package, Info, Zap, Clock, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, index }) => {
  const { addToCart, openCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // VERIFICA SE O PRODUTO É UMA RIFA
  const isRaffle = product.category === 'rifas';
  
  // SE NÃO FOR RIFA E TIVER available === false OU NÃO TIVER DISPONÍVEL, MARCA COMO INDISPONÍVEL
  // Por padrão, todos os produtos não-rifas estarão indisponíveis
  const isUnavailable = !isRaffle && !product.available;

  const handleLikeClick = () => {
    if (!isUnavailable) {
      setIsLiked(!isLiked);
    }
  };

  const handleShareClick = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const handleAddToCart = () => {
    if (!isUnavailable && product.stock > 0 && addToCart) {
      addToCart(product);
      if (openCart) openCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'doces': '#FF9AA2',
      'bebidas': '#A0CED9',
      'rifas': '#FFDAC1',
      'personalizados': '#B5EAD7',
      'default': '#E2F0CB'
    };
    return colors[category] || colors.default;
  };

  return (
    <div 
      className={`product-card ${isUnavailable ? 'unavailable' : ''}`}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Badge do produto - Mostra badge de indisponível */}
      {isUnavailable ? (
        <div className="product-badge badge-unavailable">
          <AlertCircle size={12} />
          <span>Indisponível</span>
        </div>
      ) : product.badge && (
        <div className={`product-badge badge-${product.badge}`}>
          {product.badge === 'novidade' && '✨'}
          {product.badge === 'popular' && '🔥'}
          {product.badge === 'limited' && '⭐'}
          <span>{product.badge === 'novidade' ? 'Novidade!' : 
                 product.badge === 'popular' ? 'Mais Vendido!' : 'Edição Limitada!'}</span>
        </div>
      )}

      {/* Imagem do produto */}
      <div className="product-image-container">
        <div className="product-image">
          <span className="product-emoji">{product.emoji}</span>
          {/* Overlay de indisponibilidade */}
          {isUnavailable && (
            <div className="unavailable-overlay">
              <Clock size={32} />
              <span>Indisponível</span>
            </div>
          )}
        </div>
        
        {/* Ações rápidas - Desabilitadas para indisponíveis */}
        <div className="product-actions">
          <button 
            className={`action-btn ${isLiked ? 'liked' : ''} ${isUnavailable ? 'disabled' : ''}`}
            onClick={handleLikeClick}
            disabled={isUnavailable}
            aria-label={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          </button>
          
          <button 
            className={`action-btn ${isAnimating ? 'animating' : ''}`}
            onClick={handleShareClick}
            aria-label="Compartilhar produto"
          >
            <Share2 size={18} />
            {isAnimating && <span className="share-tooltip">Link copiado!</span>}
          </button>
        </div>

        {/* Categoria */}
        <div 
          className="product-category"
          style={{ 
            backgroundColor: getCategoryColor(product.category),
            opacity: isUnavailable ? 0.6 : 1
          }}
        >
          {product.category}
        </div>
      </div>

      {/* Informações do produto */}
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-description">{product.description}</p>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Detalhes */}
        <div className="product-details">
          <div className="detail">
            <Package size={14} />
            <span>Estoque: {isUnavailable ? '0' : product.stock}</span>
          </div>
          
          {product.deliveryTime && (
            <div className="detail">
              <Zap size={14} />
              <span>Entrega: {product.deliveryTime}</span>
            </div>
          )}
        </div>

        {/* Preço e botão */}
        <div className="product-footer">
          <div className="product-pricing">
            <div className="price-container">
              <span className="product-price">R$ {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="original-price">R$ {product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            {product.discount && !isUnavailable && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
          </div>

          <button 
            className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${isUnavailable || product.stock === 0 ? 'out-of-stock' : ''}`}
            onClick={handleAddToCart}
            disabled={isUnavailable || product.stock === 0}
            aria-label={isUnavailable || product.stock === 0 ? 'Produto indisponível' : 'Adicionar ao carrinho'}
          >
            <ShoppingBag size={18} />
            <span>
              {isAdded ? 'Adicionado!' : 
               isUnavailable ? 'Indisponível' :
               product.stock === 0 ? 'Esgotado' : 
               'Adicionar'}
            </span>
          </button>
        </div>

        {/* Mensagem de indisponibilidade */}
        {isUnavailable && (
          <div className="unavailable-notice">
            <AlertCircle size={14} />
            <span>Este produto está temporariamente indisponível. Somente rifas estão disponíveis no momento.</span>
          </div>
        )}

        {/* Informações extras */}
        {product.shippingInfo && (
          <div className="shipping-info">
            <Info size={14} />
            <span>{product.shippingInfo}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .product-card {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
          position: relative;
          opacity: 0;
          animation: fadeInUp 0.6s var(--ease-smooth) forwards;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-card.unavailable {
          opacity: 0.7;
          filter: grayscale(0.3);
        }

        .product-card.unavailable:hover {
          transform: none;
          box-shadow: var(--shadow-sm);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card:hover:not(.unavailable) {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
        }

        /* Badge de indisponível */
        .badge-unavailable {
          background: linear-gradient(135deg, #6C757D, #495057);
          color: white;
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Overlay de indisponibilidade na imagem */
        .unavailable-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          gap: 0.5rem;
          z-index: 5;
        }

        .unavailable-overlay span {
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Ações desabilitadas */
        .action-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.disabled:hover {
          transform: none;
          background: rgba(255, 255, 255, 0.9);
        }

        /* Aviso de indisponibilidade */
        .unavailable-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: var(--space-md);
          padding: 0.75rem;
          background: rgba(108, 117, 125, 0.1);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          color: #666;
          line-height: 1.4;
        }

        /* Badge do produto */
        .product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--color-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-novidade {
          background: linear-gradient(135deg, #FFD700, #FFA500);
        }

        .badge-popular {
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          color: white;
        }

        .badge-limited {
          background: linear-gradient(135deg, #9D4EDD, #7B2CBF);
          color: white;
        }

        /* Imagem */
        .product-image-container {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .product-emoji {
          font-size: 4rem;
          animation: var(--float-animation);
        }

        .product-card.unavailable .product-emoji {
          animation: none;
          opacity: 0.7;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .product-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 0.5rem;
          z-index: 10;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all var(--transition-fast);
          backdrop-filter: blur(10px);
          position: relative;
        }

        .action-btn:hover:not(.disabled) {
          background: var(--color-white);
          color: var(--color-dark);
          transform: scale(1.1);
        }

        .action-btn.liked {
          color: #FF6B6B;
        }

        .action-btn.animating {
          color: var(--color-yellow);
        }

        .share-tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-dark);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .product-category {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-dark);
          text-transform: capitalize;
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        /* Informações do produto */
        .product-info {
          padding: var(--space-lg);
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-header {
          margin-bottom: var(--space-md);
        }

        .product-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-dark);
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .product-card.unavailable .product-title {
          color: #666;
        }

        .product-description {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        .product-card.unavailable .product-description {
          opacity: 0.8;
        }

        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: var(--space-md);
        }

        .tag {
          background: var(--color-light-gray);
          color: #666;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .product-details {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #666;
        }

        .product-card.unavailable .detail {
          opacity: 0.7;
        }

        /* Rodapé do produto */
        .product-footer {
          margin-top: auto;
          padding-top: var(--space-md);
          border-top: 1px solid var(--color-gray);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-md);
        }

        .product-pricing {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .price-container {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .product-price {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-dark);
        }

        .product-card.unavailable .product-price {
          color: #999;
        }

        .original-price {
          font-size: 0.875rem;
          color: #999;
          text-decoration: line-through;
        }

        .discount-badge {
          background: var(--color-yellow);
          color: var(--color-dark);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          align-self: flex-start;
        }

        .add-to-cart-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--color-yellow);
          color: var(--color-dark);
          border: none;
          border-radius: var(--radius-md);
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-normal);
          flex-shrink: 0;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: var(--color-yellow-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .add-to-cart-btn.added {
          background: #4CAF50;
          color: white;
        }

        .add-to-cart-btn.out-of-stock {
          background: #cccccc;
          color: #666;
        }

        .shipping-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: var(--space-md);
          padding: 0.75rem;
          background: rgba(173, 216, 230, 0.1);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: #666;
        }

        /* Variáveis CSS fallback */
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
          --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);
          --shadow-xl: 0 10px 40px rgba(0, 0, 0, 0.15);
          --transition-fast: 0.2s ease;
          --transition-normal: 0.3s ease;
          --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
          --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
          --float-animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;