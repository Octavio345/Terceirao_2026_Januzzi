// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rola suavemente para o topo
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // 'smooth' para animação, 'auto' para instantâneo
    });
    
    // Ou use esta opção mais simples:
    // window.scrollTo(0, 0);
    
    console.log(`📜 Rolando para o topo ao mudar para: ${pathname}`);
  }, [pathname]);

  return null;
};

export default ScrollToTop;