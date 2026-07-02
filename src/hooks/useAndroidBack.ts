import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Rotas raiz — sair do app ao pressionar voltar nelas
const ROOT_ROUTES = ['/', '/clientes', '/estoque', '/ordens', '/busca', '/config', '/relatorio', '/motos'];

export function useAndroidBack() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('backButton', ({ canGoBack }) => {
          const isRoot = ROOT_ROUTES.includes(location.pathname);
          if (isRoot) {
            // Nas telas raiz, minimiza o app em vez de sair
            App.minimizeApp();
          } else if (canGoBack) {
            navigate(-1);
          } else {
            navigate(-1);
          }
        });
        cleanup = () => listener.remove();
      } catch {
        // Não é Android ou Capacitor não disponível — ignora
      }
    };

    setup();
    return () => { cleanup?.(); };
  }, [location.pathname]);
}
