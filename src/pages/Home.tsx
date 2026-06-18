import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Bike, UserPlus, PlusCircle, ArrowDownToLine, AlertTriangle, ChevronRight } from 'lucide-react';
import { LogoHeader } from '@/components/shared/LogoHeader';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { QuickActionButton } from '@/components/shared/QuickActionButton';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { dashboardService } from '@/services/api';
import type { DashboardHome } from '@/types';

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardHome | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.obter()
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error('Erro ao carregar dashboard:', err); setLoading(false); });
  }, []);

  if (loading || !data) return <LoadingState />;

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <LogoHeader size="sm" />
      </div>
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <SummaryCard icon={<Users size={18} className="text-primary" />} label="Clientes" value={data.totalClientes} onClick={() => navigate('/clientes')} />
        <SummaryCard icon={<Package size={18} className="text-primary" />} label="Estoque" value={data.totalItensEstoque} onClick={() => navigate('/estoque')} />
        <SummaryCard icon={<Bike size={18} className="text-primary" />} label="Na Oficina" value={data.totalMotosNaOficina} variant="primary" />
      </div>
      <div className="px-4 mb-6">
        <SectionTitle title="Ações Rápidas" />
        <div className="grid grid-cols-4 gap-2">
          <QuickActionButton icon={<UserPlus size={20} />} label="Novo Cliente" onClick={() => navigate('/clientes/novo')} />
          <QuickActionButton icon={<Bike size={20} />} label="Nova Moto" onClick={() => navigate('/motos/nova')} />
          <QuickActionButton icon={<PlusCircle size={20} />} label="Nova OS" onClick={() => navigate('/ordens/nova')} />
          <QuickActionButton icon={<ArrowDownToLine size={20} />} label="Entrada Estoque" onClick={() => navigate('/estoque/entrada')} />
        </div>
      </div>
      {data.itensComEstoqueBaixo.length > 0 && (
        <div className="px-4 mb-6">
          <SectionTitle title="Estoque Baixo" action={{ label: 'Ver tudo', onClick: () => navigate('/estoque') }} />
          <div className="space-y-2">
            {data.itensComEstoqueBaixo.map(item => (
              <div key={item.pecaId} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border shadow-card">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${item.status === 'critico' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'}`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.pecaNome}</p>
                    <p className="text-xs text-muted-foreground">{item.quantidade} un. (mín: {item.estoqueMinimo})</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="px-4 mb-6">
        <SectionTitle title="Ordens Recentes" action={{ label: 'Ver todas', onClick: () => navigate('/ordens') }} />
        {data.ordensRecentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ordem ainda</p>
        ) : (
          <div className="space-y-2">
            {data.ordensRecentes.map(ordem => (
              <button key={ordem.id} onClick={() => navigate(`/ordens/${ordem.id}`)}
                className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border shadow-card active:scale-[0.98] transition-transform text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-primary font-mono">{ordem.numero}</span>
                    <StatusBadge status={ordem.status} />
                  </div>
                  <p className="text-sm text-foreground truncate">{ordem.clienteNome}</p>
                  <p className="text-xs text-muted-foreground truncate">{ordem.motoDescricao}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
