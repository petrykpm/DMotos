import { useState, useEffect } from 'react';
import { TrendingUp, FileText, Wrench, Package, ChevronRight, Calendar } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ordemService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const periodos = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: 'ano', label: 'Este ano' },
];

function StatCard({ label, value, sub, icon, vermelho = false }: { label: string; value: string; sub?: string; icon: React.ReactNode; vermelho?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border flex items-center gap-4 shadow-card ${vermelho ? 'bg-gradient-red border-primary/30' : 'bg-card border-border'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${vermelho ? 'bg-white/15' : 'bg-primary/10'}`}>
        <span className={vermelho ? 'text-white' : 'text-primary'}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${vermelho ? 'text-white' : 'text-foreground'}`}>{value}</p>
        <p className={`text-xs mt-1 ${vermelho ? 'text-white/70' : 'text-muted-foreground'}`}>{label}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${vermelho ? 'text-white/50' : 'text-muted-foreground'}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Relatorio() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('30d');
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordemService.listar()
      .then(o => { setOrdens(o); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtrar = (os: any[]) => {
    const now = new Date();
    return os.filter(o => {
      const d = new Date(o.created_at);
      if (periodo === '7d') return (now.getTime() - d.getTime()) <= 7 * 86400000;
      if (periodo === '30d') return (now.getTime() - d.getTime()) <= 30 * 86400000;
      if (periodo === '90d') return (now.getTime() - d.getTime()) <= 90 * 86400000;
      if (periodo === 'ano') return d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const filtered = filtrar(ordens);
  const finalizadas = filtered.filter(o => o.status === 'finalizada');
  const abertas = filtered.filter(o => o.status === 'aberta' || o.status === 'em_andamento');
  const canceladas = filtered.filter(o => o.status === 'cancelada');
  const faturamento = finalizadas.reduce((t, o) => t + Number(o.valor_total || 0), 0);
  const ticketMedio = finalizadas.length > 0 ? faturamento / finalizadas.length : 0;
  const emAberto = abertas.reduce((t, o) => t + Number(o.valor_total || 0), 0);

  if (loading) return <LoadingState />;

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold text-foreground">Relatório</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Visão financeira da oficina</p>
      </div>

      {/* Filtro período */}
      <div className="px-4 mb-5 flex items-center gap-2">
        <Calendar size={13} className="text-muted-foreground flex-shrink-0" />
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {periodos.map(p => (
            <button key={p.key} onClick={() => setPeriodo(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${periodo === p.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards principais */}
      <div className="px-4 space-y-3 mb-6">
        <StatCard label="Faturamento" value={`R$ ${faturamento.toFixed(2)}`} sub={`${finalizadas.length} OS finalizada(s)`} icon={<TrendingUp size={20} />} vermelho />
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Ticket Médio" value={`R$ ${ticketMedio.toFixed(0)}`} icon={<FileText size={18} />} />
          <StatCard label="Em Aberto" value={`R$ ${emAberto.toFixed(0)}`} sub={`${abertas.length} OS`} icon={<Wrench size={18} />} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-card">
            <p className="text-xl font-bold text-foreground">{filtered.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total OS</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-card">
            <p className="text-xl font-bold text-success">{finalizadas.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Finalizadas</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 text-center shadow-card">
            <p className="text-xl font-bold text-destructive">{canceladas.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Canceladas</p>
          </div>
        </div>
      </div>

      {/* OS do período */}
      <div className="px-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Ordens no período ({filtered.length})
        </p>
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Package size={32} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma OS neste período</p>
          </div>
        ) : (
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {filtered.map(o => (
              <button key={o.id} onClick={() => navigate(`/ordens/${o.id}`)}
                className="w-full flex items-center justify-between p-3.5 bg-card border border-border rounded-xl active:scale-[0.98] transition-transform text-left shadow-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary font-mono">{o.numero}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{o.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <span className={`text-sm font-bold ${o.status === 'finalizada' ? 'text-success' : 'text-foreground'}`}>
                    R$ {Number(o.valor_total || 0).toFixed(2)}
                  </span>
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
