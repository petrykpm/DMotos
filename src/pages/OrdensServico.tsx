import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ChevronRight, Wrench, Calendar } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ordemService } from '@/services/api';

const statusTabs = [
  { key: 'todas', label: 'Todas' },
  { key: 'aberta', label: 'Abertas' },
  { key: 'em_andamento', label: 'Em Andamento' },
  { key: 'finalizada', label: 'Finalizadas' },
];

export default function OrdensServico() {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [periodoFilter, setPeriodoFilter] = useState('todos');

  useEffect(() => {
    ordemService.listar()
      .then(o => { setOrdens(o); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filtered = ordens.filter(o => {
    const matchBusca = !busca || (o.clienteNome || '').toLowerCase().includes(busca.toLowerCase()) || o.numero.toLowerCase().includes(busca.toLowerCase()) || (o.motoDescricao || '').toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFilter === 'todas' || o.status === statusFilter;
    let matchPeriodo = true;
    if (periodoFilter !== 'todos') {
      const now = new Date();
      const created = new Date(o.created_at);
      if (periodoFilter === 'hoje') {
        matchPeriodo = created.toDateString() === now.toDateString();
      } else if (periodoFilter === '7d') {
        matchPeriodo = (now.getTime() - created.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      } else if (periodoFilter === '30d') {
        matchPeriodo = (now.getTime() - created.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      }
    }
    return matchBusca && matchStatus && matchPeriodo;
  });

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Ordens de Serviço</h1>
        <button onClick={() => navigate('/ordens/nova')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary rounded-lg text-primary-foreground text-xs font-bold active:scale-95 transition-transform">
          <PlusCircle size={15} /> Nova OS
        </button>
      </div>

      <div className="px-4 mb-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar OS, cliente, moto..." />
      </div>

      <div className="px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {statusTabs.map(t => (
          <button key={t.key} onClick={() => setStatusFilter(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 mb-3 flex items-center gap-2">
        <Calendar size={13} className="text-muted-foreground flex-shrink-0" />
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {[{ k: 'todos', l: 'Qualquer data' }, { k: 'hoje', l: 'Hoje' }, { k: '7d', l: 'Últimos 7 dias' }, { k: '30d', l: 'Últimos 30 dias' }].map(f => (
            <button key={f.k} onClick={() => setPeriodoFilter(f.k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${periodoFilter === f.k ? 'bg-card border border-primary text-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Wrench size={36} className="mb-3 opacity-25" />
          <p className="text-sm font-medium">Nenhuma ordem encontrada</p>
          <button onClick={() => navigate('/ordens/nova')} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
            Criar Nova OS
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {filtered.map(o => (
            <button key={o.id} onClick={() => navigate(`/ordens/${o.id}`)}
              className="w-full p-4 bg-card rounded-xl border border-border text-left active:scale-[0.98] transition-transform">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-bold font-mono text-primary tracking-wider">{o.numero}</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{o.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">{o.motoDescricao}</p>
                </div>
                <StatusBadge status={o.status} size="md" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-2">
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-foreground">R$ {Number(o.valor_total).toFixed(2)}</p>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
