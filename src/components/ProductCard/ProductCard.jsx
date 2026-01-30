import React, { useState } from 'react';
import { ShoppingBag, Heart, Share2, Package, Info, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css'

const ProductCard = ({ product, index }) => {
  const { addToCart, openCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
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
    if (addToCart && product.stock > 0) {
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
      className="product-card"
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Badge do produto */}
      {product.badge && (
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
        </div>
        
        {/* Ações rápidas */}
        <div className="product-actions">
          <button 
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
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
          style={{ backgroundColor: getCategoryColor(product.category) }}
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
            <span>Estoque: {product.stock}</span>
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
            {product.discount && (
              <span className="discount-badge">-{product.discount}%</span>
            )}
          </div>

          <button 
            className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={product.stock === 0 ? 'Produto esgotado' : 'Adicionar ao carrinho'}
          >
            <ShoppingBag size={18} />
            <span>
              {isAdded ? 'Adicionado!' : 
               product.stock === 0 ? 'Esgotado' : 
               'Adicionar'}
            </span>
          </button>
        </div>

        {/* Informações extras */}
        {product.shippingInfo && (
          <div className="shipping-info">
            <Info size={14} />
            <span>{product.shippingInfo}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;