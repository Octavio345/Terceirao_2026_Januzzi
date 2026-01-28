import React, { useState } from 'react';
import { MessageCircle, Mail, MapPin, Clock, Send, CheckCircle, Phone, CreditCard } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    product: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', phone: '', message: '', product: '' });
  };

  return (
    <section className="contact-section">
      <div className="container">
        {/* Cabeçalho animado */}
        <div className="contact-header animate-scale">
          <h1 className="contact-title">Entre em Contato</h1>
          <p className="contact-subtitle">
            Tire suas dúvidas, faça pedidos ou envie sugestões. Estamos aqui para ajudar!
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
                <p className="info-text">Atendimento rápido via WhatsApp</p>
                <a 
                  href="https://wa.me/5511987654321" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <Phone size={18} />
                  (11) 98765-4321
                  <span className="link-arrow">→</span>
                </a>
                <p className="info-note">Respondemos em até 15 minutos</p>
              </div>
            </div>

            <div className="info-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="info-header">
                <div className="info-icon email">
                  <Mail size={24} />
                </div>
                <h3 className="info-title">E-mail Oficial</h3>
              </div>
              <div className="info-content">
                <p className="info-text">Para assuntos formais ou documentação</p>
                <a 
                  href="mailto:terceirao2026@escola.com" 
                  className="contact-link"
                >
                  <Mail size={18} />
                  terceirao2026@escola.com
                  <span className="link-arrow">→</span>
                </a>
              </div>
            </div>

            <div className="info-card animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="info-header">
                <div className="info-icon location">
                  <MapPin size={24} />
                </div>
                <h3 className="info-title">Localização</h3>
              </div>
              <div className="info-content">
                <p className="info-text">Colégio [Nome da Escola]</p>
                <div className="contact-detail">
                  <MapPin size={18} />
                  <span>Rua da Escola, 123 - São Paulo, SP</span>
                </div>
                <p className="info-note">Retirada de pedidos combinada</p>
              </div>
            </div>

            <div className="info-card animate-in" style={{ animationDelay: '0.4s' }}>
              <div className="info-header">
                <div className="info-icon schedule">
                  <Clock size={24} />
                </div>
                <h3 className="info-title">Horário</h3>
              </div>
              <div className="info-content">
                <p className="info-text">Segunda a Sexta-feira</p>
                <div className="contact-detail">
                  <Clock size={18} />
                  <span>14:00 às 18:00</span>
                </div>
                <p className="info-note">Sábados por agendamento</p>
              </div>
            </div>

            {/* Informações de pagamento */}
            <div className="payment-card animate-in" style={{ animationDelay: '0.5s' }}>
              <div className="payment-header">
                <CreditCard size={24} />
                <h3>💳 Pagamento via PIX</h3>
              </div>
              <div className="payment-content">
                <div className="pix-details">
                  <div className="pix-key">
                    <span className="key-label">Chave PIX (E-mail):</span>
                    <div className="key-value">
                      <code>terceirao2026@escola.com</code>
                      <button 
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText('terceirao2026@escola.com');
                          alert('Chave copiada!');
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  <div className="payment-note">
                    <div className="note-icon">⚠️</div>
                    <p>Envie o comprovante pelo WhatsApp após o pagamento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de contato */}
          <div className="contact-form-container animate-scale" style={{ animationDelay: '0.6s' }}>
            <div className="form-header">
              <h2 className="form-title">Formulário de Contato</h2>
              <p className="form-subtitle">Preencha os dados abaixo que entraremos em contato</p>
            </div>
            
            {submitted ? (
              <div className="success-message">
                <div className="success-icon">
                  <CheckCircle size={48} />
                </div>
                <h3 className="success-title">Mensagem enviada!</h3>
                <p className="success-text">
                  Obrigado pelo contato. Retornaremos em breve via WhatsApp ou e-mail.
                </p>
                <div className="success-decoration">
                  <div className="success-dot"></div>
                  <div className="success-dot"></div>
                  <div className="success-dot"></div>
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <span className="label-text">Nome Completo *</span>
                    <span className="label-required"></span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Digite seu nome completo"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <span className="label-text">E-mail *</span>
                      <span className="label-required"></span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="seu@email.com"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      <span className="label-text">Telefone/WhatsApp *</span>
                      <span className="label-required"></span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="(11) 99999-9999"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="product" className="form-label">
                    <span className="label-text">Produto de Interesse</span>
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Selecione um produto...</option>
                    <option value="doces">Doces & Sobremesas</option>
                    <option value="salgados">Salgados & Lanches</option>
                    <option value="bebidas">Bebidas & Refrigerantes</option>
                    <option value="rifas">Rifas & Promoções</option>
                    <option value="combos">Combos Especiais</option>
                    <option value="outro">Outro/Personalizado</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    <span className="label-text">Mensagem *</span>
                    <span className="label-required"></span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Descreva seu pedido, quantidade e tire suas dúvidas..."
                    className="form-textarea"
                  ></textarea>
                  <div className="textarea-note">
                    💡 <strong>Dica:</strong> Inclua nome completo dos produtos, tamanhos (se aplicável) e quantidade
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    <Send size={20} />
                    <span>Enviar Mensagem</span>
                    <div className="btn-effect"></div>
                  </button>
                  
                  <div className="form-note">
                    <Clock size={16} />
                    <span>Respondemos em até 24 horas úteis</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="faq-title">Perguntas Frequentes</h2>
          <div className="faq-grid">
            <div className="faq-item animate-in">
              <div className="faq-question">
                <h3>Como funciona a entrega?</h3>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>As entregas são realizadas na escola em dias específicos que serão combinados por WhatsApp após a confirmação do pagamento.</p>
              </div>
            </div>
            
            <div className="faq-item animate-in" style={{ animationDelay: '0.1s' }}>
              <div className="faq-question">
                <h3>Posso retirar na escola?</h3>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Sim! Oferecemos retirada na escola em horários combinados previamente. É necessário agendar pelo WhatsApp.</p>
              </div>
            </div>
            
            <div className="faq-item animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="faq-question">
                <h3>Qual o prazo de entrega?</h3>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Geralmente de 3 a 7 dias úteis após a confirmação do pagamento. Produtos especiais podem ter prazos diferentes.</p>
              </div>
            </div>
            
            <div className="faq-item animate-in" style={{ animationDelay: '0.3s' }}>
              <div className="faq-question">
                <h3>Posso trocar o tamanho?</h3>
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-answer">
                <p>Sim, desde que a troca seja solicitada em até 3 dias após o recebimento e o produto esteja em perfeito estado.</p>
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

        .info-icon.email {
          background: linear-gradient(135deg, var(--color-yellow), #FFB347);
          color: var(--color-dark);
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
        }

        .info-note {
          font-size: 0.75rem;
          color: #999;
          margin: 0;
          font-style: italic;
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

        .payment-note {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: rgba(255, 193, 7, 0.1);
          border-radius: var(--radius-md);
          border-left: 4px solid #FFC107;
        }

        .note-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .payment-note p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .contact-form-container {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--color-gray);
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

        .success-message {
          text-align: center;
          padding: var(--space-2xl) var(--space-xl);
        }

        .success-icon {
          color: var(--color-green);
          margin-bottom: var(--space-lg);
          animation: scaleIn 0.6s var(--ease-bounce);
        }

        .success-title {
          font-size: 1.75rem;
          color: var(--color-green);
          margin-bottom: var(--space-sm);
          font-weight: 700;
        }

        .success-text {
          color: #666;
          font-size: 1rem;
          max-width: 400px;
          margin: 0 auto var(--space-lg);
          line-height: 1.6;
        }

        .success-decoration {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: var(--space-xl);
        }

        .success-dot {
          width: 8px;
          height: 8px;
          background: var(--color-green);
          border-radius: 50%;
          opacity: 0.5;
          animation: var(--pulse-animation);
        }

        .success-dot:nth-child(2) { animation-delay: 0.2s; }
        .success-dot:nth-child(3) { animation-delay: 0.4s; }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label-text {
          font-weight: 600;
          color: var(--color-dark);
          font-size: 0.95rem;
        }

        .label-required::after {
          content: '*';
          color: var(--color-red);
          margin-left: 0.25rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--color-gray);
          border-radius: var(--radius-md);
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          transition: all var(--transition-normal);
          background: var(--color-light-gray);
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-yellow);
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.1);
          background: var(--color-white);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .textarea-note {
          font-size: 0.75rem;
          color: #666;
          background: var(--color-light-gray);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          margin-top: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }

        @media (min-width: 768px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }

        .submit-btn {
          position: relative;
          overflow: hidden;
          background: var(--gradient-primary);
          color: var(--color-dark);
          border: none;
          padding: 1rem 2rem;
          border-radius: var(--radius-lg);
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all var(--transition-normal);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-yellow);
          animation: var(--glow-animation);
        }

        .btn-effect {
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

        .submit-btn:hover .btn-effect {
          width: 300px;
          height: 300px;
        }

        .form-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          font-size: 0.875rem;
          color: #666;
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
        }
      `}</style>
    </section>
  );
};

export default Contact;