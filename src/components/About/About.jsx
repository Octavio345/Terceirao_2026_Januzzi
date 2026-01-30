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
    </section>
  );
};

export default About;