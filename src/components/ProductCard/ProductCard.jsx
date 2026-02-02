import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, Package, Info, Zap, AlertCircle, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, index }) => {
  const { addToCart, openCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // VERIFICA SE O PRODUTO É UMA RIFA
  const isRaffle = product.category === 'rifas';
  
  // PRODUTO ESTÁ INDISPONÍVEL SE:
  // 1. Não for rifa
  // 2. Ou se tiver available === false
  // 3. Ou se tiver stock === 0
  // 4. Ou se tiver isUnavailable === true
  const isUnavailable = !isRaffle || 
                       product.available === false || 
                       product.stock === 0 || 
                       product.isUnavailable === true;

  // VERIFICA SE ESTÁ REALMENTE DISPONÍVEL
  const isAvailable = !isUnavailable && product.stock > 0;

  const handleLikeClick = () => {
    if (isAvailable) {
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
    // SE ESTIVER INDISPONÍVEL, NÃO FAZ NADA
    if (isUnavailable || !isAvailable) {
      // Mostra mensagem no console e alerta visual
      console.log('Produto indisponível para compra:', product.name);
      
      // Pode adicionar um toast ou mensagem flutuante aqui
      return;
    }
    
    if (addToCart && product.stock > 0) {
      addToCart(product);
      if (openCart) openCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'doces': '#FF6B6B',
      'salgados': '#4ECDC4',
      'bebidas': '#118AB2',
      'rifas': '#FFD166',
      'combos': '#06D6A0',
      'default': '#E2F0CB'
    };
    return colors[category] || colors.default;
  };

  // Determina qual badge mostrar
  const getBadge = () => {
    if (isUnavailable) return 'indisponível';
    if (product.badge) return product.badge;
    return null;
  };

  const badge = getBadge();

  return (
    <div 
      className={`product-card ${isUnavailable ? 'unavailable' : ''}`}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* BADGE DO PRODUTO */}
      {badge && (
        <div className={`product-badge badge-${badge}`}>
          {isUnavailable ? (
            <>
              <Lock size={12} />
              <span>INDISPONÍVEL</span>
            </>
          ) : badge === 'limited' ? (
            <>
              🎟️
              <span>RIFA DISPONÍVEL</span>
            </>
          ) : badge === 'novidade' ? (
            <>
              ✨
              <span>Novidade!</span>
            </>
          ) : badge === 'popular' ? (
            <>
              🔥
              <span>Mais Vendido!</span>
            </>
          ) : null}
        </div>
      )}

      {/* Imagem do produto com overlay de indisponibilidade */}
      <div className="product-image-container">
        <div className="product-image">
          {/* BANNER ESPECIAL PARA RIFAS */}
          {isRaffle && product.available && (
            <div className="raffle-banner">
              <img 
                src="/images/hotplanet-banner.jpg" // Imagem da sua pasta public/images/
                alt="Hot Planet Araçatuba - Prêmio da Rifa"
                className="banner-image"
                onError={(e) => {
                  // Fallback caso a imagem não exista
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="banner-fallback">
                      <div class="fallback-content">
                        <span class="fallback-icon">🏆</span>
                        <div class="fallback-text">
                          <h4>GRANDE PRÊMIO</h4>
                          <h3>Hot Planet Araçatuba</h3>
                          <p>1 ingresso + 2 acompanhantes</p>
                          <div class="prize-value">R$ 117,00</div>
                        </div>
                      </div>
                    </div>
                  `;
                }}
              />
              <div className="banner-overlay">
                <div className="banner-content">
                  <div className="prize-tag">
                    <span className="tag-icon">🏆</span>
                    <span className="tag-text">GRANDE PRÊMIO</span>
                  </div>
                  <h3 className="prize-title">Hot Planet Araçatuba</h3>
                  <p className="prize-description">1 ingresso + 2 acompanhantes</p>
                  <div className="prize-value">
                    <span className="value-icon">💰</span>
                    <span className="value-text">Prêmio: R$ 117,00</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <span className="product-emoji">{product.emoji}</span>
          
          {/* Overlay de indisponibilidade */}
          {isUnavailable && (
            <div className="unavailable-overlay">
              <div className="overlay-content">
                <Lock size={32} />
                <span className="overlay-text">DISPONÍVEL EM BREVE</span>
                <small className="overlay-subtext">Apenas rifas disponíveis</small>
              </div>
            </div>
          )}
        </div>
        
        {/* Ações rápidas */}
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
            className={`action-btn ${isAnimating ? 'animating' : ''} ${isUnavailable ? 'disabled' : ''}`}
            onClick={handleShareClick}
            aria-label="Compartilhar produto"
            disabled={isUnavailable}
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
          {isUnavailable && " (INDISPONÍVEL)"}
        </div>
      </div>

      {/* Informações do produto */}
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-description">
            {isUnavailable ? 
              `${product.description} 🔒 PRODUTO INDISPONÍVEL - Apenas a Rifa da Formatura está disponível no momento.` : 
              product.description}
          </p>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="product-tags">
            {product.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className={`tag ${tag === 'indisponível' || tag === 'disponível' ? `tag-${tag}` : ''}`}
              >
                {tag === 'indisponível' ? '🔒 ' : tag === 'disponível' ? '✅ ' : ''}{tag}
              </span>
            ))}
          </div>
        )}

        {/* Detalhes */}
        <div className="product-details">
          <div className="detail">
            <Package size={14} />
            <span className={isUnavailable ? 'detail-unavailable' : ''}>
              Estoque: {isUnavailable ? '0 (INDISPONÍVEL)' : `${product.stock} disponíveis`}
            </span>
          </div>
          
          {product.deliveryTime && isAvailable && (
            <div className="detail">
              <Zap size={14} />
              <span>Entrega: {product.deliveryTime}</span>
            </div>
          )}

          {isUnavailable && (
            <div className="detail unavailable-detail">
              <AlertCircle size={14} />
              <span>PRODUTO INDISPONÍVEL</span>
            </div>
          )}
        </div>

        {/* Preço e botão */}
        <div className="product-footer">
          <div className="product-pricing">
            <div className="price-container">
              <span className={`product-price ${isUnavailable ? 'price-unavailable' : ''}`}>
                R$ {product.price.toFixed(2)}
              </span>
              {product.originalPrice && isAvailable && (
                <span className="original-price">R$ {product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            {product.discount && isAvailable && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
          </div>

          <button 
            className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${isUnavailable ? 'unavailable-btn' : ''} ${!isAvailable ? 'disabled-btn' : ''}`}
            onClick={handleAddToCart}
            disabled={isUnavailable || !isAvailable}
            aria-label={isUnavailable ? 'Produto indisponível' : !isAvailable ? 'Produto esgotado' : 'Adicionar ao carrinho'}
          >
            {isUnavailable ? (
              <>
                <Lock size={16} />
                <span>INDISPONÍVEL</span>
              </>
            ) : isAdded ? (
              <>
                <ShoppingBag size={18} />
                <span>Adicionado!</span>
              </>
            ) : !isAvailable ? (
              <>
                <span className="btn-icon">😔</span>
                <span>Esgotado</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>

        {/* Mensagem de indisponibilidade */}
        {isUnavailable && !isRaffle && (
          <div className="unavailable-notice">
            <AlertCircle size={14} />
            <span><strong>ATENÇÃO:</strong> Este produto está temporariamente indisponível. Apenas a Rifa da Formatura 2026 está disponível para compra no momento.</span>
          </div>
        )}

        {/* Informações extras */}
        {product.shippingInfo && isAvailable && (
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
          border: 2px solid transparent;
        }

        .product-card.unavailable {
          opacity: 0.8;
          filter: grayscale(0.6);
          border-color: #dee2e6;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          cursor: not-allowed;
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
          border-color: var(--color-yellow);
        }

        /* BANNER DA RIFA - NOVO */
        .raffle-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 160px;
          overflow: hidden;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          z-index: 1;
        }

        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .raffle-banner:hover .banner-image {
          transform: scale(1.05);
        }

        .banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .banner-content {
          text-align: center;
          color: white;
          max-width: 90%;
        }

        .prize-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 209, 102, 0.2);
          border: 2px solid var(--color-yellow);
          padding: 8px 16px;
          border-radius: 20px;
          margin-bottom: 15px;
          backdrop-filter: blur(10px);
        }

        .tag-icon {
          font-size: 20px;
        }

        .tag-text {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-yellow);
        }

        .prize-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .prize-description {
          font-size: 14px;
          opacity: 0.9;
          margin: 0 0 15px 0;
          font-weight: 500;
        }

        .prize-value {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 16px;
          color: var(--color-yellow);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .value-icon {
          font-size: 18px;
        }

        /* Fallback para quando a imagem não carrega */
        .banner-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .fallback-content {
          text-align: center;
          color: white;
        }

        .fallback-icon {
          font-size: 40px;
          margin-bottom: 15px;
          display: block;
        }

        .fallback-text h4 {
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 10px 0;
          color: var(--color-yellow);
        }

        .fallback-text h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: white;
        }

        .fallback-text p {
          font-size: 14px;
          opacity: 0.9;
          margin: 0 0 15px 0;
        }

        .prize-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-yellow);
        }

        /* Badge do produto */
        .product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 20;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-dark);
        }

        .badge-indisponível {
          background: linear-gradient(135deg, #6C757D, #495057);
          color: white;
          animation: pulseUnavailable 2s infinite;
        }

        .badge-limited {
          background: linear-gradient(135deg, #FFD166, #FFB347);
          color: var(--color-dark);
          box-shadow: 0 2px 8px rgba(255, 209, 102, 0.4);
          z-index: 15;
        }

        @keyframes pulseUnavailable {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Overlay de indisponibilidade na imagem */
        .unavailable-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(108, 117, 125, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          gap: 0.5rem;
          z-index: 10;
          border-radius: inherit;
        }

        .overlay-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
        }

        .overlay-content svg {
          color: white;
        }

        .overlay-text {
          font-weight: 800;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.15);
          padding: 8px 20px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .overlay-subtext {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        /* Ações desabilitadas */
        .action-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.5);
        }

        .action-btn.disabled:hover {
          transform: none;
          background: rgba(255, 255, 255, 0.5);
        }

        /* Aviso de indisponibilidade */
        .unavailable-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-top: var(--space-md);
          padding: 0.75rem;
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          color: #721c24;
          line-height: 1.4;
          border-left: 3px solid #dc3545;
        }

        .unavailable-notice svg {
          color: #dc3545;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Tags */
        .tag-indisponível {
          background: #6c757d !important;
          color: white !important;
          font-weight: 600;
        }

        .tag-disponível {
          background: #28a745 !important;
          color: white !important;
          font-weight: 600;
        }

        /* Detalhes para produtos indisponíveis */
        .detail-unavailable {
          color: #dc3545 !important;
          font-weight: 600;
        }

        .unavailable-detail {
          color: #dc3545;
          font-weight: 700;
        }

        .unavailable-detail svg {
          color: #dc3545;
        }

        /* Preço riscado para indisponíveis */
        .price-unavailable {
          color: #6c757d !important;
          text-decoration: line-through;
          opacity: 0.7;
        }

        /* Botão de adicionar ao carrinho */
        .add-to-cart-btn.unavailable-btn {
          background: #6c757d;
          color: white;
          cursor: not-allowed;
          animation: pulseGray 2s infinite;
        }

        .add-to-cart-btn.disabled-btn {
          background: #cccccc;
          color: #666;
          cursor: not-allowed;
        }

        @keyframes pulseGray {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.7; }
        }

        /* Imagem do produto ajustada para rifas */
        .product-image-container {
          position: relative;
          height: 200px;
          background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-card.unavailable .product-image-container {
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
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
          z-index: 2;
          position: relative;
        }

        /* Para rifas, ajusta a posição do emoji */
        .product-card:has(.raffle-banner) .product-emoji {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 3rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .product-card.unavailable .product-emoji {
          animation: none;
          opacity: 0.5;
          filter: grayscale(0.7);
        }

        .product-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 0.5rem;
          z-index: 20;
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
          left: 12px;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-dark);
          text-transform: capitalize;
          backdrop-filter: blur(10px);
          z-index: 15;
          max-width: 80%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Para rifas, ajusta a categoria */
        .product-card:has(.raffle-banner) .product-category {
          bottom: auto;
          top: 12px;
          left: auto;
          right: 60px;
          background: rgba(255, 209, 102, 0.9);
          color: var(--color-dark);
          font-weight: 700;
        }

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
          color: #495057;
        }

        .product-description {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        .product-card.unavailable .product-description {
          color: #6c757d;
          opacity: 0.9;
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

        .product-card.unavailable .detail:not(.unavailable-detail) {
          opacity: 0.7;
        }

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
          min-width: 140px;
          justify-content: center;
        }

        .add-to-cart-btn:hover:not(:disabled):not(.unavailable-btn):not(.disabled-btn) {
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

        .btn-icon {
          font-size: 1.2rem;
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
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .raffle-banner {
            height: 140px;
          }
          
          .prize-title {
            font-size: 18px;
          }
          
          .prize-description {
            font-size: 12px;
          }
          
          .product-emoji {
            font-size: 3rem;
          }
          
          .product-card:has(.raffle-banner) .product-emoji {
            width: 50px;
            height: 50px;
            font-size: 2.5rem;
            bottom: 15px;
            right: 15px;
          }
          
          .product-title {
            font-size: 1.125rem;
          }
          
          .product-price {
            font-size: 1.25rem;
          }
          
          .add-to-cart-btn {
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
            min-width: 120px;
          }
          
          .product-details {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .unavailable-overlay {
            padding: 10px;
          }
          
          .overlay-text {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .raffle-banner {
            height: 120px;
          }
          
          .banner-content {
            padding: 10px;
          }
          
          .prize-title {
            font-size: 16px;
          }
          
          .prize-tag {
            padding: 6px 12px;
            margin-bottom: 10px;
          }
          
          .tag-text {
            font-size: 10px;
          }
          
          .product-footer {
            flex-direction: column;
            align-items: stretch;
          }
          
          .add-to-cart-btn {
            width: 100%;
            justify-content: center;
          }
          
          .product-emoji {
            font-size: 2.5rem;
          }
          
          .product-card:has(.raffle-banner) .product-emoji {
            width: 40px;
            height: 40px;
            font-size: 2rem;
            bottom: 10px;
            right: 10px;
          }
          
          .product-pricing {
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;