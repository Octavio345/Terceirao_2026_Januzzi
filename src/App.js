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
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // ===== 1. DETECTAR SE PODE INSTALAR PWA =====
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('🚀 beforeinstallprompt event fired');
      
      // Previne que o Chrome mostre o prompt automático
      e.preventDefault();
      
      // Guarda o evento para mostrar depois
      setDeferredPrompt(e);
      
      // Mostra nosso botão personalizado
      setShowInstallButton(true);
      
      // Esconde automaticamente após 10 segundos
      setTimeout(() => {
        if (showInstallButton) {
          setShowInstallButton(false);
        }
      }, 10000);
    };

    // Verificar se o app já está instalado
    const checkIfAppIsInstalled = () => {
      // Método 1: Verificar se está em modo standalone
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📱 App já está instalado (display-mode: standalone)');
        setIsAppInstalled(true);
        setShowInstallButton(false);
        return true;
      }
      
      // Método 2: Verificar navigator.standalone (iOS)
      if (window.navigator.standalone === true) {
        console.log('📱 App já está instalado (navigator.standalone)');
        setIsAppInstalled(true);
        setShowInstallButton(false);
        return true;
      }
      
      // Método 3: Verificar localStorage
      if (localStorage.getItem('appInstalled') === 'true') {
        console.log('📱 App marcado como instalado no localStorage');
        setIsAppInstalled(true);
      }
      
      return false;
    };

    // Adiciona event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Verifica ao carregar
    checkIfAppIsInstalled();
    
    // Verifica quando a visibilidade da página muda (usuário voltou ao app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkIfAppIsInstalled();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Limpar event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showInstallButton]);

  // ===== 2. FUNÇÃO PARA INSTALAR O PWA =====
  const handleInstallClick = () => {
    console.log('📲 Botão de instalação clicado');
    
    if (deferredPrompt) {
      // Mostra o prompt de instalação nativo
      deferredPrompt.prompt();
      
      // Aguarda a resposta do usuário
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Usuário aceitou instalar o PWA');
          setIsAppInstalled(true);
          setShowInstallButton(false);
          
          // Marca como instalado no localStorage
          localStorage.setItem('appInstalled', 'true');
          
          // Mostra mensagem de sucesso
          toast.success('App instalado com sucesso!');
        } else {
          console.log('❌ Usuário recusou instalar o PWA');
        }
        
        // Limpa o prompt
        setDeferredPrompt(null);
      });
    } else {
      // Fallback: Instruções manuais
      alert(
        'Para instalar o app:\n\n' +
        'Chrome Desktop: Clique nos 3 pontos (⋮) → "Instalar Terceirão 2026"\n' +
        'Chrome Mobile: Clique nos 3 pontos (⋮) → "Adicionar à tela inicial"\n' +
        'Safari: Clique no ícone de compartilhar (□↑) → "Adicionar à tela inicial"'
      );
    }
  };

  // ===== 3. VERIFICAR ATUALIZAÇÕES DO SERVICE WORKER =====
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
                    
                    // Mostrar notificação após 5 segundos
                    setTimeout(() => {
                      if (!updateAvailable) {
                        setUpdateAvailable(true);
                      }
                    }, 5000);
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

  // ===== 4. FUNÇÕES DE ATUALIZAÇÃO =====
  const handleUpdate = () => {
    if (waitingWorker) {
      // Envia mensagem para pular a espera
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      localStorage.removeItem('appUpdatePending');
      
      // O event listener de controllerchange vai recarregar automaticamente
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    // Mantém no localStorage para mostrar depois
    localStorage.setItem('appUpdatePending', 'true');
  };

  // ===== 5. FUNÇÃO TOAST PERSONALIZADA =====
  const toast = {
    success: (message) => {
      // Você pode usar react-hot-toast aqui ou um alert simples
      if (typeof window !== 'undefined') {
        alert(message); // Temporário - pode substituir por react-hot-toast
      }
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
          
          {/* Notificação de ATUALIZAÇÃO */}
          {updateAvailable && (
            <UpdateNotification 
              onUpdate={handleUpdate}
              onDismiss={handleDismiss}
            />
          )}
          
          {/* Botão de INSTALAÇÃO do PWA */}
          {showInstallButton && !isAppInstalled && (
            <div className="install-prompt">
              <button onClick={handleInstallClick} className="install-button">
                <span role="img" aria-label="download">📲</span>
                Instalar App Terceirão 2026
                <small>Funciona offline!</small>
              </button>
              <button 
                onClick={() => setShowInstallButton(false)}
                className="install-close"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
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
            <div className="version-debug">
              v{process.env.REACT_APP_VERSION || '1.0.0'}
              {isAppInstalled && ' (Instalado)'}
            </div>
          )}
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;