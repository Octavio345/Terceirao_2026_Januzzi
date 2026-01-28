import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <>
      {/* Seção do Banner */}
      <section className="banner-section">
        <div className="banner-container">
          <div className="banner-overlay"></div>
          
          <div className="banner-content">
            <div className="banner-icon">🎓</div>
            <h1 className="banner-title">Terceirão 2026</h1>
            <p className="banner-subtitle">LOJA OFICIAL</p>
          </div>
          
          {/* 
          PARA USAR SEU BANNER REAL:
          <img 
            src="/seu-banner.jpg" 
            alt="Terceirão 2026" 
            className="banner-image"
          />
          */}
        </div>
      </section>

      {/* Seção do Conteúdo */}
      <section className="content-section">
        <div className="container">
          <div className="content-wrapper">
            {/* Texto principal */}
            <div className="text-header">
              <h2 className="main-title">
                Apoie nossa formatura
                <span className="highlight">Cada compra faz a diferença!</span>
              </h2>
              
              <p className="main-description">
                Nossa loja oficial tem produtos exclusivos para arrecadar fundos 
                para a festa de formatura. Faça parte dessa conquista!
              </p>
            </div>

            {/* Cards de destaque */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Target size={28} />
                </div>
                <div className="feature-text">
                  <h3>Produtos</h3>
                  <h4>Exclusivos</h4>
                  <p>Itens personalizados da turma</p>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Zap size={28} />
                </div>
                <div className="feature-text">
                  <h3>Entrega</h3>
                  <h4>Rápida</h4>
                  <p>Retirada na escola combinada</p>
                </div>
              </div>
            </div>

            {/* Botão de ação */}
            <div className="action-container">
              <Link to="/produtos" className="action-button">
                <span>Explorar Produtos</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Estilos do Banner */
        .banner-section {
          position: relative;
          height: 60vh;
          min-height: 500px;
          overflow: hidden;
        }

        .banner-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #2D3047 0%, #1A1A2E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .banner-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, 
            rgba(26, 26, 46, 0.9) 0%,
            rgba(26, 26, 46, 0.95) 100%);
        }

        .banner-content {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          padding: 2rem;
        }

        .banner-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .banner-title {
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 900;
          margin-bottom: 0.5rem;
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .banner-subtitle {
          font-size: clamp(1.25rem, 2.5vw, 2rem);
          font-weight: 600;
          opacity: 0.9;
          color: #FFD700;
          letter-spacing: 2px;
        }

        /* Estilos do Conteúdo */
        .content-section {
          padding: 4rem 2rem;
          background: #f8f9fa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        .text-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .main-title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          color: #1A1A2E;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .main-title .highlight {
          display: block;
          color: #FF6B6B;
          font-weight: 700;
          margin-top: 0.5rem;
          font-size: clamp(1.5rem, 3vw, 2rem);
        }

        .main-description {
          font-size: clamp(1rem, 1.5vw, 1.125rem);
          color: #666;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Cards de destaque */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          border-color: #FFD700;
        }

        .feature-icon-wrapper {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #1A1A2E;
        }

        .feature-text h3 {
          font-size: 1.75rem;
          color: #1A1A2E;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .feature-text h4 {
          font-size: 2rem;
          color: #FF6B6B;
          margin-bottom: 0.5rem;
          font-weight: 800;
        }

        .feature-text p {
          color: #666;
          font-size: 1rem;
          margin: 0;
          line-height: 1.5;
        }

        /* Botão de ação */
        .action-container {
          text-align: center;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #1A1A2E, #2D3047);
          color: white;
          padding: 1rem 2.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(26, 26, 46, 0.2);
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(26, 26, 46, 0.3);
          gap: 1rem;
        }

        .action-button svg {
          transition: transform 0.3s ease;
        }

        .action-button:hover svg {
          transform: translateX(5px);
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .banner-section {
            height: 50vh;
            min-height: 400px;
          }
          
          .content-section {
            padding: 3rem 1.5rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .feature-card {
            padding: 1.5rem;
          }
          
          .banner-title {
            font-size: 2.5rem;
          }
          
          .banner-subtitle {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .banner-section {
            height: 40vh;
            min-height: 350px;
          }
          
          .content-section {
            padding: 2rem 1rem;
          }
          
          .main-title {
            font-size: 1.75rem;
          }
          
          .main-title .highlight {
            font-size: 1.5rem;
          }
          
          .feature-text h3 {
            font-size: 1.5rem;
          }
          
          .feature-text h4 {
            font-size: 1.75rem;
          }
          
          .action-button {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
        }

        /* Para telas muito altas */
        @media (min-height: 1000px) {
          .banner-section {
            height: 50vh;
          }
        }
      `}</style>
    </>
  );
};

export default Hero;