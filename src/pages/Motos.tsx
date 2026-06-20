import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bike, ChevronRight, Search } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { motoService } from '@/services/api';

export default function Motos() {
  const navigate = useNavigate();
  const [motos, setMotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    motoService.listar()
      .then(m => { setMotos(m); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = motos.filter(m =>
    !busca ||
    m.marca.toLowerCase().includes(busca.toLowerCase()) ||
    m.modelo.toLowerCase().includes(busca.toLowerCase()) ||
    (m.placa || '').toLowerCase().includes(busca.toLowerCase()) ||
    (m.clienteNome || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Motos</h1>
        <button onClick={() => navigate('/motos/nova')}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-red text-white text-xs font-bold rounded-lg shadow-red active:scale-95 transition-transform">
          <Plus size={14} /> Nova Moto
        </button>
      </div>

      <div className="px-4 mb-4 relative">
        <Search size={15} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por marca, modelo, placa..."
          className="w-full h-11 pl-9 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-3">
            <Bike size={24} className="text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Nenhuma moto encontrada</p>
          <p className="text-xs text-muted-foreground mb-4">Cadastre motos pelos clientes</p>
          <button onClick={() => navigate('/motos/nova')} className="px-4 py-2 bg-gradient-red text-white text-sm font-bold rounded-xl shadow-red">
            Cadastrar Moto
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {filtered.map(m => (
            <button key={m.id} onClick={() => navigate(`/motos/${m.id}`)}
              className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl text-left active:scale-[0.98] transition-transform shadow-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bike size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{m.marca} {m.modelo}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[m.ano, m.placa, m.cor].filter(Boolean).join(' • ')}
                </p>
                {m.clienteNome && (
                  <p className="text-xs text-primary truncate mt-0.5">{m.clienteNome}</p>
                )}
              </div>
              <ChevronRight size={15} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
