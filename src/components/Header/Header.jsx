import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Home, Package, Info, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { openCart, getCartCount } = useCart();

  const navItems = [
    { name: 'Início', path: '/', icon: <Home size={20} /> },
    { name: 'Produtos', path: '/produtos', icon: <Package size={20} /> },
    { name: 'Sobre', path: '/sobre', icon: <Info size={20} /> },
    { name: 'Contato', path: '/contato', icon: <MessageCircle size={20} /> },
  ];

  const cartItemCount = getCartCount();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo da Sala */}
          <div className="logo-sala-wrapper">
            <div className="logo-sala-frame">
              <img 
                src="/imagens/logo.jpg" 
                alt="Logo da Sala" 
                className="logo-sala-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="logo-sala-fallback">
                <span className="logo-fallback-text">3ºA</span>
              </div>
            </div>
          </div>

          {/* Logo Central */}
          <div className="logo-central-wrapper">
            <Link to="/" className="logo-central" onMouseEnter={() => setHoveredItem('logo')}>
              <div className="logo-emoji-box">
                <div className="logo-emoji">🎓</div>
              </div>
              <div className="logo-text-box">
                <h1 className="logo-titulo">Terceirão 2026</h1>
                <p className="logo-subtitulo">Loja Oficial</p>
              </div>
              {hoveredItem === 'logo' && (
                <div className="logo-glow-effect"></div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-desktop-wrapper">
            <nav className="nav-desktop">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className="nav-desktop-link"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="nav-icon-box">
                    {item.icon}
                  </div>
                  <span className="nav-desktop-text">{item.name}</span>
                  <div className={`nav-underline ${hoveredItem === item.name ? 'active' : ''}`}></div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Cart Button - PROPERLY CENTERED */}
          <div className="cart-button-wrapper">
            <button 
              onClick={openCart}
              className="cart-main-button"
              onMouseEnter={() => setHoveredItem('cart')}
              onMouseLeave={() => setHoveredItem(null)}
              aria-label="Abrir carrinho"
            >
              <div className="cart-icon-box">
                <ShoppingBag size={22} className="cart-main-icon" />
                {cartItemCount > 0 && (
                  <span className="cart-main-badge">{cartItemCount}</span>
                )}
              </div>
              <span className="cart-main-text">Carrinho</span>
              <div className={`cart-button-glow ${hoveredItem === 'cart' ? 'active' : ''}`}></div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu-button-wrapper">
            <button 
              className="mobile-menu-main-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              <div className="mobile-menu-icon">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <div className="mobile-menu-items">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className="mobile-menu-item-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="mobile-item-icon">{item.icon}</div>
                  <span className="mobile-item-text">{item.name}</span>
                  <div className="mobile-item-arrow">›</div>
                </Link>
              ))}
              
              <button 
                onClick={() => {
                  openCart();
                  setIsMenuOpen(false);
                }}
                className="mobile-cart-main-button"
              >
                <div className="mobile-cart-icon-box">
                  <ShoppingBag size={20} className="mobile-cart-icon" />
                  {cartItemCount > 0 && (
                    <span className="mobile-cart-badge">{cartItemCount}</span>
                  )}
                </div>
                <span className="mobile-cart-text">
                  Carrinho
                  {cartItemCount > 0 && (
                    <span className="mobile-cart-count"> ({cartItemCount})</span>
                  )}
                </span>
                <div className="mobile-item-arrow">›</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;