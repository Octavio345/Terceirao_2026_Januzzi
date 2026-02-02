import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Sparkles } from 'lucide-react';

const Hero = () => {
  const fallbackRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Forçar animação do conteúdo após carregamento
    if (contentRef.current) {
      const elements = contentRef.current.children;
      Array.from(elements).forEach((el, index) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 100 + 100);
      });
    }
  }, []);

  const handleImageError = (e) => {
    console.error('❌ ERRO ao carregar imagem');
    e.target.style.display = 'none';
    if (fallbackRef.current) {
      fallbackRef.current.style.display = 'block';
    }
  };

  return (
    <>
      {/* Seção Hero */}
      <section className="hero-section">
        <div className="hero-container">
          
          {/* IMAGEM DE FUNDO - VERSÃO OTIMIZADA */}
          <div className="image-wrapper">
            <div 
              ref={fallbackRef}
              className="image-fallback"
              style={{ display: 'none' }}
            ></div>
            <img 
              src="/imagens/banner.jpg" 
              alt="Terceirão 2026 - Celebrando a formatura"
              className="hero-background-image"
              loading="eager"
              onError={handleImageError}
              onLoad={() => console.log('✅ Imagem carregada!')}
            />
          </div>
          
          {/* GRADIENTES ORIGINAIS */}
          <div className="gradient-overlay top-overlay"></div>
          <div className="gradient-overlay bottom-overlay"></div>
          
          {/* ELEMENTOS FLUTUANTES */}
          <div className="floating-element el-1"></div>
          <div className="floating-element el-2"></div>
          <div className="floating-element el-3"></div>
          
          {/* CONTEÚDO PRINCIPAL - REMOVIDAS AS ANIMAÇÕES CSS QUE NÃO FUNCIONAM */}
          <div className="hero-content" ref={contentRef}>
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
          
        </div>
      </section>

      {/* Seção de Destaques */}
      <section className="highlights-section">
        <div className="container">
          <div className="highlights-grid">
            
            <div className="highlight-card">
              <div className="card-decoration"></div>
              <div className="card-icon">
                <Target size={32} />
              </div>
              <div className="card-content">
                <h3 className="card-title">
                  <span className="card-number">01</span>
                  Produtos
                </h3>
                <p className="card-description">
                  Temos uma variedade de salgados e doces deliciosos, e também uma rifa especial — participando, você aproveita e ainda contribui com nossa obra.
                </p>
                <ul className="card-features">
                  <li>• Salgados</li>
                  <li>• Doces</li>
                  <li>• Rifas</li>
                </ul>
              </div>
            </div>
            
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
                  <span>Explorar Produtos</span>
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
        /* ===== RESET ===== */
        .hero-section {
          position: relative;
          width: 100%;
          height: 85vh;
          min-height: 700px;
          max-height: 900px;
          overflow: hidden;
        }

        .hero-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        }

        /* ===== IMAGEM DE FUNDO ===== */
        .image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-background-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          opacity: 0.25;
          display: block;
          filter: brightness(1.1) contrast(1.05);
          -webkit-filter: brightness(1.1) contrast(1.05);
          transform: scale(1.05);
          transition: all 0.8s ease;
        }

        .hero-container:hover .hero-background-image {
          opacity: 0.3;
          transform: scale(1.08);
        }

        .image-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0.25;
          z-index: 0;
          display: none;
        }

        /* ===== GRADIENTES ORIGINAIS ===== */
        .gradient-overlay {
          position: absolute;
          left: 0;
          width: 100%;
          z-index: 2;
        }

        .top-overlay {
          top: 0;
          height: 45%;
          background: linear-gradient(to bottom, rgba(15, 12, 41, 0.95), transparent);
        }

        .bottom-overlay {
          bottom: 0;
          height: 45%;
          background: linear-gradient(to top, rgba(15, 12, 41, 0.95), transparent);
        }

        /* ===== ELEMENTOS FLUTUANTES ===== */
        .floating-element {
          position: absolute;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          border-radius: 50%;
          filter: blur(40px);
          z-index: 2;
        }

        .floating-element.el-1 {
          width: 320px;
          height: 320px;
          top: 15%;
          left: 8%;
          animation: float 25s ease-in-out infinite;
        }

        .floating-element.el-2 {
          width: 220px;
          height: 220px;
          bottom: 15%;
          right: 8%;
          animation: float 30s ease-in-out infinite reverse;
        }

        .floating-element.el-3 {
          width: 180px;
          height: 180px;
          top: 60%;
          left: 75%;
          animation: float 35s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg) scale(1); 
          }
          50% { 
            transform: translateY(-25px) rotate(5deg) scale(1.02); 
          }
        }

        /* ===== CONTEÚDO PRINCIPAL - CORRIGIDO ===== */
        .hero-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          z-index: 3;
          /* REMOVIDO: opacity: 0 */
        }

        /* BADGE - VISÍVEL POR PADRÃO */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 215, 0, 0.35);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 215, 0, 0.5);
          color: #FFD700;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 3rem;
          z-index: 3;
          /* REMOVIDO: opacity: 0 e transform */
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          
          /* Animações corrigidas */
          opacity: 0;
          transform: translateY(30px);
          animation: slideUpBadge 0.8s ease-out 0.1s forwards;
        }

        /* TÍTULO - VISÍVEL POR PADRÃO */
        .hero-title {
          font-size: clamp(3.5rem, 8vw, 6rem);
          font-weight: 900;
          line-height: 1.05;
          margin-bottom: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          z-index: 3;
          /* REMOVIDO: opacity: 0 e transform */
          
          /* Animações corrigidas */
          opacity: 0;
          transform: translateY(30px);
          animation: slideUpTitle 0.8s ease-out 0.3s forwards;
        }

        .title-gradient {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 60%, #FF8C00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 5px 20px rgba(255, 140, 0, 0.4);
        }

        .title-accent {
          color: #ffffff;
          text-shadow: 
            0 2px 15px rgba(255, 215, 0, 0.6),
            0 0 40px rgba(255, 215, 0, 0.3);
        }

        /* SUBTÍTULO - VISÍVEL POR PADRÃO */
        .hero-subtitle {
          font-size: clamp(1.125rem, 2.2vw, 1.5rem);
          color: rgba(255, 255, 255, 0.92) !important;
          max-width: 600px;
          margin-bottom: 3rem;
          line-height: 1.7;
          font-weight: 300;
          letter-spacing: 0.3px;
          z-index: 3;
          /* REMOVIDO: opacity: 0 e transform */
          
          /* Animações corrigidas */
          opacity: 0;
          transform: translateY(30px);
          animation: slideUpSubtitle 0.8s ease-out 0.4s forwards;
        }

        /* ANIMAÇÕES CORRIGIDAS - SEPARADAS PARA CADA ELEMENTO */
        @keyframes slideUpBadge {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUpTitle {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUpSubtitle {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ===== SEÇÃO DE DESTAQUES ===== */
        .highlights-section {
          padding: 6rem 2rem;
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
          position: relative;
          z-index: 4;
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

        /* ===== SEÇÃO CTA ===== */
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

        /* ===== RESPONSIVIDADE ===== */
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
          
          .hero-background-image {
            opacity: 0.2;
            transform: scale(1.1);
          }
          
          .hero-container:hover .hero-background-image {
            transform: scale(1.12);
          }
          
          .hero-title {
            font-size: 3rem;
          }
          
          .hero-subtitle {
            font-size: 1.125rem;
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
          
          .floating-element {
            filter: blur(25px);
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
          
          .cta-section {
            padding: 2rem 1.5rem;
            border-radius: 24px;
          }
          
          .cta-title {
            font-size: 1.75rem;
          }
          
          .floating-element {
            display: none;
          }
          
          .hero-background-image {
            opacity: 0.18;
          }
        }
      `}</style>
    </>
  );
};

export default Hero;