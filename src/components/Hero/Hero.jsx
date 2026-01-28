import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <>
      {/* Seção do Banner */}
      <section className="hero-section">
        <div className="hero-background">
          {/* Overlays gradientes */}
          <div className="gradient-overlay-top"></div>
          <div className="gradient-overlay-bottom"></div>
          
          {/* Elementos decorativos */}
          <div className="floating-element el-1"></div>
          <div className="floating-element el-2"></div>
          <div className="floating-element el-3"></div>
          
          {/* Conteúdo principal */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={20} />
              <span>Loja Oficial</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-gradient">Terceirão</span>
              <span className="title-accent">2026</span>
            </h1>
            
            <p className="hero-subtitle">
              Celebre conosco esta conquista através de produtos exclusivos
            </p>
            
          </div>
          
          {/* Banner image com efeito de parallax */}
          <div className="banner-image-container">
            <img 
              src="/imagens/banner.jpg" 
              alt="Terceirão 2026 - Celebrando a formatura" 
              className="banner-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              }}
            />
          </div>
        </div>
      </section>

      {/* Seção de Destaques */}
      <section className="highlights-section">
        <div className="container">
          <div className="highlights-grid">
            {/* Card de Missão */}
            <div className="highlight-card">
              <div className="card-decoration"></div>
              <div className="card-icon">
                <Target size={32} />
              </div>
              <div className="card-content">
                <h3 className="card-title">
                  <span className="card-number">01</span>
                  Produtos Exclusivos
                </h3>
                <p className="card-description">
                  Itens personalizados com nossa identidade visual, criados especialmente para celebrar esta conquista única.
                </p>
                <ul className="card-features">
                  <li>• Camisetas personalizadas</li>
                  <li>• Canecas comemorativas</li>
                  <li>• Acessórios exclusivos</li>
                </ul>
              </div>
            </div>
            
            {/* Card de Velocidade */}
            <div className="highlight-card">
              <div className="card-decoration"></div>
              <div className="card-icon">
                <Zap size={32} />
              </div>
              <div className="card-content">
                <h3 className="card-title">
                  <span className="card-number">02</span>
                  Entrega Ágil
                </h3>
                <p className="card-description">
                  Processo simplificado com retirada na escola ou entrega rápida para toda a comunidade escolar.
                </p>
                <ul className="card-features">
                  <li>• Retirada na escola</li>
                  <li>• Entrega combinada</li>
                  <li>• Suporte dedicado</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Seção de Call-to-Action */}
          <div className="cta-section">
            <div className="cta-content">
              <h2 className="cta-title">
                Cada compra nos aproxima da nossa
                <span className="cta-highlight"> formatura inesquecível</span>
              </h2>
              
              <p className="cta-description">
                Adquira produtos exclusivos e faça parte desta jornada. 
                Todo o valor arrecadado é investido na nossa festa de formatura.
              </p>
              
              <div className="cta-buttons">
                <Link to="/produtos" className="cta-button primary">
                  <span>Explorar Coleção</span>
                  <ArrowRight size={20} />
                </Link>
                
                <Link to="/sobre" className="cta-button secondary">
                  <span>Conheça o Projeto</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Seção Hero */
        .hero-section {
          position: relative;
          height: 85vh;
          min-height: 700px;
          max-height: 900px;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        }

        .gradient-overlay-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to bottom, rgba(15, 12, 41, 0.9), transparent);
          z-index: 1;
        }

        .gradient-overlay-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to top, rgba(15, 12, 41, 0.9), transparent);
          z-index: 1;
        }

        .floating-element {
          position: absolute;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          border-radius: 50%;
          filter: blur(40px);
          z-index: 0;
        }

        .floating-element.el-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          left: 10%;
          animation: float 20s ease-in-out infinite;
        }

        .floating-element.el-2 {
          width: 200px;
          height: 200px;
          bottom: 20%;
          right: 10%;
          animation: float 25s ease-in-out infinite reverse;
        }

        .floating-element.el-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          left: 80%;
          animation: float 30s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 215, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 215, 0, 0.2);
          color: #FFD700;
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 3rem;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .hero-icon-wrapper {
          position: relative;
          margin-bottom: 2rem;
        }

        .hero-icon-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .hero-icon {
          font-size: 5rem;
          position: relative;
          z-index: 2;
          animation: float-icon 6s ease-in-out infinite;
        }

        @keyframes float-icon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        .hero-title {
          font-size: clamp(3.5rem, 8vw, 6rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .title-gradient {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-accent {
          color: white;
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        }

        .hero-subtitle {
          font-size: clamp(1.125rem, 2vw, 1.5rem);
          color: rgba(255, 255, 255, 0.9);
          max-width: 600px;
          margin-bottom: 3rem;
          line-height: 1.6;
          font-weight: 400;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-top: 2rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #FFD700;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .banner-image-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.3;
          filter: blur(0px);
          transition: transform 0.5s ease;
        }

        .hero-section:hover .banner-image {
          transform: scale(1.02);
        }

        /* Seção de Destaques */
        .highlights-section {
          padding: 6rem 2rem;
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          position: relative;
          z-index: 3;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 3rem;
          margin-bottom: 6rem;
        }

        .highlight-card {
          position: relative;
          background: white;
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          overflow: hidden;
          border: 1px solid transparent;
        }

        .highlight-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.12);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .card-decoration {
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 0 24px 0 100px;
          opacity: 0.1;
        }

        .highlight-card:hover .card-decoration {
          opacity: 0.2;
        }

        .card-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          color: white;
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        }

        .card-title {
          font-size: 1.75rem;
          color: #1a1a2e;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .card-number {
          color: #FFD700;
          font-weight: 800;
          font-size: 1.5rem;
        }

        .card-description {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
        }

        .card-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .card-features li {
          color: #444;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .card-features li:last-child {
          border-bottom: none;
        }

        /* Seção CTA */
        .cta-section {
          background: linear-gradient(135deg, #1a1a2e 0%, #2d3047 100%);
          border-radius: 32px;
          padding: 4rem;
          box-shadow: 0 40px 80px rgba(26, 26, 46, 0.15);
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, #FFD700, transparent);
        }

        .cta-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .cta-title {
          font-size: clamp(2rem, 4vw, 3rem);
          color: white;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .cta-highlight {
          display: block;
          background: linear-gradient(135deg, #FFD700, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-top: 0.5rem;
        }

        .cta-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          max-width: 600px;
          margin: 0 auto 3rem;
          line-height: 1.6;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          border-radius: 50px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #1a1a2e;
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        }

        .cta-button.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
          gap: 1rem;
        }

        .cta-button.secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .cta-button.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-3px);
        }

        .cta-stats {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .cta-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .cta-stat-icon {
          font-size: 1.5rem;
        }

        .cta-stat-text {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .cta-stat-text strong {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .cta-stat-text span {
          color: #FFD700;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .progress-bar {
          height: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #FFD700, #FFA500);
          border-radius: 5px;
          position: relative;
          transition: width 1s ease-in-out;
        }

        .progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: progress-glow 2s infinite;
        }

        @keyframes progress-glow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Responsividade */
        @media (max-width: 1024px) {
          .hero-section {
            height: 80vh;
            min-height: 600px;
          }
          
          .highlights-grid {
            gap: 2rem;
          }
          
          .cta-section {
            padding: 3rem 2rem;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            height: 70vh;
            min-height: 500px;
          }
          
          .hero-title {
            font-size: 3rem;
          }
          
          .hero-stats {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .stat-divider {
            width: 100px;
            height: 1px;
          }
          
          .highlights-grid {
            grid-template-columns: 1fr;
          }
          
          .highlight-card {
            padding: 2rem;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .cta-button {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            height: 65vh;
            min-height: 450px;
          }
          
          .hero-content {
            padding: 1rem;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
          }
          
          .hero-icon {
            font-size: 4rem;
          }
          
          .cta-section {
            padding: 2rem 1.5rem;
            border-radius: 24px;
          }
          
          .cta-title {
            font-size: 1.75rem;
          }
        }

        /* Animações de entrada */
        .hero-content > * {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        .hero-badge { animation-delay: 0.1s; }
        .hero-icon-wrapper { animation-delay: 0.2s; }
        .hero-title { animation-delay: 0.3s; }
        .hero-subtitle { animation-delay: 0.4s; }
        .hero-stats { animation-delay: 0.5s; }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Efeito de cursor glow */
        .hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            rgba(255, 215, 0, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </>
  );
};

export default Hero;