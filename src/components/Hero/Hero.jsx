import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Sparkles } from 'lucide-react';
import './Hero.css'

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
    </>
  );
};

export default Hero;