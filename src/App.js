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
import Toast from './components/Toast/Toast'; // Importar o componente Toast

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
          
          // Mostra notificação via evento
          const event = new CustomEvent('showToast', {
            detail: {
              type: 'success',
              message: '🎉 App instalado com sucesso! Agora você pode usar offline.',
              duration: 5000
            }
          });
          window.dispatchEvent(event);
        } else {
          console.log('❌ Usuário recusou instalar o PWA');
          const event = new CustomEvent('showToast', {
            detail: {
              type: 'info',
              message: 'Você pode instalar o app a qualquer momento clicando no botão de instalação.',
              duration: 3000
            }
          });
          window.dispatchEvent(event);
        }
        
        // Limpa o prompt
        setDeferredPrompt(null);
      });
    } else {
      // Fallback: Instruções manuais via toast
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'info',
          message: '📱 Para instalar: No Chrome, clique nos 3 pontos (⋮) → "Instalar Terceirão 2026". No Safari, clique em compartilhar (□↑) → "Adicionar à tela inicial".',
          duration: 8000
        }
      });
      window.dispatchEvent(event);
    }
  };

  // ===== 3. VERIFICAR ATUALIZAÇÕES DO SERVICE WORKER =====
  useEffect(() => {
    // Verificar se há atualização pendente no localStorage
    const updatePending = localStorage.getItem('appUpdatePending');
    if (updatePending === 'true') {
      setUpdateAvailable(true);
      
      // Notificar usuário sobre atualização pendente
      setTimeout(() => {
        const event = new CustomEvent('showToast', {
          detail: {
            type: 'info',
            message: '📦 Nova atualização disponível! Clique para atualizar.',
            duration: 6000
          }
        });
        window.dispatchEvent(event);
      }, 2000);
    }

    const setupServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          // Registrar service worker
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('✅ Service Worker registrado com sucesso:', registration);
          
          // Aguarda o service worker estar pronto
          await navigator.serviceWorker.ready;
          
          // Verificar se há um service worker esperando
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
            localStorage.setItem('appUpdatePending', 'true');
            
            // Notificar sobre atualização
            const event = new CustomEvent('showToast', {
              detail: {
                type: 'info',
                message: '🔄 Nova versão disponível! Clique para atualizar.',
                duration: 5000
              }
            });
            window.dispatchEvent(event);
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
                        const event = new CustomEvent('showToast', {
                          detail: {
                            type: 'info',
                            message: '🎉 Nova atualização disponível! Atualize para ter as melhores funcionalidades.',
                            duration: 5000
                          }
                        });
                        window.dispatchEvent(event);
                      }
                    }, 5000);
                  } else {
                    // Primeira instalação - app instalado com sucesso
                    console.log('✅ App instalado pela primeira vez');
                    const event = new CustomEvent('showToast', {
                      detail: {
                        type: 'success',
                        message: '🎉 App pronto para uso offline!',
                        duration: 3000
                      }
                    });
                    window.dispatchEvent(event);
                  }
                }
              });
            }
          };
          
          registration.addEventListener('updatefound', onUpdateFound);
          
          // Verificar atualizações periodicamente (a cada 2 horas)
          const updateInterval = setInterval(() => {
            registration.update().then(() => {
              console.log('🔄 Verificação de atualização do Service Worker');
            });
          }, 2 * 60 * 60 * 1000);
          
          return () => {
            registration.removeEventListener('updatefound', onUpdateFound);
            clearInterval(updateInterval);
          };
          
        } catch (error) {
          console.error('❌ Erro no Service Worker:', error);
          const event = new CustomEvent('showToast', {
            detail: {
              type: 'error',
              message: '⚠️ Erro ao carregar recursos offline. Verifique sua conexão.',
              duration: 3000
            }
          });
          window.dispatchEvent(event);
        }
      }
    };

    const cleanup = setupServiceWorker();

    // Ouvir mudanças de controller (quando um novo service worker assume)
    const onControllerChange = () => {
      console.log('🔄 Controller do Service Worker mudou - recarregando página...');
      localStorage.removeItem('appUpdatePending');
      
      // Notificar usuário sobre atualização aplicada
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: '✅ Atualização aplicada com sucesso!',
          duration: 3000
        }
      });
      window.dispatchEvent(event);
      
      // Recarregar após 1 segundo para dar tempo da mensagem aparecer
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }

    // Verificar atualizações quando a janela ganha foco (usuário voltou ao app)
    const onFocus = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.update().then(() => {
            console.log('🔍 Verificação de atualização ao ganhar foco');
          });
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
      console.log('🔄 Aplicando atualização...');
      
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
    
    const event = new CustomEvent('showToast', {
      detail: {
        type: 'info',
        message: '⚠️ Atualização adiada. Você pode atualizar a qualquer momento.',
        duration: 3000
      }
    });
    window.dispatchEvent(event);
  };

  // ===== 5. VERIFICAR CONEXÃO =====
  useEffect(() => {
    const handleOnline = () => {
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: '✅ Conexão restaurada!',
          duration: 2000
        }
      });
      window.dispatchEvent(event);
    };

    const handleOffline = () => {
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'warning',
          message: '⚠️ Você está offline. Algumas funcionalidades podem estar limitadas.',
          duration: 4000
        }
      });
      window.dispatchEvent(event);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <CartProvider>
      <Router>
        <div className="App">
          {/* Componente de Toast para notificações */}
          <Toast />
          
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
                <small>Funciona offline! 🎯</small>
              </button>
              <button 
                onClick={() => {
                  setShowInstallButton(false);
                  const event = new CustomEvent('showToast', {
                    detail: {
                      type: 'info',
                      message: 'Você pode instalar o app a qualquer momento usando o menu do navegador.',
                      duration: 3000
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="install-close"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Toaster para notificações (fallback) */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#10b981',
                  border: '1px solid #059669',
                },
                icon: '✅',
              },
              error: {
                style: {
                  background: '#ef4444',
                  border: '1px solid #dc2626',
                },
                icon: '❌',
              },
              warning: {
                style: {
                  background: '#f59e0b',
                  color: '#000',
                  border: '1px solid #d97706',
                },
                icon: '⚠️',
              },
              info: {
                style: {
                  background: '#3b82f6',
                  border: '1px solid #2563eb',
                },
                icon: 'ℹ️',
              },
            }}
          />
          
          {/* Estilos para o prompt de instalação */}
          <style jsx>{`
            .install-prompt {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 16px 20px;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
              z-index: 9999;
              display: flex;
              align-items: center;
              gap: 12px;
              animation: slideIn 0.5s ease-out;
              max-width: 320px;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            .install-button {
              background: white;
              color: #667eea;
              border: none;
              padding: 10px 16px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              flex: 1;
            }
            
            .install-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .install-button small {
              font-size: 11px;
              opacity: 0.8;
              font-weight: 500;
            }
            
            .install-close {
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: none;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 18px;
              transition: all 0.3s ease;
            }
            
            .install-close:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: rotate(90deg);
            }
            
            @media (max-width: 768px) {
              .install-prompt {
                bottom: 70px;
                left: 20px;
                right: 20px;
                max-width: none;
              }
              
              .install-button {
                font-size: 14px;
                padding: 12px 16px;
              }
            }
            
            @media (max-width: 480px) {
              .install-prompt {
                flex-direction: column;
                gap: 10px;
                text-align: center;
              }
              
              .install-button {
                width: 100%;
              }
              
              .install-close {
                position: absolute;
                top: 10px;
                right: 10px;
              }
            }
          `}</style>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;