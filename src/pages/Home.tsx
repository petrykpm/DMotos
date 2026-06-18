import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Bike, UserPlus, PlusCircle, ArrowDownToLine, AlertTriangle, ChevronRight, Wrench } from 'lucide-react';
import { LogoHeader } from '@/components/shared/LogoHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { dashboardService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { DashboardHome } from '@/types';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.obter()
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error('Erro ao carregar dashboard:', err); setLoading(false); });
  }, []);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiroNome = profile?.nome?.split(' ')[0] || '';

  if (loading || !data) return <LoadingState />;

  return (
    <div className="pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{saudacao}{primeiroNome ? `, ${primeiroNome}` : ''}</p>
          <LogoHeader size="sm" showName />
        </div>
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
          {primeiroNome?.charAt(0) || 'A'}
        </div>
      </div>

      {/* Cards resumo */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <button onClick={() => navigate('/clientes')}
          className="bg-card border border-border rounded-2xl p-3.5 text-left active:scale-95 transition-transform shadow-card">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center mb-2.5">
            <Users size={16} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground leading-none">{data.totalClientes}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Clientes</p>
        </button>

        <button onClick={() => navigate('/estoque')}
          className="bg-card border border-border rounded-2xl p-3.5 text-left active:scale-95 transition-transform shadow-card">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center mb-2.5">
            <Package size={16} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground leading-none">{data.totalItensEstoque}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Peças</p>
        </button>

        <button onClick={() => navigate('/ordens')}
          className="bg-gradient-red rounded-2xl p-3.5 text-left active:scale-95 transition-transform shadow-red">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mb-2.5">
            <Wrench size={16} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-white leading-none">{data.totalMotosNaOficina}</p>
          <p className="text-[10px] text-white/70 mt-1">Na Oficina</p>
        </button>
      </div>

      {/* Ações rápidas */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ações Rápidas</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <UserPlus size={18} />, label: 'Cliente', path: '/clientes/novo' },
            { icon: <Bike size={18} />, label: 'Moto', path: '/motos/nova' },
            { icon: <PlusCircle size={18} />, label: 'Nova OS', path: '/ordens/nova' },
            { icon: <ArrowDownToLine size={18} />, label: 'Entrada', path: '/estoque/entrada' },
          ].map(a => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className="flex flex-col items-center gap-2 p-3 bg-card border border-border rounded-2xl active:scale-95 transition-transform shadow-card">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {a.icon}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alertas estoque */}
      {data.itensComEstoqueBaixo.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estoque Baixo</p>
            <button onClick={() => navigate('/estoque')} className="text-xs text-primary font-medium">Ver tudo</button>
          </div>
          <div className="space-y-2">
            {data.itensComEstoqueBaixo.slice(0, 3).map(item => (
              <div key={item.pecaId} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.status === 'critico' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'}`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.pecaNome}</p>
                    <p className="text-xs text-muted-foreground">{item.quantidade} un. restantes</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ordens recentes */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordens Recentes</p>
          <button onClick={() => navigate('/ordens')} className="text-xs text-primary font-medium">Ver todas</button>
        </div>
        {data.ordensRecentes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-3">
              <Wrench size={24} className="opacity-30" />
            </div>
            <p className="text-sm">Nenhuma ordem ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.ordensRecentes.slice(0, 5).map(ordem => (
              <button key={ordem.id} onClick={() => navigate(`/ordens/${ordem.id}`)}
                className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border active:scale-[0.98] transition-transform text-left shadow-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary font-mono tracking-wider">{ordem.numero}</span>
                    <StatusBadge status={ordem.status} />
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{ordem.clienteNome}</p>
                  <p className="text-xs text-muted-foreground truncate">{ordem.motoDescricao}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <span className="text-sm font-bold text-foreground">R$ {Number(ordem.valor_total).toFixed(2)}</span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
