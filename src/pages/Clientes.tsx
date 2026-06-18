import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, Phone } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { clienteService } from '@/services/api';

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    clienteService.listar()
      .then(c => { setClientes(c); setLoading(false); })
      .catch(err => { console.error(err); setError('Erro ao carregar clientes'); setLoading(false); });
  }, []);

  const filtered = busca
    ? clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.telefone.includes(busca))
    : clientes;

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Clientes</h1>
        <button onClick={() => navigate('/clientes/novo')} className="p-2.5 bg-primary rounded-lg text-primary-foreground active:scale-95 transition-transform">
          <UserPlus size={18} />
        </button>
      </div>
      <div className="px-4 mb-4">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar cliente..." />
      </div>
      {loading ? <LoadingState /> : error ? (
        <EmptyState title="Erro" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum cliente" description={busca ? 'Nenhum resultado para a busca' : 'Cadastre seu primeiro cliente'} />
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map(c => (
            <button key={c.id} onClick={() => navigate(`/clientes/${c.id}`)}
              className="w-full flex items-center gap-3 p-3.5 bg-card rounded-lg border border-border shadow-card active:scale-[0.98] transition-transform text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {c.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.nome}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone size={10} />
                  <span>{c.telefone}</span>
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
