import React from 'react';
import { Users, Target, Heart, Award, GraduationCap, Sparkles, Star, Trophy } from 'lucide-react';

const About = () => {
  return (
    <section className="about-section">
      <div className="container">
        {/* Cabeçalho hero */}
        <div className="about-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <GraduationCap size={20} />
              <span>Conheça Nossa História</span>
            </div>
            
            <h1 className="hero-title">
              <span className="hero-line">Terceirão 2026</span>
              <span className="hero-line highlight">
                A Jornada Rumo à Formatura
                <Sparkles size={24} className="sparkle-icon" />
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Somos alunos dedicados do Colégio [Nome da Escola], unidos por um objetivo comum: 
              realizar a formatura dos nossos sonhos. Cada produto vendido é um passo nessa jornada.
            </p>
          </div>
          
          <div className="hero-decoration">
            <div className="decoration-item">🎓</div>
            <div className="decoration-item">✨</div>
            <div className="decoration-item">🌟</div>
          </div>
        </div>

        {/* Missão e Valores */}
        <div className="mission-values">
          <div className="mission-card animate-scale">
            <div className="mission-header">
              <Target size={32} className="mission-icon" />
              <h2 className="mission-title">Nossa Missão</h2>
            </div>
            <div className="mission-content">
              <p>
                Arrecadar fundos através da venda de produtos exclusivos para realizar uma 
                formatura memorável que marcará o encerramento dessa importante fase escolar.
              </p>
              <div className="mission-stats">
                <div className="stat">
                  <span className="stat-number">2026</span>
                  <span className="stat-label">Ano da Formatura</span>
                </div>
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Dedicados</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="values-grid">
            <div className="value-card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="value-icon">
                <Users size={28} />
              </div>
              <h3 className="value-title">União</h3>
              <p className="value-description">
                Trabalhamos juntos como uma verdadeira família para alcançar nossos objetivos comuns.
              </p>
            </div>
            
            <div className="value-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="value-icon">
                <Heart size={28} />
              </div>
              <h3 className="value-title">Dedicação</h3>
              <p className="value-description">
                Cada produto é preparado com carinho e atenção aos detalhes pelos próprios alunos.
              </p>
            </div>
            
            <div className="value-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="value-icon">
                <Award size={28} />
              </div>
              <h3 className="value-title">Excelência</h3>
              <p className="value-description">
                Buscamos a qualidade em tudo que fazemos, desde os produtos até o atendimento.
              </p>
            </div>
            
            <div className="value-card animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="value-icon">
                <Trophy size={28} />
              </div>
              <h3 className="value-title">Superação</h3>
              <p className="value-description">
                Desafios são oportunidades para crescer e mostrar nossa capacidade de realização.
              </p>
            </div>
          </div>
        </div>

        {/* Processo de trabalho */}
        <div className="process-section">
          <div className="section-header">
            <h2 className="section-title">Como Funciona Nossa Loja</h2>
            <p className="section-subtitle">
              Todo o processo é realizado pelos alunos, com transparência e organização
            </p>
          </div>
          
          <div className="process-steps">
            <div className="step animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="step-number">01</div>
              <div className="step-content">
                <h3 className="step-title">Produção</h3>
                <p className="step-description">
                  Alunos se dividem em equipes para preparar os produtos com qualidade e higiene.
                </p>
              </div>
            </div>
            
            <div className="step animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="step-number">02</div>
              <div className="step-content">
                <h3 className="step-title">Vendas</h3>
                <p className="step-description">
                  Atendimento personalizado via WhatsApp e organização dos pedidos em planilhas.
                </p>
              </div>
            </div>
            
            <div className="step animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="step-number">03</div>
              <div className="step-content">
                <h3 className="step-title">Pagamento</h3>
                <p className="step-description">
                  Sistema via PIX para facilitar e agilizar as transações com segurança.
                </p>
              </div>
            </div>
            
            <div className="step animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="step-number">04</div>
              <div className="step-content">
                <h3 className="step-title">Entrega</h3>
                <p className="step-description">
                  Retirada organizada na escola ou entrega combinada em locais estratégicos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefícios do apoio */}
        <div className="benefits-section">
          <div className="section-header">
            <h2 className="section-title">Ao Apoiar o Terceirão, Você</h2>
            <p className="section-subtitle">
              Contribui diretamente para a realização de um sonho coletivo
            </p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="benefit-icon">🎯</div>
              <div className="benefit-content">
                <h3>Incentiva Jovens</h3>
                <p>Apoia o desenvolvimento de habilidades empreendedoras nos alunos</p>
              </div>
            </div>
            
            <div className="benefit-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="benefit-icon">💝</div>
              <div className="benefit-content">
                <h3>Valoriza o Esforço</h3>
                <p>Reconhece o trabalho e dedicação de estudantes que buscam realizar seu sonho</p>
              </div>
            </div>
            
            <div className="benefit-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="benefit-icon">🎉</div>
              <div className="benefit-content">
                <h3>Cria Memórias</h3>
                <p>Participa da construção de uma celebração que ficará para sempre na história</p>
              </div>
            </div>
            
            <div className="benefit-card animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="benefit-icon">🤝</div>
              <div className="benefit-content">
                <h3>Fortalecer a Comunidade</h3>
                <p>Contribui para o fortalecimento dos laços entre escola, alunos e comunidade</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chamada para ação */}
        <div className="cta-section">
          <div className="cta-content">
            <Star size={32} className="cta-icon" />
            <h2 className="cta-title">Faça Parte Dessa História!</h2>
            <p className="cta-description">
              Cada compra nos ajuda a construir memórias que levaremos para a vida toda. 
              Sua contribuição é fundamental para o sucesso da nossa formatura.
            </p>
            <div className="cta-actions">
              <a href="/produtos" className="btn btn-primary btn-large">
                Ver Produtos Disponíveis
              </a>
              <a href="/contato" className="btn btn-outline btn-large">
                Entrar em Contato
              </a>
            </div>
          </div>
          <div className="cta-decoration">
            <div className="floating-cap">🎓</div>
            <div className="floating-star">⭐</div>
            <div className="floating-heart">💝</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          padding: var(--space-2xl) 0;
          background: var(--color-light-gray);
          min-height: 100vh;
        }

        .about-hero {
          text-align: center;
          margin-bottom: var(--space-2xl);
          position: relative;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 209, 102, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-full);
          margin-bottom: var(--space-lg);
          animation: slideIn 0.8s var(--ease-smooth);
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          line-height: 1.1;
          margin-bottom: var(--space-lg);
        }

        .hero-line {
          display: block;
        }

        .hero-line.highlight {
          color: var(--color-yellow);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .sparkle-icon {
          animation: var(--float-animation);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #666;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .hero-decoration {
          display: flex;
          justify-content: center;
          gap: var(--space-xl);
          margin-top: var(--space-xl);
        }

        .decoration-item {
          font-size: 3rem;
          animation: var(--float-animation);
        }

        .decoration-item:nth-child(2) { animation-delay: 0.5s; }
        .decoration-item:nth-child(3) { animation-delay: 1s; }

        .mission-values {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-xl);
          margin-bottom: var(--space-2xl);
        }

        @media (min-width: 992px) {
          .mission-values {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-2xl);
          }
        }

        .mission-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid rgba(255, 209, 102, 0.2);
          animation-delay: 0.2s;
        }

        .mission-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .mission-icon {
          color: var(--color-yellow);
          background: rgba(255, 209, 102, 0.1);
          padding: var(--space-sm);
          border-radius: var(--radius-lg);
        }

        .mission-title {
          font-size: 2rem;
          color: var(--color-dark);
          margin: 0;
          font-weight: 700;
        }

        .mission-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .mission-content p {
          font-size: 1.125rem;
          color: #666;
          line-height: 1.6;
        }

        .mission-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-lg);
          padding: var(--space-lg);
          background: var(--color-light-gray);
          border-radius: var(--radius-lg);
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--color-yellow);
          line-height: 1;
        }

        .stat-label {
          display: block;
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.5rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-lg);
        }

        .value-card {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-gray);
          transition: all var(--transition-normal);
          text-align: center;
        }

        .value-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
          border-color: var(--color-yellow);
        }

        .value-icon {
          width: 70px;
          height: 70px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-lg);
          color: var(--color-dark);
        }

        .value-title {
          font-size: 1.5rem;
          color: var(--color-dark);
          margin-bottom: var(--space-md);
          font-weight: 700;
        }

        .value-description {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .process-section {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          margin-bottom: var(--space-2xl);
          box-shadow: var(--shadow-lg);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .section-title {
          font-size: 2.5rem;
          color: var(--color-dark);
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .process-steps {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
          max-width: 800px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .process-steps {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-xl);
          }
        }

        .step {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-xl);
          background: var(--color-light-gray);
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }

        .step:hover {
          transform: translateX(10px);
          background: var(--color-white);
          box-shadow: var(--shadow-md);
        }

        .step-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-yellow);
          line-height: 1;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-title {
          font-size: 1.5rem;
          color: var(--color-dark);
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .step-description {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .benefits-section {
          margin-bottom: var(--space-2xl);
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-lg);
        }

        .benefit-card {
          background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light-gray) 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-gray);
          transition: all var(--transition-normal);
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
        }

        .benefit-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
          border-color: var(--color-yellow);
        }

        .benefit-icon {
          font-size: 2rem;
          flex-shrink: 0;
          animation: var(--float-animation);
        }

        .benefit-content h3 {
          font-size: 1.25rem;
          color: var(--color-dark);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .benefit-content p {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        .cta-section {
          background: linear-gradient(135deg, var(--color-dark) 0%, #2D3047 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          position: relative;
          overflow: hidden;
          color: var(--color-white);
          text-align: center;
        }

        .cta-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-icon {
          color: var(--color-yellow);
          margin-bottom: var(--space-lg);
          animation: var(--float-animation);
        }

        .cta-title {
          font-size: 2.5rem;
          margin-bottom: var(--space-lg);
          font-weight: 700;
        }

        .cta-description {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: var(--space-xl);
          line-height: 1.6;
        }

        .cta-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .floating-cap,
        .floating-star,
        .floating-heart {
          position: absolute;
          font-size: 3rem;
          opacity: 0.2;
          animation: var(--float-animation);
        }

        .floating-cap {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-star {
          top: 60%;
          right: 15%;
          animation-delay: 0.5s;
        }

        .floating-heart {
          bottom: 20%;
          left: 20%;
          animation-delay: 1s;
        }

        /* Animações */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }
          
          .process-section {
            padding: var(--space-xl);
          }
          
          .step {
            flex-direction: column;
            text-align: center;
          }
          
          .cta-title {
            font-size: 2rem;
          }
          
          .cta-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-large {
            width: 100%;
            max-width: 300px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
          }
          
          .mission-card,
          .value-card,
          .benefit-card {
            padding: var(--space-lg);
          }
          
          .values-grid,
          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default About;