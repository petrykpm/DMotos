import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, Phone, Users } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { LoadingState } from '@/components/shared/LoadingState';
import { clienteService, ordemService } from '@/services/api';

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [error, setError] = useState('');
  const [ordemCount, setOrdemCount] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([clienteService.listar(), ordemService.listar()])
      .then(([c, o]) => {
        setClientes(c);
        const counts: Record<string, number> = {};
        o.forEach((os: any) => { counts[os.cliente_id] = (counts[os.cliente_id] || 0) + 1; });
        setOrdemCount(counts);
        setLoading(false);
      })
      .catch(err => { console.error(err); setError('Erro ao carregar clientes'); setLoading(false); });
  }, []);

  const filtered = busca
    ? clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.telefone.includes(busca))
    : clientes;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Clientes</h1>
        <button onClick={() => navigate('/clientes/novo')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary rounded-lg text-primary-foreground text-xs font-bold active:scale-95 transition-transform">
          <UserPlus size={15} /> Novo
        </button>
      </div>

      <div className="px-4 mb-4">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome ou telefone..." />
      </div>

      {loading ? <LoadingState /> : error ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users size={36} className="mb-3 opacity-25" />
          <p className="text-sm font-medium">{busca ? 'Nenhum resultado' : 'Nenhum cliente cadastrado'}</p>
          {!busca && (
            <button onClick={() => navigate('/clientes/novo')} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className="px-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-1">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(c => (
            <button key={c.id} onClick={() => navigate(`/clientes/${c.id}`)}
              className="w-full flex items-center gap-3 p-3.5 bg-card rounded-xl border border-border active:scale-[0.98] transition-transform text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {c.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.nome}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone size={10} />
                    <span>{c.telefone}</span>
                  </div>
                  {ordemCount[c.id] > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                      {ordemCount[c.id]} OS
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
