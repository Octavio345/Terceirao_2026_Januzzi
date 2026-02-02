import React, { useState } from 'react';
import { MessageCircle, MapPin, Clock, Phone, CreditCard, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleVerProdutos = () => {
    navigate('/produtos');
  };

  return (
    <section className="contact-section">
      <div className="container">
        {/* Cabeçalho animado */}
        <div className="contact-header">
          <h1 className="contact-title">Fale Com o Terceirão!</h1>
          <p className="contact-subtitle">
            Faça seu pedido de salgados, doces ou rifas! A retirada é na escola 🏫
          </p>
          <div className="header-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-dot"></div>
            <div className="decoration-line"></div>
          </div>
        </div>

        <div className="contact-grid">
          {/* Informações de contato */}
          <div className="contact-info">
            <div className="info-card">
              <div className="info-header">
                <div className="info-icon whatsapp">
                  <MessageCircle size={24} />
                </div>
                <h3 className="info-title">WhatsApp Direto</h3>
              </div>
              <div className="info-content">
                <p className="info-text">Faça seu pedido ou tire dúvidas</p>
                <a 
                  href="https://wa.me/5518987654321" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <Phone size={18} />
                  (18) 98765-4321
                  <span className="link-arrow">→</span>
                </a>
                <p className="info-note">Respondemos rapidinho! 🚀</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <div className="info-icon location">
                  <MapPin size={24} />
                </div>
                <h3 className="info-title">Local de Retirada</h3>
              </div>
              <div className="info-content">
                <p className="info-text">E.E. Prof. Oswaldo Januzzi</p>
                <div className="contact-detail">
                  <MapPin size={18} />
                  <span>Av. Frei Marcelo Manilia, 750 - Centro, Buritama - SP</span>
                </div>
                <p className="info-note">⚠️ Retirada SOMENTE na escola</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <div className="info-icon schedule">
                  <Clock size={24} />
                </div>
                <h3 className="info-title">Horários de Retirada</h3>
              </div>
              <div className="info-content">
                <div className="horarios-list">
                  <div className="horario-item">
                    <div className="horario-periodo">Manhã:</div>
                    <div className="horario-detalhe">9:30 - 9:45 | 11:25 - 12:25</div>
                  </div>
                  <div className="horario-item">
                    <div className="horario-periodo">Tarde/Noite:</div>
                    <div className="horario-detalhe">15:55 - 16:10 | 18:40 - 19:40</div>
                  </div>
                  <div className="horario-item">
                    <div className="horario-periodo">Observação:</div>
                    <div className="horario-detalhe">Entregas a partir das 10h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de pagamento */}
            <div className="payment-card">
              <div className="payment-header">
                <CreditCard size={24} />
                <h3>💳 Pagamento via PIX</h3>
              </div>
              <div className="payment-content">
                <div className="pix-details">
                  <div className="pix-key">
                    <span className="key-label">Chave PIX (Celular):</span>
                    <div className="key-value">
                      <code>(18) 98765-4321</code>
                      <button 
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText('(18) 98765-4321');
                          alert('Número copiado! Envie no WhatsApp');
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  <div className="payment-process">
                    <h4>Como funciona:</h4>
                    <ol className="process-steps">
                      <li>Escolha seus produtos</li>
                      <li>Faça o pedido pelo WhatsApp</li>
                      <li>Passaremos o valor e chave PIX</li>
                      <li>Envie o comprovante e combine a retirada</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Área com botão para produtos */}
          <div className="contact-form-container">
            <div className="form-header">
              <h2 className="form-title">🛍️ Veja Nossos Produtos!</h2>
              <p className="form-subtitle">Confira nossa variedade de salgados, doces e rifas</p>
            </div>
            
            <div className="products-action">
              <button 
                onClick={handleVerProdutos}
                className="products-btn"
              >
                <ShoppingBag size={28} />
                <span>Ver Todos os Produtos</span>
              </button>
              
              <div className="products-preview">
                <h3>O que oferecemos:</h3>
                <div className="categories-grid">
                  <div className="category-card">
                    <div className="category-icon">🥟</div>
                    <h4>Salgados</h4>
                    <p>Coxinhas, risoles, pastéis, esfirras e muito mais!</p>
                  </div>
                  <div className="category-card">
                    <div className="category-icon">🍰</div>
                    <h4>Doces</h4>
                    <p>Brigadeiros, beijinhos, bolos, trufas e delicias!</p>
                  </div>
                  <div className="category-card">
                    <div className="category-icon">🎫</div>
                    <h4>Rifas</h4>
                    <p>Prêmios incríveis para ajudar o Terceirão!</p>
                  </div>
                  <div className="category-card">
                    <div className="category-icon">🎁</div>
                    <h4>Combos</h4>
                    <p>Pacotes especiais com desconto!</p>
                  </div>
                </div>
              </div>

              <div className="process-info">
                <h3>Como funciona:</h3>
                <div className="process-steps-horizontal">
                  <div className="process-step">
                    <div className="step-number">1</div>
                    <p>Veja os produtos</p>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="process-step">
                    <div className="step-number">2</div>
                    <p>Anote o que quer</p>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="process-step">
                    <div className="step-number">3</div>
                    <p>Entre no WhatsApp</p>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="process-step">
                    <div className="step-number">4</div>
                    <p>Faça seu pedido</p>
                  </div>
                </div>
              </div>

              <div className="retirada-info">
                <div className="retirada-icon">🏫</div>
                <div className="retirada-text">
                  <strong>IMPORTANTE:</strong> A retirada dos pedidos será feita <strong>SOMENTE</strong> na escola 
                  (E.E. Prof. Oswaldo Januzzi) - Av. Frei Marcelo Manilia, 750. 
                  <br/><br/>
                  <strong>Horários de retirada:</strong><br/>
                  • Manhã: 9:30 - 9:45 | 11:25 - 12:25<br/>
                  • Tarde/Noite: 15:55 - 16:10 | 18:40 - 19:40<br/>
                  • Entregas a partir das 10h da manhã
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="faq-title">Tire suas Dúvidas</h2>
          <div className="faq-grid">
            <div 
              className={`faq-item ${activeFaq === 0 ? 'active' : ''}`}
              onClick={() => toggleFaq(0)}
            >
              <div className="faq-question">
                <h3>Onde retiro meu pedido?</h3>
                <span className="faq-icon">{activeFaq === 0 ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>TODOS os pedidos são retirados na <strong>E.E. Prof. Oswaldo Januzzi</strong>, 
                na Av. Frei Marcelo Manilia, 750 - Centro, Buritama-SP.</p>
              </div>
            </div>
            
            <div 
              className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}
              onClick={() => toggleFaq(1)}
            >
              <div className="faq-question">
                <h3>Quais os horários de retirada?</h3>
                <span className="faq-icon">{activeFaq === 1 ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p><strong>Manhã:</strong><br/>
                  9:30 - 9:45 | 11:25 - 12:25<br/><br/>
                  
                  <strong>Tarde/Noite:</strong><br/>
                  15:55 - 16:10 | 18:40 - 19:40<br/><br/>
                  
                  <strong>Entregas:</strong> A partir das 10h da manhã<br/><br/>
                  
                  </p>
              </div>
            </div>
            
            <div 
              className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}
              onClick={() => toggleFaq(2)}
            >
              <div className="faq-question">
                <h3>Como funciona o pagamento?</h3>
                <span className="faq-icon">{activeFaq === 2 ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>1. Escolha seus produtos<br/>
                   2. Faça o pedido pelo WhatsApp<br/>
                   3. Passaremos o valor e chave PIX ou Pagamento em Dinheiro<br/>
                   4. Envie o comprovante e combine a retirada</p>
              </div>
            </div>
            
            <div 
              className={`faq-item ${activeFaq === 3 ? 'active' : ''}`}
              onClick={() => toggleFaq(3)}
            >
              <div className="faq-question">
                <h3>Quem prepara os produtos?</h3>
                <span className="faq-icon">{activeFaq === 3 ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>Todos os salgados e doces são feitos pelos próprios alunos do Terceirão 2026 
                e suas famílias, com muito carinho e higiene! 🧑‍🍳</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos inline */}
      <style>{`
/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Variáveis CSS */
:root {
  --color-dark: #1a1a2e;
  --color-yellow: #ffd166;
  --color-green: #06d6a0;
  --color-light-gray: #f8f9fa;
  --color-gray: #e9ecef;
  --color-white: #ffffff;
  
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-yellow: 0 4px 15px rgba(255, 209, 102, 0.3);
  --shadow-yellow-lg: 0 10px 25px rgba(255, 209, 102, 0.4);
  
  --gradient-primary: linear-gradient(135deg, var(--color-yellow) 0%, #ffb347 100%);
  
  --transition-normal: 0.3s ease;
}

/* Animações */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px var(--color-yellow); }
  50% { box-shadow: 0 0 20px var(--color-yellow); }
}

/* Estilos da seção principal */
.contact-section {
  padding: var(--space-xl) var(--space-sm);
  background: var(--color-light-gray);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

@media (min-width: 768px) {
  .contact-section {
    padding: var(--space-2xl) var(--space-md);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-sm);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--space-md);
  }
}

/* CABEÇALHO - ESTILO CORRIGIDO */
.contact-header {
  text-align: center;
  margin-bottom: var(--space-xl);
  animation: scaleIn 0.6s ease;
  padding: var(--space-lg) 0;
}

@media (min-width: 768px) {
  .contact-header {
    margin-bottom: var(--space-2xl);
    padding: var(--space-xl) 0;
  }
}

.contact-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-dark);
  margin-bottom: var(--space-sm);
  background: linear-gradient(135deg, var(--color-dark) 0%, #ff6b6b 50%, var(--color-yellow) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% auto;
  animation: scaleIn 0.8s ease;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .contact-title {
    font-size: 2.5rem;
  }
}

@media (min-width: 480px) and (max-width: 767px) {
  .contact-title {
    font-size: 2rem;
  }
}

.contact-subtitle {
  color: #666;
  font-size: 0.95rem;
  max-width: 600px;
  margin: 0 auto var(--space-md);
  line-height: 1.5;
  padding: 0 var(--space-sm);
}

@media (min-width: 768px) {
  .contact-subtitle {
    font-size: 1.1rem;
    margin-bottom: var(--space-lg);
    padding: 0;
  }
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  max-width: 250px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .header-decoration {
    gap: var(--space-md);
    max-width: 300px;
  }
}

.decoration-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-yellow), transparent);
}

.decoration-dot {
  width: 6px;
  height: 6px;
  background: var(--color-yellow);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@media (min-width: 768px) {
  .decoration-dot {
    width: 8px;
    height: 8px;
  }
}

/* Layout principal */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

@media (min-width: 992px) {
  .contact-grid {
    grid-template-columns: 1fr 1.2fr;
    gap: var(--space-2xl);
    margin-bottom: var(--space-2xl);
  }
}

/* Cards de informações */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .contact-info {
    gap: var(--space-lg);
  }
}

.info-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray);
  transition: all var(--transition-normal);
  animation: fadeIn 0.5s ease;
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .info-card {
    padding: var(--space-lg);
    border-radius: var(--radius-xl);
  }
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-xl);
  border-color: var(--color-yellow);
}

.info-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

@media (min-width: 768px) {
  .info-header {
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .info-icon {
    width: 50px;
    height: 50px;
    border-radius: var(--radius-lg);
  }
}

.info-icon.whatsapp {
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: white;
}

.info-icon.location {
  background: linear-gradient(135deg, var(--color-green), #05B88E);
  color: white;
}

.info-icon.schedule {
  background: linear-gradient(135deg, #6C757D, #495057);
  color: white;
}

.info-title {
  font-size: 1.1rem;
  color: var(--color-dark);
  margin: 0;
  font-weight: 700;
}

@media (min-width: 768px) {
  .info-title {
    font-size: 1.25rem;
  }
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.info-text {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

@media (min-width: 768px) {
  .info-text {
    font-size: 0.9rem;
  }
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-dark);
  text-decoration: none;
  font-weight: 600;
  padding: 0.75rem;
  background: var(--color-light-gray);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .contact-link {
    gap: 0.75rem;
    font-size: 1rem;
  }
}

.contact-link:hover {
  background: var(--color-yellow);
  color: var(--color-dark);
  transform: translateX(5px);
}

.link-arrow {
  margin-left: auto;
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition-normal);
}

.contact-link:hover .link-arrow {
  opacity: 1;
  transform: translateX(0);
}

.contact-detail {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #666;
  padding: 0.75rem;
  background: var(--color-light-gray);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  line-height: 1.4;
}

@media (min-width: 768px) {
  .contact-detail {
    gap: 0.75rem;
    font-size: 0.9rem;
  }
}

.info-note {
  font-size: 0.7rem;
  color: #999;
  margin: 0;
  font-style: italic;
}

@media (min-width: 768px) {
  .info-note {
    font-size: 0.75rem;
  }
}

/* HORÁRIOS - ESTILO CORRIGIDO (SEM QUEBRAS) */
.horarios-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.horario-item {
  display: block; /* MUDANÇA CRÍTICA: block em vez de flex */
  padding: 0.75rem;
  background: var(--color-light-gray);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-yellow);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (min-width: 768px) {
  .horario-item {
    padding: 0.875rem 1rem;
  }
}

.horario-periodo {
  font-weight: 700;
  color: var(--color-dark);
  font-size: 0.9rem;
  display: block; /* MUDANÇA: display block */
  margin-bottom: 0.25rem;
}

@media (min-width: 768px) {
  .horario-periodo {
    font-size: 0.95rem;
  }
}

.horario-detalhe {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  display: block; /* MUDANÇA: display block */
}

@media (min-width: 768px) {
  .horario-detalhe {
    font-size: 0.9rem;
  }
}

/* Para as observações específicas */
.horario-item:last-child {
  background: rgba(255, 209, 102, 0.15);
  border-left-color: #ff9f1c;
  margin-top: 0.5rem;
}

.horario-item:last-child .horario-periodo {
  color: #e76f51;
}

.horario-item:last-child .horario-detalhe {
  color: #666;
  font-style: italic;
  font-size: 0.8rem;
}

@media (min-width: 768px) {
  .horario-item:last-child .horario-detalhe {
    font-size: 0.85rem;
  }
}

/* Card de pagamento */
.payment-card {
  background: linear-gradient(135deg, #1A1A2E 0%, #2D3047 100%);
  color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-lg);
  animation: fadeIn 0.5s ease 0.3s both;
}

@media (min-width: 768px) {
  .payment-card {
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
  }
}

.payment-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

@media (min-width: 768px) {
  .payment-header {
    margin-bottom: var(--space-lg);
  }
}

.payment-header h3 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 700;
}

@media (min-width: 768px) {
  .payment-header h3 {
    font-size: 1.5rem;
  }
}

.pix-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .pix-details {
    gap: var(--space-lg);
  }
}

.pix-key {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

@media (min-width: 768px) {
  .pix-key {
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
  }
}

.key-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--space-sm);
}

@media (min-width: 768px) {
  .key-label {
    font-size: 0.875rem;
  }
}

.key-value {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (min-width: 768px) {
  .key-value {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: wrap;
  }
}

@media (min-width: 480px) and (max-width: 767px) {
  .key-value {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.key-value code {
  font-family: monospace;
  font-size: 1rem;
  color: var(--color-yellow);
  font-weight: 600;
  word-break: break-all;
  flex: 1;
}

@media (min-width: 768px) {
  .key-value code {
    font-size: 1.125rem;
  }
}

.copy-btn {
  background: var(--color-yellow);
  color: var(--color-dark);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
}

@media (min-width: 768px) {
  .copy-btn {
    width: auto;
    font-size: 0.875rem;
    padding: 0.5rem 1.25rem;
  }
}

@media (min-width: 480px) and (max-width: 767px) {
  .copy-btn {
    width: auto;
  }
}

.copy-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.payment-process h4 {
  color: var(--color-yellow);
  margin-bottom: var(--space-sm);
  font-size: 1rem;
}

@media (min-width: 768px) {
  .payment-process h4 {
    font-size: 1.125rem;
    margin-bottom: var(--space-md);
  }
}

.process-steps {
  color: rgba(255, 255, 255, 0.9);
  padding-left: var(--space-md);
  margin: 0;
  font-size: 0.85rem;
}

@media (min-width: 768px) {
  .process-steps {
    font-size: 0.875rem;
  }
}

.process-steps li {
  margin-bottom: var(--space-sm);
  line-height: 1.5;
}

/* Lado direito - produtos */
.contact-form-container {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-gray);
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .contact-form-container {
    padding: var(--space-xl);
    border-radius: var(--radius-xl);
  }
}

.form-header {
  text-align: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 2px solid var(--color-light-gray);
}

@media (min-width: 768px) {
  .form-header {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-lg);
  }
}

.form-title {
  font-size: 1.5rem;
  color: var(--color-dark);
  margin-bottom: var(--space-sm);
  font-weight: 700;
}

@media (min-width: 768px) {
  .form-title {
    font-size: 2rem;
  }
}

.form-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@media (min-width: 768px) {
  .form-subtitle {
    font-size: 1rem;
  }
}

.products-action {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  align-items: center;
  justify-content: center;
  flex: 1;
}

@media (min-width: 768px) {
  .products-action {
    gap: var(--space-xl);
  }
}

.products-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--gradient-primary);
  color: var(--color-dark);
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 700;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-yellow);
  border: none;
  cursor: pointer;
  font-family: inherit;
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

@media (min-width: 768px) {
  .products-btn {
    padding: 1.25rem 2.5rem;
    font-size: 1.25rem;
    width: auto;
    max-width: none;
  }
}

@media (min-width: 480px) and (max-width: 767px) {
  .products-btn {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }
}

.products-btn:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-yellow-lg);
  animation: glow 1.5s ease-in-out infinite;
}

.products-preview {
  width: 100%;
}

.products-preview h3 {
  text-align: center;
  color: var(--color-dark);
  font-size: 1.25rem;
  margin-bottom: var(--space-md);
  font-weight: 600;
}

@media (min-width: 768px) {
  .products-preview h3 {
    font-size: 1.5rem;
    margin-bottom: var(--space-lg);
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 480px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.category-card {
  background: var(--color-light-gray);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  text-align: center;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}

@media (min-width: 768px) {
  .category-card {
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
  }
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-yellow);
  box-shadow: var(--shadow-md);
}

.category-icon {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
}

@media (min-width: 768px) {
  .category-icon {
    font-size: 2.5rem;
  }
}

.category-card h4 {
  color: var(--color-dark);
  margin-bottom: var(--space-xs);
  font-size: 1rem;
  font-weight: 600;
}

@media (min-width: 768px) {
  .category-card h4 {
    font-size: 1.125rem;
  }
}

.category-card p {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

@media (min-width: 768px) {
  .category-card p {
    font-size: 0.875rem;
  }
}

/* Processo */
.process-info {
  width: 100%;
}

.process-info h3 {
  text-align: center;
  color: var(--color-dark);
  font-size: 1.25rem;
  margin-bottom: var(--space-md);
  font-weight: 600;
}

@media (min-width: 768px) {
  .process-info h3 {
    font-size: 1.5rem;
    margin-bottom: var(--space-lg);
  }
}

.process-steps-horizontal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .process-steps-horizontal {
    flex-direction: row;
    justify-content: space-between;
    gap: var(--space-sm);
  }
}

.process-step {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
}

@media (min-width: 768px) {
  .process-step {
    flex-direction: column;
    gap: var(--space-xs);
    min-width: 100px;
  }
}

.process-step .step-number {
  width: 35px;
  height: 35px;
  background: var(--color-yellow);
  color: var(--color-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .process-step .step-number {
    width: 40px;
    height: 40px;
    font-size: 1.125rem;
  }
}

.process-step p {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

@media (min-width: 768px) {
  .process-step p {
    text-align: center;
    font-size: 0.85rem;
  }
}

.step-arrow {
  color: var(--color-yellow);
  font-size: 1.25rem;
  font-weight: bold;
  opacity: 0.7;
  display: none;
}

@media (min-width: 768px) {
  .step-arrow {
    display: block;
  }
}

/* Informação de retirada */
.retirada-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(255, 209, 102, 0.1);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-yellow);
  margin-top: var(--space-lg);
}

@media (min-width: 768px) {
  .retirada-info {
    flex-direction: row;
    gap: var(--space-md);
  }
}

.retirada-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  text-align: center;
}

@media (min-width: 768px) {
  .retirada-icon {
    text-align: left;
  }
}

.retirada-text {
  color: #666;
  font-size: 0.8rem;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .retirada-text {
    font-size: 0.875rem;
  }
}

/* FAQ Section */
.faq-section {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  margin-top: var(--space-xl);
}

@media (min-width: 768px) {
  .faq-section {
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    margin-top: var(--space-2xl);
  }
}

.faq-title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--color-dark);
  margin-bottom: var(--space-lg);
  font-weight: 700;
}

@media (min-width: 768px) {
  .faq-title {
    font-size: 2rem;
    margin-bottom: var(--space-xl);
  }
}

.faq-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-sm);
}

@media (min-width: 768px) {
  .faq-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }
}

.faq-item {
  background: var(--color-light-gray);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  cursor: pointer;
}

@media (min-width: 768px) {
  .faq-item {
    border-radius: var(--radius-lg);
  }
}

.faq-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  text-align: left;
}

@media (min-width: 768px) {
  .faq-question {
    padding: var(--space-lg);
  }
}

.faq-question h3 {
  font-size: 0.95rem;
  color: var(--color-dark);
  margin: 0;
  font-weight: 600;
  flex: 1;
  line-height: 1.3;
}

@media (min-width: 768px) {
  .faq-question h3 {
    font-size: 1.125rem;
  }
}

@media (min-width: 480px) and (max-width: 767px) {
  .faq-question h3 {
    font-size: 1.05rem;
  }
}

.faq-icon {
  font-size: 1.25rem;
  color: var(--color-yellow);
  font-weight: 300;
  transition: transform 0.3s;
  flex-shrink: 0;
  margin-left: var(--space-sm);
}

@media (min-width: 768px) {
  .faq-icon {
    font-size: 1.5rem;
    margin-left: 0;
  }
}

.faq-item.active .faq-icon {
  transform: rotate(45deg);
}

.faq-answer {
  padding: 0 var(--space-md);
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

@media (min-width: 768px) {
  .faq-answer {
    padding: 0 var(--space-lg);
  }
}

.faq-item.active .faq-answer {
  padding: 0 var(--space-md) var(--space-md);
  max-height: 500px;
}

@media (min-width: 768px) {
  .faq-item.active .faq-answer {
    padding: 0 var(--space-lg) var(--space-lg);
  }
}

.faq-answer p {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0;
}

@media (min-width: 768px) {
  .faq-answer p {
    font-size: 0.95rem;
  }
}
      `}</style>
    </section>
  );
};

export default Contact;