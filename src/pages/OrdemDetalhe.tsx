import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bike, Package, Pencil, Trash2, X, Save, FileDown, Loader2 } from 'lucide-react';
import { gerarPdfOS } from '@/lib/gerarPdfOS';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { ordemService } from '@/services/api';
import { toast } from 'sonner';

export default function OrdemDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ordem, setOrdem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [eProblema, setEProblema] = useState('');
  const [eServico, setEServico] = useState('');
  const [eMaoObra, setEMaoObra] = useState('');
  const [saving, setSaving] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const loadData = () => {
    if (!id) return;
    ordemService.buscar(id)
      .then(o => { setOrdem(o); setLoading(false); })
      .catch(err => { console.error(err); setError('Ordem não encontrada'); setLoading(false); });
  };

  useEffect(() => { loadData(); }, [id]);

  const handleStatusChange = async (novoStatus: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      const updated = await ordemService.atualizarStatus(id, novoStatus);
      setOrdem((prev: any) => ({ ...prev, status: updated.status, finalizado_em: updated.finalizado_em }));
      toast.success(`Status atualizado para ${novoStatus.replace('_', ' ')}`);
    } catch (err: any) { toast.error(err.message || 'Erro ao atualizar status'); }
    finally { setUpdating(false); }
  };

  const openEdit = () => {
    setEProblema(ordem.problema_relatado || '');
    setEServico(ordem.descricao_servico || '');
    setEMaoObra(String(ordem.valor_mao_obra || 0));
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!eProblema.trim()) { toast.error('Problema é obrigatório'); return; }
    setSaving(true);
    try {
      const valorMaoObra = parseFloat(eMaoObra) || 0;
      const valorPecas = (ordem.itens || []).reduce((t: number, i: any) => t + Number(i.subtotal || 0), 0);
      await ordemService.atualizar(id!, {
        problema_relatado: eProblema.trim(),
        descricao_servico: eServico.trim() || null,
        valor_mao_obra: valorMaoObra,
        valor_total: valorPecas + valorMaoObra,
      });
      toast.success('OS atualizada!'); setEditOpen(false); loadData();
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handlePdf = async () => {
    setGerandoPdf(true);
    try { await gerarPdfOS(ordem); }
    catch (err) { console.error('Erro ao gerar PDF:', err); }
    finally { setGerandoPdf(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Excluir esta ordem de serviço? Esta ação não pode ser desfeita.')) return;
    try { await ordemService.deletar(id!); toast.success('OS excluída!'); navigate('/ordens'); }
    catch (err: any) { toast.error(err.message || 'Erro ao excluir'); }
  };

  if (loading) return <LoadingState />;
  if (error || !ordem) return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
      </div>
      <EmptyState title="Erro" description={error || 'Ordem não encontrada'} />
    </div>
  );

  const statusActions: Record<string, { label: string; next: string }[]> = {
    aberta: [{ label: 'Iniciar Serviço', next: 'em_andamento' }],
    em_andamento: [{ label: 'Finalizar', next: 'finalizada' }, { label: 'Cancelar', next: 'cancelada' }],
  };

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground">{ordem.numero}</h1>
        </div>
        <StatusBadge status={ordem.status} size="md" />
        <button onClick={handlePdf} disabled={gerandoPdf}
          className="p-2 rounded-lg bg-secondary text-muted-foreground disabled:opacity-50">
          {gerandoPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        </button>
        {(ordem.status !== 'finalizada') && (
          <>
            <button onClick={openEdit} className="p-2 rounded-lg bg-primary/10 text-primary"><Pencil size={16} /></button>
            <button onClick={handleDelete} className="p-2 rounded-lg bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
          </>
        )}
      </div>

      <div className="mx-4 p-4 bg-card rounded-lg border border-border shadow-card mb-3">
        <div className="flex items-center gap-2 mb-2"><User size={14} className="text-primary" /><span className="text-sm font-medium text-foreground">{ordem.clienteNome}</span></div>
        <div className="flex items-center gap-2"><Bike size={14} className="text-primary" /><span className="text-sm text-foreground">{ordem.motoDescricao}</span></div>
      </div>

      <div className="mx-4 p-4 bg-card rounded-lg border border-border shadow-card mb-3">
        <SectionTitle title="Problema Relatado" />
        <p className="text-sm text-foreground">{ordem.problema_relatado}</p>
      </div>

      {ordem.descricao_servico && (
        <div className="mx-4 p-4 bg-card rounded-lg border border-border shadow-card mb-3">
          <SectionTitle title="Serviço" />
          <p className="text-sm text-foreground">{ordem.descricao_servico}</p>
        </div>
      )}

      {ordem.itens?.length > 0 && (
        <div className="mx-4 p-4 bg-card rounded-lg border border-border shadow-card mb-3">
          <SectionTitle title="Peças Utilizadas" />
          <div className="space-y-2">
            {ordem.itens.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Package size={14} className="text-muted-foreground" /><span className="text-sm text-foreground">{item.pecaNome}</span><span className="text-xs text-muted-foreground">x{item.quantidade}</span></div>
                <span className="text-sm font-medium text-foreground">R$ {Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Number(ordem.valor_mao_obra) > 0 && (
        <div className="mx-4 p-3 bg-card rounded-lg border border-border mb-1">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mão de Obra</span><span className="font-medium text-foreground">R$ {Number(ordem.valor_mao_obra).toFixed(2)}</span></div>
        </div>
      )}

      <div className="mx-4 p-4 bg-primary/10 border border-primary/30 rounded-lg mb-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">R$ {Number(ordem.valor_total).toFixed(2)}</span>
        </div>
      </div>

      <div className="mx-4 flex gap-4 text-xs text-muted-foreground mb-4">
        <span>Criada: {new Date(ordem.created_at).toLocaleDateString('pt-BR')}</span>
        {ordem.finalizado_em && <span>Finalizada: {new Date(ordem.finalizado_em).toLocaleDateString('pt-BR')}</span>}
      </div>

      {statusActions[ordem.status] && (
        <div className="mx-4 space-y-2">
          {statusActions[ordem.status].map(action => (
            <button key={action.next} onClick={() => handleStatusChange(action.next)} disabled={updating}
              className={`w-full h-12 font-bold rounded-lg active:scale-[0.97] transition-transform disabled:opacity-50 flex items-center justify-center ${action.next === 'cancelada' ? 'bg-destructive/10 border border-destructive/30 text-destructive' : 'bg-gradient-red text-primary-foreground shadow-red'}`}>
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Modal Editar OS */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar OS</h2>
              <button onClick={() => setEditOpen(false)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Problema Relatado *</label><textarea value={eProblema} onChange={e => setEProblema(e.target.value)} rows={3} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição do Serviço</label><textarea value={eServico} onChange={e => setEServico(e.target.value)} rows={3} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Mão de Obra (R$)</label><input value={eMaoObra} onChange={e => setEMaoObra(e.target.value)} type="number" step="0.01" min="0" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <button onClick={handleSave} disabled={saving} className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-lg active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
