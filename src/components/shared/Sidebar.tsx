import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Package, FileText, Settings, Wrench } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo-dm-motos.png';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/clientes', icon: Users, label: 'Clientes' },
  { path: '/estoque', icon: Package, label: 'Estoque' },
  { path: '/ordens', icon: FileText, label: 'Ordens de Serviço' },
  { path: '/config', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { profile } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-card border-r border-border fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border flex items-center gap-3">
        <img src={logo} alt="DM Motos" className="h-8 w-auto object-contain" />
        <div>
          <p className="font-display text-base font-bold text-foreground tracking-wider leading-tight">DM MOTOS</p>
          <p className="text-[10px] text-muted-foreground">Sistema de Gestão</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(tab => {
          const isActive = tab.path === '/' ? pathname === '/' : pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <tab.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Perfil no rodapé */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => navigate('/config')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {profile?.nome?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{profile?.nome || 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{profile?.email || ''}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
