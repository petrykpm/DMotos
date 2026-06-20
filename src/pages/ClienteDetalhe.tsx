import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Bike, FileText, Pencil, Trash2, X, Save, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { clienteService, motoService, ordemService, vinculoService } from '@/services/api';
import { toast } from 'sonner';

function DeleteModal({ title, descricao, os, onClose, onConfirm, loading }: {
  title: string; descricao: string; os: any[]; onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{descricao}</p>
          </div>
        </div>

        {os.length > 0 && (
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {os.map((o: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-secondary rounded-lg">
                <p className="text-xs font-bold text-primary font-mono">{o.numero}</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  o.status === 'finalizada' ? 'bg-success/15 text-success' :
                  o.status === 'aberta' ? 'bg-info/15 text-info' : 'bg-warning/15 text-warning'
                }`}>{o.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}

        {os.length > 0 && (
          <p className="text-xs text-muted-foreground mb-4 p-3 bg-destructive/5 border border-destructive/15 rounded-lg">
            Todas as ordens de serviço vinculadas também serão excluídas permanentemente.
          </p>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-11 bg-secondary text-foreground font-medium rounded-xl active:scale-[0.97] transition-transform">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-11 bg-destructive text-white font-bold rounded-xl active:scale-[0.97] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [editEndereco, setEditEndereco] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit moto modal
  const [editMoto, setEditMoto] = useState<any>(null);
  const [motoMarca, setMotoMarca] = useState('');
  const [motoModelo, setMotoModelo] = useState('');
  const [motoAno, setMotoAno] = useState('');
  const [motoCor, setMotoCor] = useState('');
  const [motoPlaca, setMotoPlaca] = useState('');
  const [motoKm, setMotoKm] = useState('');
  const [motoObs, setMotoObs] = useState('');

  // Delete modals
  const [deleteClienteModal, setDeleteClienteModal] = useState<{ os: any[] } | null>(null);
  const [deleteMotoModal, setDeleteMotoModal] = useState<{ moto: any; os: any[] } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      const [c, m, o] = await Promise.all([
        clienteService.buscar(id),
        motoService.listarPorCliente(id),
        ordemService.listarPorCliente(id),
      ]);
      setCliente(c); setMotos(m); setOrdens(o);
      setLoading(false);
    } catch (err: any) {
      setError('Cliente não encontrado'); setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const openEditCliente = () => {
    setEditNome(cliente.nome); setEditTel(cliente.telefone);
    setEditEmail(cliente.email || ''); setEditObs(cliente.observacoes || ''); setEditEndereco(cliente.endereco || '');
    setEditOpen(true);
  };

  const handleSaveCliente = async () => {
    if (!editNome.trim() || !editTel.trim()) { toast.error('Nome e telefone obrigatórios'); return; }
    setSaving(true);
    try {
      const updated = await clienteService.atualizar(id!, { nome: editNome.trim(), telefone: editTel.trim(), email: editEmail.trim() || null, endereco: editEndereco.trim() || null, observacoes: editObs.trim() || null });
      setCliente(updated); setEditOpen(false); toast.success('Cliente atualizado!');
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDeleteClienteClick = async () => {
    const os = await vinculoService.osDeCliente(id!);
    setDeleteClienteModal({ os });
  };

  const handleDeleteClienteConfirm = async () => {
    setDeleting(true);
    try {
      if (deleteClienteModal!.os.length > 0) {
        await vinculoService.deletarClienteForce(id!);
      } else {
        await clienteService.deletar(id!);
      }
      toast.success('Cliente excluído!');
      navigate('/clientes');
    } catch (err: any) { toast.error(err.message || 'Erro ao excluir'); }
    finally { setDeleting(false); setDeleteClienteModal(null); }
  };

  const openEditMoto = (m: any) => {
    setEditMoto(m); setMotoMarca(m.marca); setMotoModelo(m.modelo);
    setMotoAno(m.ano?.toString() || ''); setMotoCor(m.cor || ''); setMotoPlaca(m.placa || ''); setMotoKm(m.km?.toString() || ''); setMotoObs(m.observacoes || '');
  };

  const handleSaveMoto = async () => {
    if (!motoMarca.trim() || !motoModelo.trim()) { toast.error('Marca e modelo obrigatórios'); return; }
    setSaving(true);
    try {
      await motoService.atualizar(editMoto.id, { marca: motoMarca.trim(), modelo: motoModelo.trim(), ano: motoAno ? parseInt(motoAno) : null, cor: motoCor.trim() || null, placa: motoPlaca.trim().toUpperCase() || null, km: motoKm ? parseInt(motoKm) : null, observacoes: motoObs.trim() || null });
      setEditMoto(null); toast.success('Moto atualizada!'); loadData();
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDeleteMotoClick = async (m: any) => {
    const os = await vinculoService.osDeMoto(m.id);
    setDeleteMotoModal({ moto: m, os });
  };

  const handleDeleteMotoConfirm = async () => {
    if (!deleteMotoModal) return;
    setDeleting(true);
    try {
      if (deleteMotoModal.os.length > 0) {
        await vinculoService.deletarMotoForce(deleteMotoModal.moto.id);
      } else {
        await motoService.deletar(deleteMotoModal.moto.id);
      }
      toast.success('Moto excluída!'); setDeleteMotoModal(null); loadData();
    } catch (err: any) { toast.error(err.message || 'Erro ao excluir'); }
    finally { setDeleting(false); }
  };

  if (loading) return <LoadingState />;
  if (error || !cliente) return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
      </div>
      <EmptyState title="Erro" description={error || 'Cliente não encontrado'} />
    </div>
  );

  const inputClass = "w-full h-11 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex-1">Detalhes do Cliente</h1>
        <button onClick={openEditCliente} className="p-2 rounded-lg bg-primary/10 text-primary"><Pencil size={16} /></button>
        <button onClick={handleDeleteClienteClick} className="p-2 rounded-lg bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
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
          {cliente.endereco && <div className="flex items-center gap-2 text-sm text-foreground"><span className="text-primary text-xs">📍</span><span>{cliente.endereco}</span></div>}
          {cliente.observacoes && <p className="text-xs text-muted-foreground mt-2 italic">{cliente.observacoes}</p>}
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
              <div key={m.id} onClick={() => navigate(`/motos/${m.id}`)} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border cursor-pointer active:scale-[0.98] transition-transform">
                <Bike size={18} className="text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.marca} {m.modelo} {m.ano || ''}</p>
                  <p className="text-xs text-muted-foreground">{m.placa || '-'} • {m.cor || '-'}{m.km ? ` • ${m.km.toLocaleString('pt-BR')} km` : ''}</p>
                </div>
                <button onClick={() => openEditMoto(m)} className="p-1.5 text-muted-foreground"><Pencil size={14} /></button>
                <button onClick={() => handleDeleteMotoClick(m)} className="p-1.5 text-destructive"><Trash2 size={14} /></button>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Cliente</h2>
              <button onClick={() => setEditOpen(false)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label><input value={editNome} onChange={e => setEditNome(e.target.value)} className={inputClass} /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Telefone *</label><input value={editTel} onChange={e => setEditTel(e.target.value)} type="tel" className={inputClass} /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label><input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" className={inputClass} /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Endereço</label><input value={editEndereco} onChange={e => setEditEndereco(e.target.value)} className={inputClass} /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Observações</label><textarea value={editObs} onChange={e => setEditObs(e.target.value)} rows={2} className="w-full px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" /></div>
              <button onClick={handleSaveCliente} disabled={saving} className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Moto */}
      {editMoto && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Moto</h2>
              <button onClick={() => setEditMoto(null)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Marca *</label><input value={motoMarca} onChange={e => setMotoMarca(e.target.value)} className={inputClass} /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Modelo *</label><input value={motoModelo} onChange={e => setMotoModelo(e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Ano</label><input value={motoAno} onChange={e => setMotoAno(e.target.value)} type="number" className={inputClass} /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cor</label><input value={motoCor} onChange={e => setMotoCor(e.target.value)} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Placa</label><input value={motoPlaca} onChange={e => setMotoPlaca(e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">KM Atual</label><input value={motoKm} onChange={e => setMotoKm(e.target.value)} type="number" min="0" className={inputClass} /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Observações</label><textarea value={motoObs} onChange={e => setMotoObs(e.target.value)} rows={2} className="w-full px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" /></div>
              <button onClick={handleSaveMoto} disabled={saving} className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Cliente */}
      {deleteClienteModal && (
        <DeleteModal
          title="Excluir cliente?"
          descricao={deleteClienteModal.os.length > 0
            ? `${cliente.nome} possui ${deleteClienteModal.os.length} ordem(ns) de serviço vinculada(s):`
            : `Tem certeza que deseja excluir ${cliente.nome}? Todas as motos também serão removidas.`}
          os={deleteClienteModal.os}
          onClose={() => setDeleteClienteModal(null)}
          onConfirm={handleDeleteClienteConfirm}
          loading={deleting}
        />
      )}

      {/* Modal Delete Moto */}
      {deleteMotoModal && (
        <DeleteModal
          title="Excluir moto?"
          descricao={deleteMotoModal.os.length > 0
            ? `${deleteMotoModal.moto.marca} ${deleteMotoModal.moto.modelo} possui ${deleteMotoModal.os.length} ordem(ns) de serviço vinculada(s):`
            : `Excluir ${deleteMotoModal.moto.marca} ${deleteMotoModal.moto.modelo}?`}
          os={deleteMotoModal.os}
          onClose={() => setDeleteMotoModal(null)}
          onConfirm={handleDeleteMotoConfirm}
          loading={deleting}
        />
      )}
    </div>
  );
}
