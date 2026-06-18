import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Bike, FileText, Pencil, Trash2, X, Save, Plus } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { clienteService, motoService, ordemService } from '@/services/api';
import { toast } from 'sonner';

export default function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<any>(null);
  const [motos, setMotos] = useState<any[]>([]);
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit cliente modal
  const [editOpen, setEditOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTel, setEditTel] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editObs, setEditObs] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit moto modal
  const [editMoto, setEditMoto] = useState<any>(null);
  const [motoMarca, setMotoMarca] = useState('');
  const [motoModelo, setMotoModelo] = useState('');
  const [motoAno, setMotoAno] = useState('');
  const [motoCor, setMotoCor] = useState('');
  const [motoPlaca, setMotoPlaca] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      const [c, m, o] = await Promise.all([
        clienteService.buscar(id),
        motoService.listarPorCliente(id),
        ordemService.listar(),
      ]);
      setCliente(c); setMotos(m); setOrdens(o.filter((os: any) => os.cliente_id === id));
      setLoading(false);
    } catch (err: any) {
      setError('Cliente não encontrado'); setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const openEditCliente = () => {
    setEditNome(cliente.nome); setEditTel(cliente.telefone);
    setEditEmail(cliente.email || ''); setEditObs(cliente.observacoes || '');
    setEditOpen(true);
  };

  const handleSaveCliente = async () => {
    if (!editNome.trim() || !editTel.trim()) { toast.error('Nome e telefone obrigatórios'); return; }
    setSaving(true);
    try {
      const updated = await clienteService.atualizar(id!, { nome: editNome.trim(), telefone: editTel.trim(), email: editEmail.trim() || null, observacoes: editObs.trim() || null });
      setCliente(updated); setEditOpen(false); toast.success('Cliente atualizado!');
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDeleteCliente = async () => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Todas as motos vinculadas também serão excluídas.')) return;
    try {
      await clienteService.deletar(id!);
      toast.success('Cliente excluído!'); navigate('/clientes');
    } catch (err: any) { toast.error(err.message || 'Erro ao excluir. Verifique se não há OS vinculada.'); }
  };

  const openEditMoto = (m: any) => {
    setEditMoto(m); setMotoMarca(m.marca); setMotoModelo(m.modelo);
    setMotoAno(m.ano?.toString() || ''); setMotoCor(m.cor || ''); setMotoPlaca(m.placa || '');
  };

  const handleSaveMoto = async () => {
    if (!motoMarca.trim() || !motoModelo.trim()) { toast.error('Marca e modelo obrigatórios'); return; }
    setSaving(true);
    try {
      await motoService.atualizar(editMoto.id, { marca: motoMarca.trim(), modelo: motoModelo.trim(), ano: motoAno ? parseInt(motoAno) : null, cor: motoCor.trim() || null, placa: motoPlaca.trim().toUpperCase() || null });
      setEditMoto(null); toast.success('Moto atualizada!'); loadData();
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDeleteMoto = async (motoId: string) => {
    if (!confirm('Excluir esta moto?')) return;
    try { await motoService.deletar(motoId); toast.success('Moto excluída!'); loadData(); }
    catch (err: any) { toast.error(err.message || 'Erro ao excluir. Verifique se não há OS vinculada.'); }
  };

  if (loading) return <LoadingState />;
  if (error || !cliente) return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
      </div>
      <EmptyState title="Erro" description={error || 'Cliente não encontrado'} />
    </div>
  );

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex-1">Detalhes do Cliente</h1>
        <button onClick={openEditCliente} className="p-2 rounded-lg bg-primary/10 text-primary"><Pencil size={16} /></button>
        <button onClick={handleDeleteCliente} className="p-2 rounded-lg bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
      </div>

      <div className="mx-4 p-4 bg-card rounded-lg border border-border shadow-card mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{cliente.nome.charAt(0)}</div>
          <div>
            <h2 className="text-base font-bold text-foreground">{cliente.nome}</h2>
            <p className="text-xs text-muted-foreground">Cliente desde {new Date(cliente.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground"><Phone size={14} className="text-primary" /><span>{cliente.telefone}</span></div>
          {cliente.email && <div className="flex items-center gap-2 text-sm text-foreground"><Mail size={14} className="text-primary" /><span>{cliente.email}</span></div>}
          {cliente.observacoes && <p className="text-xs text-muted-foreground mt-2">{cliente.observacoes}</p>}
        </div>
      </div>

      {/* Motos */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <SectionTitle title="Motos" />
          <button onClick={() => navigate(`/motos/nova?clienteId=${id}`)} className="p-1.5 rounded-lg bg-primary/10 text-primary"><Plus size={16} /></button>
        </div>
        {motos.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma moto cadastrada</p> : (
          <div className="space-y-2">
            {motos.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                <Bike size={18} className="text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.marca} {m.modelo} {m.ano || ''}</p>
                  <p className="text-xs text-muted-foreground">{m.placa || '-'} • {m.cor || '-'}</p>
                </div>
                <button onClick={() => openEditMoto(m)} className="p-1.5 text-muted-foreground"><Pencil size={14} /></button>
                <button onClick={() => handleDeleteMoto(m.id)} className="p-1.5 text-destructive"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ordens */}
      <div className="px-4">
        <SectionTitle title="Ordens de Serviço" />
        {ordens.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma ordem registrada</p> : (
          <div className="space-y-2">
            {ordens.map((o: any) => (
              <button key={o.id} onClick={() => navigate(`/ordens/${o.id}`)} className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border text-left active:scale-[0.98] transition-transform">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-primary" />
                    <span className="text-sm font-bold font-mono text-primary">{o.numero}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">{o.motoDescricao}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar Cliente */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Cliente</h2>
              <button onClick={() => setEditOpen(false)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label><input value={editNome} onChange={e => setEditNome(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Telefone *</label><input value={editTel} onChange={e => setEditTel(e.target.value)} type="tel" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label><input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Observações</label><textarea value={editObs} onChange={e => setEditObs(e.target.value)} rows={2} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" /></div>
              <button onClick={handleSaveCliente} disabled={saving} className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-lg active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Moto */}
      {editMoto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Moto</h2>
              <button onClick={() => setEditMoto(null)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Marca *</label><input value={motoMarca} onChange={e => setMotoMarca(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Modelo *</label><input value={motoModelo} onChange={e => setMotoModelo(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Ano</label><input value={motoAno} onChange={e => setMotoAno(e.target.value)} type="number" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cor</label><input value={motoCor} onChange={e => setMotoCor(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Placa</label><input value={motoPlaca} onChange={e => setMotoPlaca(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <button onClick={handleSaveMoto} disabled={saving} className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-lg active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
