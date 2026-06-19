import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Bike, FileText, X, Loader2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { clienteService, motoService, ordemService } from '@/services/api';

type Resultado = { tipo: 'cliente' | 'moto' | 'os'; id: string; titulo: string; sub: string; extra?: string; path: string; status?: string };

export default function Busca() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [pesquisado, setPesquisado] = useState(false);

  const pesquisar = async (termo: string) => {
    if (termo.trim().length < 2) { setResultados([]); setPesquisado(false); return; }
    setLoading(true);
    try {
      const [clientes, motos, ordens] = await Promise.all([
        clienteService.listar(),
        motoService.listar(),
        ordemService.listar(),
      ]);

      const t = termo.toLowerCase();
      const res: Resultado[] = [];

      clientes.filter((c: any) =>
        c.nome.toLowerCase().includes(t) ||
        (c.telefone || '').includes(t) ||
        (c.email || '').toLowerCase().includes(t)
      ).forEach((c: any) => res.push({
        tipo: 'cliente', id: c.id, titulo: c.nome, sub: c.telefone || '', path: `/clientes/${c.id}`
      }));

      motos.filter((m: any) =>
        m.marca.toLowerCase().includes(t) ||
        m.modelo.toLowerCase().includes(t) ||
        (m.placa || '').toLowerCase().includes(t) ||
        (m.cor || '').toLowerCase().includes(t)
      ).forEach((m: any) => res.push({
        tipo: 'moto', id: m.id, titulo: `${m.marca} ${m.modelo}`, sub: [m.placa, m.cor, m.ano].filter(Boolean).join(' • '), path: `/motos/${m.id}`
      }));

      ordens.filter((o: any) =>
        o.numero.toLowerCase().includes(t) ||
        (o.clienteNome || '').toLowerCase().includes(t) ||
        (o.motoDescricao || '').toLowerCase().includes(t) ||
        (o.problema_relatado || '').toLowerCase().includes(t)
      ).forEach((o: any) => res.push({
        tipo: 'os', id: o.id, titulo: o.numero, sub: o.clienteNome, extra: o.motoDescricao, status: o.status, path: `/ordens/${o.id}`
      }));

      setResultados(res);
      setPesquisado(true);
    } catch { setResultados([]); }
    finally { setLoading(false); }
  };

  const handleChange = (v: string) => {
    setBusca(v);
    pesquisar(v);
  };

  const icones = { cliente: <Users size={16} className="text-primary" />, moto: <Bike size={16} className="text-primary" />, os: <FileText size={16} className="text-primary" /> };
  const labels = { cliente: 'Cliente', moto: 'Moto', os: 'OS' };

  const clientes = resultados.filter(r => r.tipo === 'cliente');
  const motos = resultados.filter(r => r.tipo === 'moto');
  const os = resultados.filter(r => r.tipo === 'os');

  const Grupo = ({ titulo, items }: { titulo: string; items: Resultado[] }) => items.length === 0 ? null : (
    <div className="mb-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">{titulo} ({items.length})</p>
      <div className="space-y-1.5 px-4">
        {items.map(r => (
          <button key={r.id} onClick={() => navigate(r.path)}
            className="w-full flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl active:scale-[0.98] transition-transform text-left shadow-card">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {icones[r.tipo]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{r.titulo}</p>
                {r.status && <StatusBadge status={r.status} />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
              {r.extra && <p className="text-xs text-muted-foreground truncate">{r.extra}</p>}
            </div>
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full flex-shrink-0">{labels[r.tipo]}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-display text-xl font-bold text-foreground mb-4">Busca</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busca} onChange={e => handleChange(e.target.value)}
            placeholder="Cliente, moto, placa, OS..."
            autoFocus
            className="w-full h-12 pl-10 pr-10 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          {busca && (
            <button onClick={() => { setBusca(''); setResultados([]); setPesquisado(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        )}

        {!loading && pesquisado && resultados.length === 0 && (
          <div className="text-center py-12">
            <Search size={32} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum resultado para "{busca}"</p>
          </div>
        )}

        {!loading && !pesquisado && (
          <div className="text-center py-12 px-6">
            <Search size={32} className="text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Digite ao menos 2 caracteres para buscar em clientes, motos e ordens de serviço</p>
          </div>
        )}

        {!loading && resultados.length > 0 && (
          <>
            <Grupo titulo="Clientes" items={clientes} />
            <Grupo titulo="Motos" items={motos} />
            <Grupo titulo="Ordens de Serviço" items={os} />
          </>
        )}
      </div>
    </div>
  );
}
