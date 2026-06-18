import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Bike, UserPlus, PlusCircle, ArrowDownToLine, AlertTriangle, ChevronRight, Wrench } from 'lucide-react';
import { LogoHeader } from '@/components/shared/LogoHeader';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { QuickActionButton } from '@/components/shared/QuickActionButton';
import { SectionTitle } from '@/components/shared/SectionTitle';
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
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{saudacao}{primeiroNome ? `, ${primeiroNome}` : ''}</p>
          <LogoHeader size="sm" showName />
        </div>
      </div>

      {/* Cards resumo */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <SummaryCard icon={<Users size={18} />} label="Clientes" value={data.totalClientes} onClick={() => navigate('/clientes')} />
        <SummaryCard icon={<Package size={18} />} label="Estoque" value={data.totalItensEstoque} onClick={() => navigate('/estoque')} />
        <SummaryCard icon={<Wrench size={18} />} label="Na Oficina" value={data.totalMotosNaOficina} variant="primary" />
      </div>

      {/* Ações rápidas */}
      <div className="px-4 mb-6">
        <SectionTitle title="Ações Rápidas" />
        <div className="grid grid-cols-4 gap-2">
          <QuickActionButton icon={<UserPlus size={20} />} label="Novo Cliente" onClick={() => navigate('/clientes/novo')} />
          <QuickActionButton icon={<Bike size={20} />} label="Nova Moto" onClick={() => navigate('/motos/nova')} />
          <QuickActionButton icon={<PlusCircle size={20} />} label="Nova OS" onClick={() => navigate('/ordens/nova')} />
          <QuickActionButton icon={<ArrowDownToLine size={20} />} label="Entrada" onClick={() => navigate('/estoque/entrada')} />
        </div>
      </div>

      {/* Alertas estoque */}
      {data.itensComEstoqueBaixo.length > 0 && (
        <div className="px-4 mb-6">
          <SectionTitle title="⚠️ Estoque Baixo" action={{ label: 'Ver tudo', onClick: () => navigate('/estoque') }} />
          <div className="space-y-2">
            {data.itensComEstoqueBaixo.slice(0, 3).map(item => (
              <div key={item.pecaId} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${item.status === 'critico' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'}`}>
                    <AlertTriangle size={15} />
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
        <SectionTitle title="Ordens Recentes" action={{ label: 'Ver todas', onClick: () => navigate('/ordens') }} />
        {data.ordensRecentes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma ordem ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.ordensRecentes.slice(0, 5).map(ordem => (
              <button key={ordem.id} onClick={() => navigate(`/ordens/${ordem.id}`)}
                className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border active:scale-[0.98] transition-transform text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary font-mono tracking-wider">{ordem.numero}</span>
                    <StatusBadge status={ordem.status} />
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{ordem.clienteNome}</p>
                  <p className="text-xs text-muted-foreground truncate">{ordem.motoDescricao}</p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-sm font-bold text-foreground">R$ {Number(ordem.valor_total).toFixed(2)}</span>
                  <ChevronRight size={15} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
