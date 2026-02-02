import React from 'react';
import { Users, Target, Heart, Award, GraduationCap, Sparkles, Star, Trophy, Coffee, Cake, Ticket, Clock } from 'lucide-react';
import './About.css'

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
                <h3 className="step-title">Produção dos Alunos</h3>
                <p className="step-description">
                  Os Alunos se organizam para produzir os salgados e doces com todo cuidado e higiene.
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
        </div>
      </div>
      <style jsx>{`
        /* About.css - Mobile First */
.about-section {
  padding: 1.5rem 1rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.about-hero {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.hero-content {
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 209, 102, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.625rem 1.25rem;
  border-radius: 50px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  animation: slideIn 0.8s ease-out;
}

.hero-title {
  font-size: 1.875rem;
  line-height: 1.2;
  margin-bottom: 1.25rem;
}

.hero-line {
  display: block;
}

.hero-line.highlight {
  color: #ffd166;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 1.25rem;
}

.sparkle-icon {
  animation: float 3s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1rem;
  color: #666;
  max-width: 100%;
  margin: 0 auto;
  line-height: 1.5;
}

.hero-decoration {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.decoration-item {
  color: #ffd166;
  animation: float 3s ease-in-out infinite;
  background: rgba(255, 209, 102, 0.1);
  padding: 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decoration-item:nth-child(2) { animation-delay: 0.5s; }
.decoration-item:nth-child(3) { animation-delay: 1s; }

/* Mission & Values */
.mission-values {
  margin-bottom: 2.5rem;
}

.mission-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 209, 102, 0.2);
  margin-bottom: 1.5rem;
}

.mission-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.mission-icon {
  color: #ffd166;
  background: rgba(255, 209, 102, 0.1);
  padding: 0.75rem;
  border-radius: 12px;
}

.mission-title {
  font-size: 1.5rem;
  color: #1a1a2e;
  margin: 0;
  font-weight: 700;
}

.mission-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mission-content p {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

.mission-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat {
  text-align: center;
  padding: 0.5rem;
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffd166;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.375rem;
}

.values-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.value-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  text-align: center;
}

.value-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffd166 0%, #ffb347 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: #1a1a2e;
}

.value-title {
  font-size: 1.25rem;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.value-description {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

/* Products Section */
.products-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.section-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.75rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.section-subtitle {
  font-size: 1rem;
  color: #666;
  max-width: 100%;
  margin: 0 auto;
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
}

.product-card {
  background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  text-align: center;
}

.product-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ffd166 0%, #ffb347 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #1a1a2e;
}

.product-title {
  font-size: 1.25rem;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.product-description {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.product-items {
  text-align: left;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.6;
  padding-left: 0;
  margin: 0;
}

.product-items li {
  margin-bottom: 0.375rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

/* Payment Process */
.payment-process-section {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.payment-steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
}

.payment-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ffd166 0%, #ffb347 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 800;
  color: #1a1a2e;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1rem;
  color: #1a1a2e;
  margin-bottom: 0.375rem;
  font-weight: 700;
}

.step-description {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.payment-features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
}

.feature {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-text h4 {
  font-size: 0.875rem;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
  font-weight: 700;
}

.feature-text p {
  color: #666;
  font-size: 0.75rem;
  margin: 0;
}

/* Schedule Section */
.schedule-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.section-icon {
  color: #ffd166;
  margin-bottom: 0.75rem;
  animation: float 3s ease-in-out infinite;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
}

.schedule-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.schedule-card.important {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d3047 100%);
  color: white;
}

.schedule-card.important .schedule-title {
  color: #ffd166;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.schedule-time {
  font-size: 1.5rem;
}

.schedule-title {
  font-size: 1.25rem;
  color: #1a1a2e;
  margin: 0;
  font-weight: 700;
}

.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.schedule-card.important .schedule-item {
  background: rgba(255, 255, 255, 0.1);
}

.schedule-item.highlight {
  background: rgba(255, 209, 102, 0.2);
  border-left: 4px solid #ffd166;
}

.schedule-period {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 0.875rem;
  flex: 1;
}

.schedule-card.important .schedule-period {
  color: rgba(255, 255, 255, 0.9);
}

.schedule-hours {
  color: #666;
  font-weight: 700;
  font-size: 0.875rem;
  text-align: right;
  flex: 1;
}

.schedule-card.important .schedule-hours {
  color: #ffd166;
}

.schedule-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 209, 102, 0.1);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.schedule-note.important {
  background: rgba(37, 211, 102, 0.1);
}

.note-icon {
  font-size: 1.125rem;
}

.note-text {
  font-size: 0.875rem;
  color: #666;
  font-weight: 600;
}

.schedule-note.important .note-text {
  color: #10b981;
}

.process-list {
  color: rgba(255, 255, 255, 0.9);
  padding-left: 1rem;
  margin: 0 0 1.25rem 0;
  font-size: 0.875rem;
}

.process-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.whatsapp-info {
  margin-top: 1rem;
}

.whatsapp-link {
  display: block;
  background: #25d366;
  color: white;
  text-decoration: none;
  padding: 0.875rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: background-color 0.3s ease;
}

.whatsapp-link:hover {
  background: #128c7e;
}

/* Process Section */
.process-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.process-steps {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.step {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.step-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffd166;
  line-height: 1;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.125rem;
  color: #1a1a2e;
  margin-bottom: 0.375rem;
  font-weight: 700;
}

.step-description {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

/* Benefits Section */
.benefits-section {
  margin-bottom: 2rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.benefit-card {
  background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.benefit-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  animation: float 3s ease-in-out infinite;
}

.benefit-content h3 {
  font-size: 1.125rem;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
  font-weight: 700;
}

.benefit-content p {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d3047 100%);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
  color: white;
  text-align: center;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 100%;
  margin: 0 auto;
}

.cta-icon {
  color: #ffd166;
  margin-bottom: 1.25rem;
  animation: float 3s ease-in-out infinite;
}

.cta-title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.cta-description {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: stretch;
}

.btn {
  display: inline-block;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #ffd166;
  color: #1a1a2e;
}

.btn-primary:hover {
  background: #ffc045;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  border-color: #ffd166;
  color: #ffd166;
  transform: translateY(-2px);
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Tablet Styles */
@media (min-width: 768px) {
  .about-section {
    padding: 2rem;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-line.highlight {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
    max-width: 600px;
  }
  
  .values-grid,
  .products-grid,
  .benefits-grid,
  .payment-features {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .payment-steps,
  .process-steps,
  .schedule-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cta-actions {
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  
  .btn {
    min-width: 200px;
  }
  
  .mission-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .about-section {
    padding: 3rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .values-grid,
  .payment-features {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .products-grid,
  .benefits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .mission-values {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .mission-card {
    margin-bottom: 0;
  }
  
  .mission-content {
    gap: 2rem;
  }
  
  .mission-content p {
    font-size: 1.125rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
}

/* Touch-friendly improvements */
@media (hover: hover) {
  .value-card:hover,
  .product-card:hover,
  .benefit-card:hover,
  .payment-step:hover,
  .schedule-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
      `}</style>
    </section>
  );
};

export default About;