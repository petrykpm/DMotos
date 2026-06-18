import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motoService, clienteService } from '@/services/api';
import { toast } from 'sonner';
import { OfflineGuard } from '@/components/shared/OfflineGuard';

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
  const [km, setKm] = useState('');
  const [observacoes, setObservacoes] = useState('');
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
        km: km ? parseInt(km) : undefined,
        observacoes: observacoes.trim() || undefined,
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

  const inputClass = "w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "text-xs font-medium text-muted-foreground mb-1.5 block";

  return (
    <OfflineGuard action="cadastrar uma moto">
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Nova Moto</h1>
      </div>
      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        <div>
          <label className={labelClass}>Cliente *</label>
          <select value={clienteId} onChange={e => setClienteId(e.target.value)}
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="">Selecione um cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Marca *</label>
          <input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ex: Honda" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Modelo *</label>
          <input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: CG 160 Titan" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Ano</label>
            <input value={ano} onChange={e => setAno(e.target.value)} placeholder="2024" type="number" min="1900" max="2099" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cor</label>
            <input value={cor} onChange={e => setCor(e.target.value)} placeholder="Preta" className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Placa</label>
            <input value={placa} onChange={e => setPlaca(e.target.value)} placeholder="ABC-1234" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>KM Atual</label>
            <input value={km} onChange={e => setKm(e.target.value)} placeholder="Ex: 15000" type="number" min="0" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Observações</label>
          <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações sobre a moto..." rows={3}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Salvando...' : 'Cadastrar Moto'}
        </button>
      </form>
    </div>
    </OfflineGuard>
  );
}