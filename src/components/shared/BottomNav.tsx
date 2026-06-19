import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Package, FileText, Settings, TrendingUp } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/estoque', icon: Package, label: 'Estoque' },
  { path: '/ordens', icon: FileText, label: 'OS' },
  { path: '/relatorio', icon: TrendingUp, label: 'Relatório' },
  { path: '/config', icon: Settings, label: 'Config' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom" style={{ background: 'hsl(0 0% 9%)', borderTop: '1px solid hsl(0 0% 15%)' }}>
      <div className="flex items-center justify-around max-w-lg mx-auto" style={{ height: '64px' }}>
        {tabs.map(tab => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 w-full h-full relative transition-all"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <tab.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
