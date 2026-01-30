import React from 'react';
import { Heart, Instagram, Mail, MapPin, Phone, ArrowUp } from 'lucide-react';
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo e descrição */}
          <div className="footer-section">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">🎓</span>
                <div className="logo-text">
                  <h3 className="logo-title">Terceirão 2026</h3>
                  <p className="logo-subtitle">Loja Oficial</p>
                </div>
              </div>
              <p className="footer-description">
                Projeto de arrecadação para a formatura do 3º ano. 
                Cada compra nos ajuda a realizar nosso sonho de formatura!
              </p>
            </div>
            
            <div className="footer-social">
              <a 
                href="https://www.instagram.com/3rao.januzzi2k26/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link instagram"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="footer-section">
            <h4 className="footer-heading">Navegação</h4>
            <nav className="footer-nav">
              <a href="/" className="footer-link">Início</a>
              <a href="/produtos" className="footer-link">Produtos</a>
              <a href="/sobre" className="footer-link">Sobre</a>
              <a href="/contato" className="footer-link">Contato</a>
            </nav>
          </div>

          {/* Contato */}
          <div className="footer-section">
            <h4 className="footer-heading">Contato</h4>
            <div className="contact-info">
              <a 
                href="https://wa.me/551896349330" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-item"
              >
                <Phone size={16} />
                <span>(18) 99634-9330</span>
              </a>
              
              <div className="contact-item">
                <MapPin size={16} />
                <span>E.E. Prof. Oswaldo Januzzi</span>
              </div>
            </div>
          </div>

          {/* Botão voltar ao topo */}
          <button 
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Voltar ao topo"
          >
            <ArrowUp size={20} />
          </button>
        </div>

        {/* Divisor */}
        <div className="footer-divider"></div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>© {currentYear} Terceirão 2026 – Todos os direitos reservados</p>
            <p className="made-with">
              Feito com <Heart size={14} color="#FF6B6B" /> Por Octávio Augusto
            </p>
          </div>
          
          <div className="footer-disclaimer">
            <p>Este site é parte de um projeto escolar para arrecadação da formatura.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;