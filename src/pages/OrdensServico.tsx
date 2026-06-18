import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ChevronRight } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { ordemService } from '@/services/api';

const statusTabs = [
  { key: 'todas', label: 'Todas' },
  { key: 'aberta', label: 'Abertas' },
  { key: 'em_andamento', label: 'Andamento' },
  { key: 'finalizada', label: 'Finalizadas' },
];

export default function OrdensServico() {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');

  useEffect(() => {
    ordemService.listar()
      .then(o => { setOrdens(o); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = ordens.filter(o => {
    const matchBusca = !busca || (o.clienteNome || '').toLowerCase().includes(busca.toLowerCase()) || o.numero.toLowerCase().includes(busca.toLowerCase()) || (o.motoDescricao || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFilter === 'todas' || o.status === statusFilter;
    return matchBusca && matchStatus;
  });

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Ordens de Serviço</h1>
        <button onClick={() => navigate('/ordens/nova')} className="p-2.5 bg-primary rounded-lg text-primary-foreground active:scale-95 transition-transform">
          <PlusCircle size={18} />
        </button>
      </div>
      <div className="px-4 mb-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar OS, cliente, moto..." />
      </div>
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-none">
        {statusTabs.map(t => (
          <button key={t.key} onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground border border-border'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title="Nenhuma ordem encontrada" description="Crie uma nova ordem de serviço" />
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map(o => (
            <button key={o.id} onClick={() => navigate(`/ordens/${o.id}`)}
              className="w-full p-4 bg-card rounded-lg border border-border shadow-card text-left active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold font-mono text-primary">{o.numero}</span>
                <StatusBadge status={o.status} size="md" />
              </div>
              <p className="text-sm font-medium text-foreground mb-0.5">{o.clienteNome}</p>
              <p className="text-xs text-muted-foreground mb-2">{o.motoDescricao}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm font-bold text-foreground">R$ {Number(o.valor_total).toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
