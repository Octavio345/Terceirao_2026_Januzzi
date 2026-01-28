import React from 'react';
import { Heart, Instagram, Mail, MapPin, Phone, ArrowUp } from 'lucide-react';

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
                href="https://instagram.com/terceirao2026" 
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
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-item"
              >
                <Phone size={16} />
                <span>(11) 99999-9999</span>
              </a>
              
              <a 
                href="mailto:terceirao2026@escola.com" 
                className="contact-item"
              >
                <Mail size={16} />
                <span>terceirao2026@escola.com</span>
              </a>
              
              <div className="contact-item">
                <MapPin size={16} />
                <span>Colégio [Nome da Escola]</span>
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
              Feito com <Heart size={14} color="#FF6B6B" /> pelos alunos do 3º ano
            </p>
          </div>
          
          <div className="footer-disclaimer">
            <p>Este site é parte de um projeto escolar para arrecadação da formatura.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: var(--gradient-dark);
          color: var(--color-white);
          padding: var(--space-2xl) 0 var(--space-xl);
          position: relative;
          margin-top: auto;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
          position: relative;
        }

        @media (min-width: 768px) {
          .footer-content {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .logo-icon {
          font-size: 2.5rem;
          animation: var(--float-animation);
        }

        .logo-text {
          line-height: 1.2;
        }

        .logo-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          opacity: 0.8;
          margin: 0;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .footer-description {
          font-size: 0.875rem;
          opacity: 0.8;
          line-height: 1.6;
          margin: 0;
        }

        .footer-social {
          display: flex;
          gap: var(--space-sm);
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          color: var(--color-white);
          transition: all var(--transition-normal);
        }

        .social-link:hover {
          background: var(--gradient-primary);
          color: var(--color-dark);
          transform: translateY(-3px);
        }

        .footer-heading {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-yellow);
          margin: 0;
        }

        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 0.95rem;
          transition: all var(--transition-normal);
          padding: 0.25rem 0;
          position: relative;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--color-yellow);
          transition: width var(--transition-normal);
        }

        .footer-link:hover {
          color: var(--color-yellow);
          padding-left: var(--space-sm);
        }

        .footer-link:hover::after {
          width: 100%;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all var(--transition-normal);
        }

        .contact-item:hover {
          color: var(--color-yellow);
          transform: translateX(5px);
        }

        .back-to-top {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 50px;
          height: 50px;
          background: var(--gradient-primary);
          border: none;
          border-radius: var(--radius-full);
          color: var(--color-dark);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-normal);
          animation: var(--float-animation);
        }

        .back-to-top:hover {
          transform: translateY(-5px) scale(1.1);
          box-shadow: var(--shadow-lg);
        }

        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          margin: var(--space-xl) 0;
        }

        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          text-align: center;
        }

        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            text-align: left;
          }
        }

        .copyright {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .copyright p {
          font-size: 0.875rem;
          opacity: 0.8;
          margin: 0;
        }

        .made-with {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.6;
        }

        .footer-disclaimer {
          font-size: 0.75rem;
          opacity: 0.6;
          max-width: 400px;
        }

        .footer-disclaimer p {
          margin: 0;
        }

        /* Responsivo */
        @media (max-width: 767px) {
          .back-to-top {
            position: relative;
            margin-top: var(--space-lg);
            align-self: center;
          }
        }

        @media (max-width: 480px) {
          .footer-content {
            gap: var(--space-xl);
          }
          
          .footer-section {
            text-align: center;
          }
          
          .footer-logo {
            justify-content: center;
          }
          
          .social-link {
            margin: 0 auto;
          }
          
          .footer-link:hover {
            padding-left: 0;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;