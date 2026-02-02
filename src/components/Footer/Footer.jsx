import React from 'react';
import { Heart, Instagram, Phone, MapPin, ChevronUp, MessageCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/5518996349330', '_blank');
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* Botão fixo WhatsApp */}
        <button 
          className="whatsapp-float"
          onClick={openWhatsApp}
          aria-label="Conversar no WhatsApp"
        >
          <MessageCircle size={24} />
        </button>

        <div className="footer-content">
          {/* Logo e descrição */}
          <div className="footer-section main-section">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">🎓</div>
                <div>
                  <h3 className="logo-title">Terceirão 2026</h3>
                  <p className="logo-subtitle">Loja Oficial</p>
                </div>
              </div>
              <p className="footer-description">
                Projeto de arrecadação para a formatura do 3º ano.
              </p>
            </div>

            {/* Social e Contato Móveis */}
            <div className="mobile-contact">
              <div className="contact-buttons">
                <a 
                  href="https://wa.me/5518996349330"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button whatsapp"
                >
                  <Phone size={18} />
                  <span>WhatsApp</span>
                </a>
                <a 
                  href="https://www.instagram.com/3rao.januzzi2k26/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button instagram"
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Links e informações em coluna única para mobile */}
          <div className="footer-grid">
            <div className="footer-column">
              <h4 className="footer-heading">Navegação</h4>
              <nav className="footer-nav">
                <a href="/" className="footer-link">Início</a>
                <a href="/produtos" className="footer-link">Produtos</a>
                <a href="/sobre" className="footer-link">Sobre o Projeto</a>
                <a href="/contato" className="footer-link">Fale Conosco</a>
              </nav>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Localização</h4>
              <div className="location-info">
                <MapPin size={18} />
                <div>
                  <p className="location-title">E.E. Prof. Oswaldo Januzzi</p>
                  <p className="location-subtitle">Projeto de Formatura</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão voltar ao topo */}
          <button 
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Voltar ao topo"
          >
            <ChevronUp size={24} />
          </button>
        </div>

        {/* Divisor */}
        <div className="footer-divider"></div>

        {/* Copyright e informações legais */}
        <div className="footer-bottom">
          <div className="copyright">
            <p className="copyright-text">
              © {currentYear} Terceirão 2026
              <span className="copyright-divider">•</span>
              Todos os direitos reservados
            </p>
            <p className="made-with">
              Desenvolvido com <Heart size={14} /> por Octavio Augusto
            </p>
          </div>
          
          <div className="footer-disclaimer">
            <p>Este é um projeto escolar para arrecadação da formatura.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          color: #ffffff;
          padding: 2rem 1rem 1.5rem;
          position: relative;
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        /* Botão WhatsApp flutuante */
        .whatsapp-float {
          position: fixed;
          bottom: 5rem;
          right: 1rem;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          z-index: 1000;
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }

        .whatsapp-float:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Conteúdo principal */
        .footer-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .main-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .logo-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0.25rem 0 0 0;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .footer-description {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          margin: 0;
        }

        /* Botões de contato móveis */
        .mobile-contact {
          margin-top: 0.5rem;
        }

        .contact-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .contact-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .contact-button.whatsapp {
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
        }

        .contact-button.instagram {
          background: linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F56040 100%);
          color: white;
        }

        .contact-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Grid de informações */
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-heading {
          font-size: 1rem;
          font-weight: 700;
          color: #667eea;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-heading::before {
          content: '';
          display: block;
          width: 4px;
          height: 16px;
          background: #667eea;
          border-radius: 2px;
        }

        .footer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-link::before {
          content: '›';
          color: #667eea;
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .footer-link:hover {
          color: white;
          padding-left: 4px;
        }

        .footer-link:hover::before {
          transform: translateX(2px);
        }

        /* Localização */
        .location-info {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border-left: 3px solid #667eea;
        }

        .location-info svg {
          color: #667eea;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .location-title {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: white;
        }

        .location-subtitle {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        /* Botão voltar ao topo */
        .back-to-top {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          z-index: 999;
        }

        .back-to-top:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        /* Divisor */
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.1) 50%, 
            transparent 100%
          );
          margin: 1.5rem 0;
        }

        /* Rodapé inferior */
        .footer-bottom {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .copyright {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .copyright-text {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .copyright-divider {
          color: #667eea;
        }

        .made-with {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .made-with svg {
          color: #ff6b6b;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .footer-disclaimer {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          line-height: 1.4;
        }

        /* Ajustes para telas maiores */
        @media (min-width: 768px) {
          .footer {
            padding: 2.5rem 2rem;
          }

          .footer-content {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 2rem;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .whatsapp-float {
            right: 2rem;
            bottom: 6rem;
          }

          .back-to-top {
            right: 2rem;
          }

          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            text-align: left;
          }
        }

        /* Ajustes para telas muito pequenas */
        @media (max-width: 360px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .contact-buttons {
            grid-template-columns: 1fr;
          }

          .footer {
            padding: 1.5rem 0.75rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;