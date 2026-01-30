import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import './styles/variables.css';
import './styles/globals.css';

// Importar componentes
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Hero from './components/Hero/Hero';
import Products from './components/Products/Products';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import PaymentInfo from './components/PaymentInfo/PaymentInfo';
import Cart from './components/Cart/Cart';
import Payment from './components/Payment/Payment';
import UpdateNotification from './components/UpdateNotification/UpdateNotification';

function HomePage() {
  return (
    <>
      <Hero />
      <Products />
      <PaymentInfo />
    </>
  );
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  // Verificar atualizações do Service Worker
  useEffect(() => {
    // Verificar se há atualização pendente no localStorage
    const updatePending = localStorage.getItem('appUpdatePending');
    if (updatePending === 'true') {
      setUpdateAvailable(true);
    }

    const setupServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          // Aguarda o service worker estar pronto
          const registration = await navigator.serviceWorker.ready;
          
          // Verificar se há um service worker esperando
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
            localStorage.setItem('appUpdatePending', 'true');
          }

          // Ouvir quando um novo service worker estiver instalado
          const onUpdateFound = () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  // Verifica se já tem um controller (não é a primeira instalação)
                  if (navigator.serviceWorker.controller) {
                    setWaitingWorker(newWorker);
                    setUpdateAvailable(true);
                    localStorage.setItem('appUpdatePending', 'true');
                    
                    // Mostrar notificação após 3 segundos
                    setTimeout(() => {
                      if (!updateAvailable) {
                        setUpdateAvailable(true);
                      }
                    }, 3000);
                  }
                }
              });
            }
          };
          
          registration.addEventListener('updatefound', onUpdateFound);
          
          // Verificar atualizações periodicamente (a cada 2 horas)
          const updateInterval = setInterval(() => {
            registration.update();
          }, 2 * 60 * 60 * 1000);
          
          return () => {
            registration.removeEventListener('updatefound', onUpdateFound);
            clearInterval(updateInterval);
          };
          
        } catch (error) {
          console.error('Erro no Service Worker:', error);
        }
      }
    };

    const cleanup = setupServiceWorker();

    // Ouvir mudanças de controller (quando um novo service worker assume)
    const onControllerChange = () => {
      localStorage.removeItem('appUpdatePending');
      window.location.reload();
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }

    // Verificar atualizações quando a janela ganha foco (usuário voltou ao app)
    const onFocus = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update();
        });
      }
    };
    
    window.addEventListener('focus', onFocus);

    // Limpar event listeners
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
      window.removeEventListener('focus', onFocus);
      if (cleanup) cleanup.then(fn => fn && fn());
    };
  }, [updateAvailable]);

  // Função para atualizar o app
  const handleUpdate = () => {
    if (waitingWorker) {
      // Envia mensagem para pular a espera
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      localStorage.removeItem('appUpdatePending');
      
      // O event listener de controllerchange vai recarregar automaticamente
    }
  };

  // Função para adiar a atualização
  const handleDismiss = () => {
    setUpdateAvailable(false);
    // Mantém no localStorage para mostrar depois
    localStorage.setItem('appUpdatePending', 'true');
  };

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Header />
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Cart Modal - renderizado fora das rotas */}
          <Cart />
          <Payment />
          
          {/* Notificação de atualização */}
          {updateAvailable && (
            <UpdateNotification 
              onUpdate={handleUpdate}
              onDismiss={handleDismiss}
            />
          )}
          
          {/* Toaster para notificações */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          
          {/* Versão do app (opcional, para debug) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'fixed',
              bottom: 10,
              left: 10,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              zIndex: 1000
            }}>
              v{process.env.REACT_APP_VERSION || '1.0.0'}
            </div>
          )}
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;