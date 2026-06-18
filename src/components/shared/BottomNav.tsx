import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Package, FileText, Settings } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/estoque', icon: Package, label: 'Estoque' },
  { path: '/ordens', icon: FileText, label: 'OS' },
  { path: '/config', icon: Settings, label: 'Config' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(tab => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
