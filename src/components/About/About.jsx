import React from 'react';
import { Users, Target, Heart, Award, GraduationCap, Sparkles, Star, Trophy, Coffee, Cake, Ticket, Clock } from 'lucide-react';

const About = () => {
  return (
    <section className="about-section">
      <div className="container">
        {/* Cabeçalho hero */}
        <div className="about-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <GraduationCap size={20} />
              <span>Conheça Nossa Turma</span>
            </div>
            
            <h1 className="hero-title">
              <span className="hero-line">Terceirão 2026</span>
              <span className="hero-line highlight">
                E.E. Prof. Oswaldo Januzzi
                <Sparkles size={24} className="sparkle-icon" />
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Somos os alunos do Terceirão 2026 da Escola Estadual Professor Oswaldo Januzzi de Buritama-SP, 
              unidos por um objetivo: realizar a formatura dos nossos sonhos! Cada salgado, doce ou rifa vendida 
              nos aproxima desse momento especial.
            </p>
          </div>
          
          <div className="hero-decoration">
            <div className="decoration-item">
              <Coffee size={40} />
            </div>
            <div className="decoration-item">
              <Cake size={40} />
            </div>
            <div className="decoration-item">
              <Ticket size={40} />
            </div>
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
                Arrecadar fundos através da venda de salgados, doces e rifas para realizar uma 
                formatura inesquecível que marcará o encerramento dessa importante fase em nossa escola.
              </p>
              <div className="mission-stats">
                <div className="stat">
                  <span className="stat-number">2026</span>
                  <span className="stat-label">Ano da Formatura</span>
                </div>
                <div className="stat">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Turmas Unidas</span>
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
                Os três terceirões trabalhando juntos como uma família para alcançar nosso objetivo comum.
              </p>
            </div>
            
            <div className="value-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="value-icon">
                <Heart size={28} />
              </div>
              <h3 className="value-title">Carinho</h3>
              <p className="value-description">
                Cada salgado e doce é preparado com muito amor e dedicação pelos alunos e suas famílias.
              </p>
            </div>
            
            <div className="value-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="value-icon">
                <Award size={28} />
              </div>
              <h3 className="value-title">Qualidade</h3>
              <p className="value-description">
                Buscamos a excelência em tudo que fazemos, desde a produção até o atendimento.
              </p>
            </div>
            
            <div className="value-card animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="value-icon">
                <Trophy size={28} />
              </div>
              <h3 className="value-title">Persistência</h3>
              <p className="value-description">
                Acreditamos que com trabalho em equipe e determinação, vamos realizar nosso sonho.
              </p>
            </div>
          </div>
        </div>

        {/* O que vendemos */}
        <div className="products-section">
          <div className="section-header">
            <h2 className="section-title">O Que Vendemos</h2>
            <p className="section-subtitle">
              Tudo feito com carinho pelos alunos e familiares da nossa escola
            </p>
          </div>
          
          <div className="products-grid">
            <div className="product-card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="product-icon">
                <Coffee size={32} />
              </div>
              <h3 className="product-title">Salgados</h3>
              <p className="product-description">
                Deliciosos salgados caseiros variados, perfeitos para lanches e eventos
              </p>
              <ul className="product-items">
                <li>• Coxinhas recheadas</li>
                <li>• Pastéis assados</li>
                <li>• Bolinhos de queijo</li>
                <li>• Empadinhas</li>
              </ul>
            </div>
            
            <div className="product-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="product-icon">
                <Cake size={32} />
              </div>
              <h3 className="product-title">Doces</h3>
              <p className="product-description">
                Sobremesas e doces artesanais que adoçam o dia com muito sabor
              </p>
              <ul className="product-items">
                <li>• Brigadeiros especiais</li>
                <li>• Bolos caseiros</li>
                <li>• Tortas doces</li>
                <li>• Cookies</li>
              </ul>
            </div>
            
            <div className="product-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="product-icon">
                <Ticket size={32} />
              </div>
              <h3 className="product-title">Rifas</h3>
              <p className="product-description">
                Participe das nossas rifas e concorra a prêmios incríveis
              </p>
              <ul className="product-items">
                <li>• Prêmios exclusivos</li>
                <li>• Sorteios mensais</li>
                <li>• Valores acessíveis</li>
                <li>• Resultados transparentes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Processo de Pagamento */}
        <div className="payment-process-section">
          <div className="section-header">
            <h2 className="section-title">Como Funciona o Pagamento</h2>
            <p className="section-subtitle">
              Processo seguro e facilitado via PIX
            </p>
          </div>
          
          <div className="payment-steps">
            <div className="payment-step animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Faça seu Pedido</h3>
                <p className="step-description">
                  Escolha os produtos que deseja e complete seu pedido pelo WhatsApp
                </p>
              </div>
            </div>
            
            <div className="payment-step animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Receba os Dados PIX</h3>
                <p className="step-description">
                  Enviaremos a chave PIX e valor exato para pagamento
                </p>
              </div>
            </div>
            
            <div className="payment-step animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Faça o Pagamento</h3>
                <p className="step-description">
                  Utilize seu app bancário para pagar via PIX com QR Code ou chave
                </p>
              </div>
            </div>
            
            <div className="payment-step animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Envie o Comprovante</h3>
                <p className="step-description">
                  Envie a foto do comprovante pelo WhatsApp para confirmarmos
                </p>
              </div>
            </div>
          </div>
          
          <div className="payment-features">
            <div className="feature">
              <div className="feature-icon">✅</div>
              <div className="feature-text">
                <h4>Pagamento Seguro</h4>
                <p>Transações via PIX com confirmação imediata</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <h4>Processo Rápido</h4>
                <p>Confirmamos seu pedido em até 1-2 horas após o comprovante</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">📱</div>
              <div className="feature-text">
                <h4>Suporte por WhatsApp</h4>
                <p>Tire dúvidas e acompanhe seu pedido pelo WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horários de Retirada */}
        <div className="schedule-section">
          <div className="section-header">
            <Clock size={48} className="section-icon" />
            <h2 className="section-title">Horários de Retirada</h2>
            <p className="section-subtitle">
              Retirada dos pedidos na escola - Av. Frei Marcelo Manilia, 750
            </p>
          </div>
          
          <div className="schedule-grid">
            <div className="schedule-card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="schedule-header">
                <div className="schedule-time">⏰</div>
                <h3 className="schedule-title">Retirada na Escola</h3>
              </div>
              <div className="schedule-content">
                <div className="schedule-item">
                  <div className="schedule-period">Manhã</div>
                  <div className="schedule-hours">09:30 - 09:45 e 11:25 - 12:25</div>
                </div>
                <div className="schedule-item">
                  <div className="schedule-period">Tarde/Noite</div>
                  <div className="schedule-hours">15:55 - 16:10 e 18:40 - 19:40</div>
                </div>
                <div className="schedule-note">
                  <div className="note-icon">📍</div>
                  <div className="note-text">Local: E.E. Prof. Oswaldo Januzzi</div>
                </div>
              </div>
            </div>
            
            <div className="schedule-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="schedule-header">
                <div className="schedule-time">🚚</div>
                <h3 className="schedule-title">Entrega a Domicílio</h3>
              </div>
              <div className="schedule-content">
                <div className="schedule-item">
                  <div className="schedule-period">Disponibilidade</div>
                  <div className="schedule-hours">A partir das 10h da manhã</div>
                </div>
                <div className="schedule-item highlight">
                  <div className="schedule-period">Observação</div>
                  <div className="schedule-hours">Apenas para quem solicitou entrega</div>
                </div>
                <div className="schedule-note important">
                  <div className="note-icon">💰</div>
                  <div className="note-text">Taxa de entrega: R$ 3,00</div>
                </div>
              </div>
            </div>
            
            <div className="schedule-card important animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="schedule-header">
                <div className="schedule-time">📱</div>
                <h3 className="schedule-title">Como Funciona</h3>
              </div>
              <div className="schedule-content">
                <ol className="process-list">
                  <li>Faça seu pedido pelo WhatsApp</li>
                  <li>Pague via PIX e envie comprovante</li>
                  <li>Combine o melhor horário</li>
                  <li>Retire na escola ou receba em casa</li>
                </ol>
                <div className="whatsapp-info">
                  <a 
                    href="https://wa.me/5518987654321" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="whatsapp-link"
                  >
                    <span>📞 (18) 98765-4321</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processo de trabalho */}
        <div className="process-section">
          <div className="section-header">
            <h2 className="section-title">Como Funciona</h2>
            <p className="section-subtitle">
              Toda a organização é feita pelos alunos dos três terceirões
            </p>
          </div>
          
          <div className="process-steps">
            <div className="step animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="step-number">01</div>
              <div className="step-content">
                <h3 className="step-title">Produção Familiar</h3>
                <p className="step-description">
                  Alunos e familiares se organizam para produzir os salgados e doces com todo cuidado e higiene.
                </p>
              </div>
            </div>
            
            <div className="step animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="step-number">02</div>
              <div className="step-content">
                <h3 className="step-title">Encomendas</h3>
                <p className="step-description">
                  Atendimento via WhatsApp e organização dos pedidos em sistema feito pelos alunos.
                </p>
              </div>
            </div>
            
            <div className="step animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="step-number">03</div>
              <div className="step-content">
                <h3 className="step-title">Pagamento PIX</h3>
                <p className="step-description">
                  Sistema via PIX para facilitar e agilizar as transações de forma segura e rápida.
                </p>
              </div>
            </div>
            
            <div className="step animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="step-number">04</div>
              <div className="step-content">
                <h3 className="step-title">Retirada ou Entrega</h3>
                <p className="step-description">
                  Retirada na escola nos horários de intervalo ou entrega a domicílio a partir das 10h.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefícios do apoio */}
        <div className="benefits-section">
          <div className="section-header">
            <h2 className="section-title">Ao Comprar Com a Gente</h2>
            <p className="section-subtitle">
              Você apoia diretamente os estudantes da sua comunidade
            </p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="benefit-icon">🏫</div>
              <div className="benefit-content">
                <h3>Apoia a Escola Pública</h3>
                <p>Incentiva estudantes de escola pública a realizarem seus sonhos</p>
              </div>
            </div>
            
            <div className="benefit-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="benefit-icon">🤝</div>
              <div className="benefit-content">
                <h3>Fortalecer a Comunidade</h3>
                <p>Ajuda a fortalecer os laços entre escola, alunos e a cidade de Buritama</p>
              </div>
            </div>
            
            <div className="benefit-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="benefit-icon">💝</div>
              <div className="benefit-content">
                <h3>Valoriza o Trabalho</h3>
                <p>Reconhece o esforço de jovens que buscam realizar sua formatura com dignidade</p>
              </div>
            </div>
            
            <div className="benefit-card animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="benefit-icon">🎉</div>
              <div className="benefit-content">
                <h3>Cria Memórias</h3>
                <p>Participa da construção de uma celebração que marcará nossas vidas para sempre</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chamada para ação */}
        <div className="cta-section">
          <div className="cta-content">
            <Star size={32} className="cta-icon" />
            <h2 className="cta-title">Faça Parte Dessa Conquista!</h2>
            <p className="cta-description">
              Cada salgado, doce ou rifa comprada nos ajuda a chegar mais perto da nossa formatura. 
              Sua colaboração é essencial para realizarmos esse sonho que é de todos nós!
            </p>
            <div className="cta-actions">
              <a href="/produtos" className="btn btn-primary btn-large">
                Ver Salgados, Doces e Rifas
              </a>
              <a href="/contato" className="btn btn-outline btn-large">
                Falar Com a Turma
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
          color: var(--color-yellow);
          animation: var(--float-animation);
          background: rgba(255, 209, 102, 0.1);
          padding: 1rem;
          border-radius: var(--radius-full);
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
          grid-template-columns: repeat(3, 1fr);
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

        .products-section {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          margin-bottom: var(--space-2xl);
          box-shadow: var(--shadow-lg);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-lg);
          margin-top: var(--space-xl);
        }

        .product-card {
          background: linear-gradient(135deg, var(--color-white) 0%, var(--color-light-gray) 100%);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-gray);
          transition: all var(--transition-normal);
          text-align: center;
        }

        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-xl);
          border-color: var(--color-yellow);
        }

        .product-icon {
          width: 80px;
          height: 80px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-lg);
          color: var(--color-dark);
        }

        .product-title {
          font-size: 1.5rem;
          color: var(--color-dark);
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .product-description {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: var(--space-lg);
        }

        .product-items {
          text-align: left;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.8;
          padding-left: var(--space-md);
          margin: 0;
        }

        .product-items li {
          margin-bottom: 0.25rem;
        }

        /* Processo de Pagamento */
        .payment-process-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          margin-bottom: var(--space-2xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid #e2e8f0;
        }

        .payment-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-lg);
          margin: var(--space-xl) 0;
        }

        .payment-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-lg);
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid #e2e8f0;
          transition: all var(--transition-normal);
        }

        .payment-step:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
          border-color: var(--color-yellow);
        }

        .payment-step .step-number {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--color-yellow) 0%, #ffb347 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-dark);
          margin-bottom: var(--space-md);
        }

        .payment-step .step-title {
          font-size: 1.125rem;
          color: var(--color-dark);
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .payment-step .step-description {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
        }

        .payment-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-lg);
          margin-top: var(--space-xl);
        }

        .feature {
          display: flex;
          gap: var(--space-md);
          align-items: center;
          padding: var(--space-lg);
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid #e2e8f0;
        }

        .feature-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .feature-text h4 {
          font-size: 1rem;
          color: var(--color-dark);
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .feature-text p {
          color: #666;
          font-size: 0.85rem;
          margin: 0;
        }

        /* Horários Section */
        .schedule-section {
          background: linear-gradient(135deg, var(--color-light-gray) 0%, #f8f9fa 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-2xl);
          margin-bottom: var(--space-2xl);
          box-shadow: var(--shadow-lg);
        }

        .section-icon {
          color: var(--color-yellow);
          margin-bottom: var(--space-md);
          animation: var(--float-animation);
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-xl);
          margin-top: var(--space-xl);
        }

        @media (min-width: 768px) {
          .schedule-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .schedule-card {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-gray);
          transition: all var(--transition-normal);
        }

        .schedule-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }

        .schedule-card.important {
          background: linear-gradient(135deg, #1A1A2E 0%, #2D3047 100%);
          color: white;
        }

        .schedule-card.important .schedule-title {
          color: var(--color-yellow);
        }

        .schedule-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .schedule-time {
          font-size: 2rem;
        }

        .schedule-title {
          font-size: 1.5rem;
          color: var(--color-dark);
          margin: 0;
          font-weight: 700;
        }

        .schedule-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .schedule-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--color-light-gray);
          border-radius: var(--radius-md);
        }

        .schedule-card.important .schedule-item {
          background: rgba(255, 255, 255, 0.1);
        }

        .schedule-item.highlight {
          background: rgba(255, 209, 102, 0.2);
          border-left: 4px solid var(--color-yellow);
        }

        .schedule-period {
          font-weight: 600;
          color: var(--color-dark);
          font-size: 0.9rem;
          flex: 1;
        }

        .schedule-card.important .schedule-period {
          color: rgba(255, 255, 255, 0.9);
        }

        .schedule-hours {
          color: #666;
          font-weight: 700;
          font-size: 0.95rem;
          text-align: right;
          flex: 1;
        }

        .schedule-card.important .schedule-hours {
          color: var(--color-yellow);
        }

        .schedule-note {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 0.75rem;
          background: rgba(255, 209, 102, 0.1);
          border-radius: var(--radius-md);
          margin-top: var(--space-sm);
        }

        .schedule-note.important {
          background: rgba(37, 211, 102, 0.1);
        }

        .note-icon {
          font-size: 1.25rem;
        }

        .note-text {
          font-size: 0.9rem;
          color: #666;
          font-weight: 600;
        }

        .schedule-note.important .note-text {
          color: #10B981;
        }

        .process-list {
          color: rgba(255, 255, 255, 0.9);
          padding-left: var(--space-md);
          margin: 0 0 var(--space-lg) 0;
        }

        .process-list li {
          margin-bottom: var(--space-sm);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .whatsapp-info {
          margin-top: var(--space-lg);
        }

        .whatsapp-link {
          display: block;
          background: #25D366;
          color: white;
          text-decoration: none;
          padding: var(--space-md);
          border-radius: var(--radius-md);
          text-align: center;
          font-weight: 600;
          transition: all var(--transition-normal);
        }

        .whatsapp-link:hover {
          background: #128C7E;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
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
          
          .process-section,
          .products-section,
          .schedule-section,
          .payment-process-section {
            padding: var(--space-xl);
          }
          
          .step {
            flex-direction: column;
            text-align: center;
          }
          
          .schedule-grid {
            grid-template-columns: 1fr;
          }
          
          .payment-steps,
          .payment-features {
            grid-template-columns: 1fr;
          }
          
          .mission-stats {
            grid-template-columns: repeat(3, 1fr);
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
          
          .mission-stats {
            grid-template-columns: 1fr;
          }
          
          .mission-card,
          .value-card,
          .product-card,
          .benefit-card,
          .schedule-card,
          .payment-step,
          .feature {
            padding: var(--space-lg);
          }
          
          .values-grid,
          .products-grid,
          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};

export default About;