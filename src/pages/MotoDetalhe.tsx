import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bike, User, FileText, PlusCircle, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { motoService, ordemService, vinculoService } from '@/services/api';
import { toast } from 'sonner';

export default function MotoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [moto, setMoto] = useState<any>(null);
  const [ordens, setOrdens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [placa, setPlaca] = useState('');
  const [km, setKm] = useState('');
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteModal, setDeleteModal] = useState<{ os: any[] } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const [m, o] = await Promise.all([motoService.buscar(id), ordemService.listarPorMoto(id)]);
      setMoto(m); setOrdens(o); setLoading(false);
    } catch { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const openEdit = () => {
    setMarca(moto.marca); setModelo(moto.modelo); setAno(moto.ano?.toString() || '');
    setCor(moto.cor || ''); setPlaca(moto.placa || ''); setKm(moto.km?.toString() || ''); setObs(moto.observacoes || '');
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!marca.trim() || !modelo.trim()) { toast.error('Marca e modelo obrigatórios'); return; }
    setSaving(true);
    try {
      await motoService.atualizar(id!, { marca: marca.trim(), modelo: modelo.trim(), ano: ano ? parseInt(ano) : null, cor: cor.trim() || null, placa: placa.trim().toUpperCase() || null, km: km ? parseInt(km) : null, observacoes: obs.trim() || null });
      toast.success('Moto atualizada!'); setEditOpen(false); loadData();
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDeleteClick = async () => {
    try {
      const os = await vinculoService.osDeMoto(id!);
      setDeleteModal({ os });
    } catch (err: any) {
      toast.error('Erro ao verificar vínculos da moto');
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      if (deleteModal!.os.length > 0) await vinculoService.deletarMotoForce(id!);
      else await motoService.deletar(id!);
      toast.success('Moto excluída!');
      navigate(-1);
    } catch (err: any) { toast.error(err.message || 'Erro ao excluir'); }
    finally { setDeleting(false); setDeleteModal(null); }
  };

  if (loading) return <LoadingState />;
  if (!moto) return <div className="p-4 text-muted-foreground">Moto não encontrada</div>;

  const inputClass = "w-full h-11 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
  const totalOS = ordens.length;
  const finalizadas = ordens.filter(o => o.status === 'finalizada').length;
  const faturamento = ordens.filter(o => o.status === 'finalizada').reduce((t, o) => t + Number(o.valor_total || 0), 0);

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex-1">Detalhes da Moto</h1>
        <button onClick={openEdit} className="p-2 rounded-lg bg-primary/10 text-primary"><Pencil size={16} /></button>
        <button onClick={handleDeleteClick} className="p-2 rounded-lg bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
      </div>

      {/* Card moto */}
      <div className="mx-4 bg-card border border-border rounded-2xl p-4 shadow-card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bike size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{moto.marca} {moto.modelo}</h2>
            <p className="text-xs text-muted-foreground">{moto.ano || 'Ano não informado'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {moto.placa && <div className="bg-secondary rounded-lg px-3 py-2"><p className="text-[10px] text-muted-foreground">Placa</p><p className="font-bold text-foreground">{moto.placa}</p></div>}
          {moto.cor && <div className="bg-secondary rounded-lg px-3 py-2"><p className="text-[10px] text-muted-foreground">Cor</p><p className="font-bold text-foreground">{moto.cor}</p></div>}
          {moto.km && <div className="bg-secondary rounded-lg px-3 py-2"><p className="text-[10px] text-muted-foreground">KM</p><p className="font-bold text-foreground">{Number(moto.km).toLocaleString('pt-BR')}</p></div>}
          {moto.clientes?.nome && (
            <button onClick={() => navigate(`/clientes/${moto.cliente_id}`)} className="bg-primary/10 rounded-lg px-3 py-2 text-left active:scale-95 transition-transform">
              <p className="text-[10px] text-primary">Proprietário</p>
              <p className="font-bold text-primary text-xs truncate">{moto.clientes.nome}</p>
            </button>
          )}
        </div>
        {moto.observacoes && <p className="text-xs text-muted-foreground mt-3 italic border-t border-border pt-3">{moto.observacoes}</p>}
      </div>

      {/* Stats */}
      <div className="mx-4 grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
          <p className="text-xl font-bold text-foreground">{totalOS}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Total OS</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
          <p className="text-xl font-bold text-success">{finalizadas}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Finalizadas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
          <p className="text-sm font-bold text-primary">R${faturamento.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Faturado</p>
        </div>
      </div>

      {/* Histórico de OS */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Histórico de OS</p>
          <button onClick={() => navigate(`/ordens/nova`)} className="flex items-center gap-1 text-xs text-primary font-medium">
            <PlusCircle size={13} /> Nova OS
          </button>
        </div>
        {ordens.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={28} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma OS para esta moto</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ordens.map(o => (
              <button key={o.id} onClick={() => navigate(`/ordens/${o.id}`)}
                className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border active:scale-[0.98] transition-transform text-left shadow-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary font-mono">{o.numero}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{o.problema_relatado}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className="text-sm font-bold text-foreground ml-2">R$ {Number(o.valor_total || 0).toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Editar */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Moto</h2>
              <button onClick={() => setEditOpen(false)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Marca *</label><input value={marca} onChange={e => setMarca(e.target.value)} className={inputClass} /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Modelo *</label><input value={modelo} onChange={e => setModelo(e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Ano</label><input value={ano} onChange={e => setAno(e.target.value)} type="number" className={inputClass} /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cor</label><input value={cor} onChange={e => setCor(e.target.value)} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Placa</label><input value={placa} onChange={e => setPlaca(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">KM</label><input value={km} onChange={e => setKm(e.target.value)} type="number" className={inputClass} /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Observações</label><textarea value={obs} onChange={e => setObs(e.target.value)} rows={2} className="w-full px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" /></div>
              <button onClick={handleSave} disabled={saving} className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-5 animate-fade-in">
            <h2 className="text-base font-bold text-foreground mb-2">Excluir moto?</h2>
            {deleteModal.os.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-3">{moto.marca} {moto.modelo} possui {deleteModal.os.length} OS vinculada(s). Todas serão excluídas.</p>
                <div className="space-y-1.5 mb-4 max-h-32 overflow-y-auto">
                  {deleteModal.os.map((o, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                      <span className="text-xs font-bold text-primary font-mono">{o.numero}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">Esta ação não pode ser desfeita.</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 h-11 bg-secondary text-foreground font-medium rounded-xl">Cancelar</button>
              <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 h-11 bg-destructive text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}{deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
