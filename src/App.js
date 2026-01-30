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
    let registration = null;
    
    const setupServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          // Aguarda o service worker estar pronto
          registration = await navigator.serviceWorker.ready;
          
          // Verificar se há um service worker esperando
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
          }

          // Ouvir quando um novo service worker estiver instalado
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  // Verifica se já tem um controller (não é a primeira instalação)
                  if (navigator.serviceWorker.controller) {
                    setWaitingWorker(newWorker);
                    setUpdateAvailable(true);
                  }
                }
              });
            }
          });
          
        } catch (error) {
          console.error('Erro ao configurar Service Worker:', error);
        }
      }
    };

    setupServiceWorker();

    // Ouvir mudanças de controller (quando um novo service worker assume)
    const onControllerChange = () => {
      window.location.reload();
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }

    // Limpar event listeners
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
    };
  }, []);

  // Função para atualizar o app
  const handleUpdate = () => {
    if (waitingWorker) {
      // Envia mensagem para pular a espera
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      
      // Não recarrega imediatamente - o event listener de controllerchange vai cuidar disso
    }
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
              onDismiss={() => setUpdateAvailable(false)}
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
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;