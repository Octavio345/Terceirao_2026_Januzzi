import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Home, Package, Info, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

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
                src="/logo-sala.png" 
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

      <style jsx>{`
        /* RESET DE ALINHAMENTO VERTICAL */
        .header {
          background: linear-gradient(135deg, #1A1C2E 0%, #2D3047 100%);
          color: white;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 100%;
        }

        /* CONTAINER PRINCIPAL - TUDO CENTRALIZADO VERTICALMENTE */
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          gap: 1.5rem;
        }

        /* CADA SEÇÃO - CENTRALIZADA VERTICALMENTE */
        .logo-sala-wrapper,
        .logo-central-wrapper,
        .nav-desktop-wrapper,
        .cart-button-wrapper,
        .mobile-menu-button-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        /* Logo da Sala - PERFEITAMENTE CENTRALIZADA */
        .logo-sala-wrapper {
          flex: 0 0 auto;
          width: 80px;
        }

        .logo-sala-frame {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-sala-frame:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 209, 102, 0.3);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .logo-sala-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .logo-sala-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: none;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255, 209, 102, 0.1), rgba(255, 209, 102, 0.05));
        }

        .logo-fallback-text {
          font-size: 1.8rem;
          font-weight: 800;
          color: #FFD166;
        }

        /* Logo Central - PERFEITAMENTE CENTRALIZADA */
        .logo-central-wrapper {
          flex: 1;
          min-width: 0;
        }

        .logo-central {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-decoration: none;
          color: inherit;
          position: relative;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.3s ease;
          max-width: 400px;
          margin: 0 auto;
          height: 70px;
        }

        .logo-central:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.02);
        }

        .logo-emoji-box {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .logo-emoji {
          font-size: 2.8rem;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        .logo-text-box {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }

        .logo-titulo {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0 0 0.3rem 0;
          background: linear-gradient(135deg, #FFD166 0%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .logo-subtitulo {
          font-size: 0.85rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .logo-glow-effect {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: radial-gradient(circle at center, rgba(255, 209, 102, 0.15), transparent 70%);
          animation: glow 2s ease-in-out infinite;
          pointer-events: none;
        }

        /* Desktop Navigation - CENTRALIZADA */
        .nav-desktop-wrapper {
          flex: 1;
          display: none;
        }

        @media (min-width: 1024px) {
          .nav-desktop-wrapper {
            display: flex;
          }
        }

        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          height: 100%;
        }

        .nav-desktop-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.85);
          padding: 0.75rem;
          position: relative;
          transition: all 0.3s ease;
          min-width: 70px;
          height: 70px;
        }

        .nav-desktop-link:hover {
          color: #FFD166;
          transform: translateY(-2px);
        }

        .nav-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .nav-desktop-link:hover .nav-icon-box {
          background: rgba(255, 209, 102, 0.1);
          transform: scale(1.1);
        }

        .nav-desktop-text {
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .nav-underline {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: #FFD166;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .nav-underline.active {
          width: 35px;
        }

        /* Cart Button - PERFEITAMENTE CENTRALIZADA */
        .cart-button-wrapper {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 140px;
        }

        .cart-main-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          position: relative;
          overflow: visible;
          transition: all 0.3s ease;
          text-decoration: none;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          height: 52px;
          white-space: nowrap;
        }

        .cart-main-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 209, 102, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .cart-icon-box {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
        }

        .cart-main-icon {
          width: 22px;
          height: 22px;
        }

        .cart-main-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: linear-gradient(135deg, #FF416C, #FF4B2B);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          min-width: 22px;
          height: 22px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #1A1C2E;
          animation: pulse 2s infinite;
          z-index: 10;
        }

        .cart-main-text {
          font-weight: 600;
        }

        .cart-button-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 209, 102, 0.1), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          border-radius: 12px;
        }

        .cart-button-glow.active {
          opacity: 1;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        /* Mobile Menu Button - CENTRALIZADA */
        .mobile-menu-button-wrapper {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 60px;
        }

        @media (min-width: 1024px) {
          .mobile-menu-button-wrapper {
            display: none;
          }
        }

        .mobile-menu-main-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-menu-main-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        /* Mobile Menu */
        .mobile-menu-overlay {
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 999;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu-content {
          position: absolute;
          top: 0;
          right: 0;
          width: 85%;
          max-width: 350px;
          height: 100%;
          background: linear-gradient(135deg, #1A1C2E 0%, #2D3047 100%);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          transform: translateX(100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
          padding-top: 1rem;
        }

        .mobile-menu-overlay.open .mobile-menu-content {
          transform: translateX(0);
        }

        .mobile-menu-items {
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-menu-item-link,
        .mobile-cart-main-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          background: transparent;
          width: 100%;
          font-family: inherit;
          font-size: 1.1rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mobile-menu-item-link:hover,
        .mobile-cart-main-button:hover {
          background: rgba(255, 255, 255, 0.05);
          padding-left: 1.75rem;
        }

        .mobile-item-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-item-text {
          flex: 1;
          font-weight: 500;
        }

        .mobile-item-arrow {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .mobile-menu-item-link:hover .mobile-item-arrow,
        .mobile-cart-main-button:hover .mobile-item-arrow {
          color: #FFD166;
          transform: translateX(5px);
        }

        .mobile-cart-main-button {
          background: rgba(255, 209, 102, 0.08);
          border-radius: 0;
          margin-top: 0.5rem;
          border-top: 1px solid rgba(255, 209, 102, 0.1);
        }

        .mobile-cart-main-button:hover {
          background: rgba(255, 209, 102, 0.15);
        }

        .mobile-cart-icon-box {
          position: relative;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #FF416C, #FF4B2B);
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          min-width: 22px;
          height: 22px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #2D3047;
        }

        .mobile-cart-text {
          flex: 1;
          font-weight: 500;
        }

        .mobile-cart-count {
          font-size: 0.9rem;
          opacity: 0.8;
          font-weight: 400;
          margin-left: 0.25rem;
        }

        /* Responsividade Mobile */
        @media (max-width: 1023px) {
          .header-content {
            gap: 1rem;
          }
          
          .logo-sala-wrapper {
            width: 70px;
          }
          
          .logo-sala-frame {
            width: 60px;
            height: 60px;
          }
          
          .logo-central {
            height: 60px;
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }
          
          .logo-titulo {
            font-size: 1.4rem;
          }
          
          .logo-subtitulo {
            font-size: 0.75rem;
          }
          
          .logo-emoji {
            font-size: 2.2rem;
          }
          
          .cart-button-wrapper {
            display: none;
          }
          
          .mobile-menu-button-wrapper {
            width: 50px;
          }
          
          .mobile-menu-main-button {
            width: 48px;
            height: 48px;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 0 1rem;
          }
          
          .logo-sala-wrapper {
            width: 60px;
          }
          
          .logo-sala-frame {
            width: 55px;
            height: 55px;
          }
          
          .logo-titulo {
            font-size: 1.2rem;
          }
          
          .logo-subtitulo {
            font-size: 0.7rem;
          }
          
          .logo-emoji {
            font-size: 2rem;
          }
          
          .logo-central {
            padding: 0.5rem 0.75rem;
            gap: 0.5rem;
          }
          
          .mobile-menu-button-wrapper {
            width: 45px;
          }
          
          .mobile-menu-main-button {
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 480px) {
          .logo-sala-wrapper {
            width: 55px;
          }
          
          .logo-sala-frame {
            width: 50px;
            height: 50px;
          }
          
          .logo-titulo {
            font-size: 1rem;
          }
          
          .logo-subtitulo {
            font-size: 0.65rem;
          }
          
          .logo-emoji {
            font-size: 1.8rem;
          }
          
          .mobile-menu-button-wrapper {
            width: 40px;
          }
          
          .mobile-menu-main-button {
            width: 40px;
            height: 40px;
          }
          
          .mobile-menu-content {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;