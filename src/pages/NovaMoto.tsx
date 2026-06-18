import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motoService, clienteService } from '@/services/api';
import { toast } from 'sonner';

export default function NovaMoto() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clienteIdParam = searchParams.get('clienteId');
  const [clienteId, setClienteId] = useState(clienteIdParam || '');
  const [clientes, setClientes] = useState<any[]>([]);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clienteService.listar().then(setClientes).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimMarca = marca.trim();
    const trimModelo = modelo.trim();
    if (!trimMarca || !trimModelo) { toast.error('Marca e modelo são obrigatórios'); return; }
    if (!clienteId) { toast.error('Selecione um cliente'); return; }

    setSaving(true);
    try {
      await motoService.criar({
        cliente_id: clienteId,
        marca: trimMarca,
        modelo: trimModelo,
        ano: ano ? parseInt(ano) : undefined,
        cor: cor.trim() || undefined,
        placa: placa.trim().toUpperCase() || undefined,
      });
      toast.success('Moto cadastrada!');
      navigate(-1);
    } catch (err: any) {
      console.error('Erro ao cadastrar moto:', err);
      toast.error(err.message || 'Erro ao cadastrar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Nova Moto</h1>
      </div>
      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cliente *</label>
          <select value={clienteId} onChange={e => setClienteId(e.target.value)}
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="">Selecione um cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Marca *</label>
          <input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex: Honda"
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Modelo *</label>
          <input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: CG 160 Titan"
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ano</label>
            <input value={ano} onChange={e => setAno(e.target.value)} placeholder="2024" type="number" min="1900" max="2099"
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cor</label>
            <input value={cor} onChange={e => setCor(e.target.value)} placeholder="Preta"
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Placa</label>
          <input value={placa} onChange={e => setPlaca(e.target.value)} placeholder="ABC-1234"
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Salvando...' : 'Cadastrar Moto'}
        </button>
      </form>
    </div>
  );
}
