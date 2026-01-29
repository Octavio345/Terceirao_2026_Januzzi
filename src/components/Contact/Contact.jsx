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

      <style jsx>{`
        .contact-section {
          padding: var(--space-2xl) 0;
          background: var(--color-light-gray);
          min-height: 100vh;
        }

        .contact-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
          animation-delay: 0.2s;
        }

        .contact-title {
          font-size: 3rem;
          font-weight: 800;
          color: var(--color-dark);
          margin-bottom: var(--space-sm);
          background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-yellow) 50%, var(--color-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .contact-subtitle {
          color: #666;
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto var(--space-lg);
          line-height: 1.6;
        }

        .header-decoration {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          max-width: 300px;
          margin: 0 auto;
        }

        .decoration-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-yellow), transparent);
        }

        .decoration-dot {
          width: 8px;
          height: 8px;
          background: var(--color-yellow);
          border-radius: 50%;
          animation: var(--pulse-animation);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        @media (min-width: 992px) {
          .contact-grid {
            grid-template-columns: 1fr 1.2fr;
          }
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .info-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-gray);
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
          border-color: var(--color-yellow);
        }

        .info-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity var(--transition-normal);
        }

        .info-card:hover::before {
          opacity: 1;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .info-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
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
          font-size: 1.25rem;
          color: var(--color-dark);
          margin: 0;
          font-weight: 700;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .info-text {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
        }

        .contact-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-dark);
          text-decoration: none;
          font-weight: 600;
          padding: 0.75rem;
          background: var(--color-light-gray);
          border-radius: var(--radius-md);
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
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
          align-items: center;
          gap: 0.75rem;
          color: #666;
          padding: 0.75rem;
          background: var(--color-light-gray);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
        }

        .info-note {
          font-size: 0.75rem;
          color: #999;
          margin: 0;
          font-style: italic;
        }

        .horarios-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .horario-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: var(--color-light-gray);
          border-radius: var(--radius-sm);
        }

        .horario-dia {
          font-weight: 600;
          color: var(--color-dark);
          font-size: 0.9rem;
        }

        .horario-hora {
          color: #666;
          font-size: 0.85rem;
          text-align: right;
        }

        .payment-card {
          background: linear-gradient(135deg, #1A1A2E 0%, #2D3047 100%);
          color: white;
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-lg);
        }

        .payment-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-lg);
        }

        .payment-header h3 {
          font-size: 1.5rem;
          margin: 0;
          font-weight: 700;
        }

        .pix-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .pix-key {
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          backdrop-filter: blur(10px);
        }

        .key-label {
          display: block;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: var(--space-sm);
        }

        .key-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .key-value code {
          font-family: monospace;
          font-size: 1.125rem;
          color: var(--color-yellow);
          font-weight: 600;
          word-break: break-all;
          flex: 1;
        }

        .copy-btn {
          background: var(--color-yellow);
          color: var(--color-dark);
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-md);
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .copy-btn:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .payment-process {
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
        }

        .payment-process h4 {
          color: var(--color-yellow);
          margin-bottom: var(--space-md);
          font-size: 1.125rem;
        }

        .process-steps {
          color: rgba(255, 255, 255, 0.9);
          padding-left: var(--space-md);
          margin: 0;
        }

        .process-steps li {
          margin-bottom: var(--space-sm);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .contact-form-container {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--color-gray);
          display: flex;
          flex-direction: column;
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--space-xl);
          padding-bottom: var(--space-lg);
          border-bottom: 2px solid var(--color-light-gray);
        }

        .form-title {
          font-size: 2rem;
          color: var(--color-dark);
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .form-subtitle {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .products-action {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .products-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--gradient-primary);
          color: var(--color-dark);
          text-decoration: none;
          padding: 1.25rem 2.5rem;
          border-radius: var(--radius-lg);
          font-size: 1.25rem;
          font-weight: 700;
          transition: all var(--transition-normal);
          box-shadow: var(--shadow-yellow);
          border: none;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .products-btn:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-yellow-lg);
          animation: var(--glow-animation);
        }

        .products-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .products-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .products-preview {
          width: 100%;
        }

        .products-preview h3 {
          text-align: center;
          color: var(--color-dark);
          font-size: 1.5rem;
          margin-bottom: var(--space-lg);
          font-weight: 600;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-md);
        }

        @media (max-width: 768px) {
          .categories-grid {
            grid-template-columns: 1fr;
          }
        }

        .category-card {
          background: var(--color-light-gray);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          text-align: center;
          transition: all var(--transition-normal);
          border: 2px solid transparent;
        }

        .category-card:hover {
          transform: translateY(-5px);
          border-color: var(--color-yellow);
          box-shadow: var(--shadow-md);
        }

        .category-icon {
          font-size: 2.5rem;
          margin-bottom: var(--space-sm);
        }

        .category-card h4 {
          color: var(--color-dark);
          margin-bottom: var(--space-xs);
          font-size: 1.125rem;
          font-weight: 600;
        }

        .category-card p {
          color: #666;
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
        }

        .process-info {
          width: 100%;
        }

        .process-info h3 {
          text-align: center;
          color: var(--color-dark);
          font-size: 1.5rem;
          margin-bottom: var(--space-lg);
          font-weight: 600;
        }

        .process-steps-horizontal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .process-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
          flex: 1;
          min-width: 100px;
        }

        .process-step .step-number {
          width: 40px;
          height: 40px;
          background: var(--color-yellow);
          color: var(--color-dark);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .process-step p {
          text-align: center;
          font-size: 0.85rem;
          color: #666;
          margin: 0;
          font-weight: 500;
        }

        .step-arrow {
          color: var(--color-yellow);
          font-size: 1.5rem;
          font-weight: bold;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .step-arrow {
            display: none;
          }
          
          .process-steps-horizontal {
            flex-direction: column;
            gap: var(--space-lg);
          }
          
          .process-step {
            flex-direction: row;
            gap: var(--space-md);
            min-width: 100%;
            justify-content: flex-start;
          }
          
          .process-step p {
            text-align: left;
          }
        }

        .retirada-info {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-md);
          background: rgba(255, 209, 102, 0.1);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--color-yellow);
          margin-top: var(--space-lg);
        }

        .retirada-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .retirada-text {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* FAQ Section */
        .faq-section {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-md);
          margin-top: var(--space-2xl);
        }

        .faq-title {
          text-align: center;
          font-size: 2rem;
          color: var(--color-dark);
          margin-bottom: var(--space-xl);
          font-weight: 700;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-md);
        }

        @media (min-width: 768px) {
          .faq-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .faq-item {
          background: var(--color-light-gray);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-normal);
          cursor: pointer;
        }

        .faq-item:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          text-align: left;
        }

        .faq-question h3 {
          font-size: 1.125rem;
          color: var(--color-dark);
          margin: 0;
          font-weight: 600;
          flex: 1;
        }

        .faq-icon {
          font-size: 1.5rem;
          color: var(--color-yellow);
          font-weight: 300;
          transition: transform 0.3s;
        }

        .faq-item.active .faq-icon {
          transform: rotate(45deg);
        }

        .faq-answer {
          padding: 0 var(--space-lg);
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s var(--ease-smooth);
        }

        .faq-item.active .faq-answer {
          padding: 0 var(--space-lg) var(--space-lg);
          max-height: 500px;
        }

        .faq-answer p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        /* Animações */
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .contact-title {
            font-size: 2rem;
          }
          
          .contact-subtitle {
            font-size: 1rem;
          }
          
          .contact-form-container {
            padding: var(--space-lg);
          }
          
          .form-title {
            font-size: 1.5rem;
          }
          
          .retirada-info {
            flex-direction: column;
            text-align: center;
          }
          
          .retirada-icon {
            align-self: center;
          }
          
          .horario-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .horario-hora {
            text-align: left;
          }
          
          .products-btn {
            padding: 1rem 2rem;
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .key-value {
            flex-direction: column;
            align-items: stretch;
            gap: var(--space-sm);
          }
          
          .copy-btn {
            width: 100%;
          }
          
          .faq-question h3 {
            font-size: 1rem;
          }
          
          .contact-detail {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;