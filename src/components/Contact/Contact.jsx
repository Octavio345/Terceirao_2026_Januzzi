import React, { useState } from 'react';
import { MessageCircle, MapPin, Clock, Phone, CreditCard, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Contact.css'

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
        <div className="contact-header animate-scale">
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
            <div className="info-card animate-in" style={{ animationDelay: '0.1s' }}>
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

            <div className="info-card animate-in" style={{ animationDelay: '0.2s' }}>
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

            <div className="info-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="info-header">
                <div className="info-icon schedule">
                  <Clock size={24} />
                </div>
                <h3 className="info-title">Horários de Retirada</h3>
              </div>
              <div className="info-content">
                <div className="horarios-list">
                  <div className="horario-item">
                    <div className="horario-dia">Intervalo:</div>
                    <div className="horario-hora">Durante os intervalos das aulas</div>
                  </div>
                  <div className="horario-item">
                    <div className="horario-dia">Manhã:</div>
                    <div className="horario-hora">A partir das 10h</div>
                  </div>
                  <div className="horario-item">
                    <div className="horario-dia">Observação:</div>
                    <div className="horario-hora">Combinar previamente pelo WhatsApp</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de pagamento */}
            <div className="payment-card animate-in" style={{ animationDelay: '0.4s' }}>
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
                  (E.E. Prof. Oswaldo Januzzi) - Av. Frei Marcelo Manilia, 750. Horários: Intervalo das aulas ou a partir das 10h da manhã.
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
              className={`faq-item animate-in ${activeFaq === 0 ? 'active' : ''}`}
              onClick={() => toggleFaq(0)}
            >
              <div className="faq-question">
                <h3>Onde retiro meu pedido?</h3>
                <span className="faq-icon">{activeFaq === 0 ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>TODOS os pedidos são retirados na <strong>E.E. Prof. Oswaldo Januzzi</strong>, 
                na Av. Frei Marcelo Manilia, 750 - Centro, Buritama-SP. Não fazemos entregas.</p>
              </div>
            </div>
            
            <div 
              className={`faq-item animate-in ${activeFaq === 1 ? 'active' : ''}`}
              onClick={() => toggleFaq(1)}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="faq-question">
                <h3>Quais os horários de retirada?</h3>
                <span className="faq-icon">{activeFaq === 1 ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p><strong>Duas opções:</strong><br/>
                  1. <strong>Durante os intervalos</strong> das aulas<br/>
                  2. <strong>A partir das 10h</strong> da manhã<br/><br/>
                  Sempre combinando previamente pelo WhatsApp! ⏰</p>
              </div>
            </div>
            
            <div 
              className={`faq-item animate-in ${activeFaq === 2 ? 'active' : ''}`}
              onClick={() => toggleFaq(2)}
              style={{ animationDelay: '0.2s' }}
            >
              <div className="faq-question">
                <h3>Como funciona o pagamento?</h3>
                <span className="faq-icon">{activeFaq === 2 ? '−' : '+'}</span>
              </div>
              <div className="faq-answer">
                <p>1. Escolha seus produtos<br/>
                   2. Faça o pedido pelo WhatsApp<br/>
                   3. Passaremos o valor e chave PIX<br/>
                   4. Envie o comprovante e combine a retirada</p>
              </div>
            </div>
            
            <div 
              className={`faq-item animate-in ${activeFaq === 3 ? 'active' : ''}`}
              onClick={() => toggleFaq(3)}
              style={{ animationDelay: '0.3s' }}
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
    </section>
  );
};

export default Contact;