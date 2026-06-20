import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, AlertTriangle, Loader2, Tag } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { pecaService, categoriaService } from '@/services/api';
import { toast } from 'sonner';

export default function Estoque() {
  const navigate = useNavigate();
  const [pecas, setPecas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Edit modal
  const [editPeca, setEditPeca] = useState<any>(null);
  const [eNome, setENome] = useState('');
  const [eModelo, setEModelo] = useState('');
  const [eCompat, setECompat] = useState('');
  const [eCategoria, setECategoria] = useState('');
  const [eQtd, setEQtd] = useState('');
  const [ePreco, setEPreco] = useState('');
  const [eEstMin, setEEstMin] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ peca: any; osVinculadas: any[] } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deletingForce, setDeletingForce] = useState(false);

  const loadData = () => {
    pecaService.listar()
      .then(p => { setPecas(p); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const openEdit = (p: any) => {
    setEditPeca(p); setENome(p.nome); setEModelo(p.modelo || '');
    setECompat(p.compatibilidade || ''); setECategoria(p.categoria || '');
    setEQtd(String(p.quantidade)); setEPreco(String(p.preco));
    setEEstMin(String(p.estoque_minimo || 5));
  };

  const handleSave = async () => {
    if (!eNome.trim()) { toast.error('Nome obrigatório'); return; }
    setSaving(true);
    try {
      await pecaService.atualizar(editPeca.id, {
        nome: eNome.trim(), modelo: eModelo.trim() || null,
        compatibilidade: eCompat.trim() || null, categoria: eCategoria.trim() || null,
        quantidade: parseInt(eQtd) || 0, preco: parseFloat(ePreco) || 0,
        estoque_minimo: parseInt(eEstMin) || 5,
      });
      toast.success('Peça atualizada!'); setEditPeca(null); loadData();
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleDeleteClick = async (peca: any) => {
    setLoadingDelete(true);
    try {
      const os = await pecaService.buscarOSVinculadas(peca.id);
      if (os.length === 0) {
        // Sem vínculos — abre modal de confirmação simples
        setDeleteModal({ peca, osVinculadas: [] });
      } else {
        // Tem vínculos — abre modal
        setDeleteModal({ peca, osVinculadas: os });
      }
    } catch (err: any) {
      toast.error('Erro ao verificar vínculos.');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleDeleteForce = async () => {
    if (!deleteModal) return;
    setDeletingForce(true);
    try {
      if (deleteModal.osVinculadas.length > 0) {
        await pecaService.deletarForce(deleteModal.peca.id);
        toast.success('Peça excluída e removida das ordens vinculadas.');
      } else {
        await pecaService.deletar(deleteModal.peca.id);
        toast.success('Peça excluída!');
      }
      setDeleteModal(null);
      loadData();
    categoriaService.listar()
      .then(cats => setCategorias(['Todas', ...cats.map((cat: any) => cat.nome)]))
      .catch(() => setCategorias(['Todas', 'Freio', 'Transmissão', 'Lubrificante', 'Filtro', 'Ignição', 'Pneu', 'Embreagem', 'Elétrica', 'Suspensão', 'Motor', 'Outros']));
    } catch (err: any) {
      toast.error('Erro ao excluir.');
    } finally {
      setDeletingForce(false);
    }
  };

  const filtered = pecas.filter(p => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.compatibilidade || '').toLowerCase().includes(busca.toLowerCase()) || (p.sku || '').toLowerCase().includes(busca.toLowerCase());
    const matchCat = categoria === 'Todas' || p.categoria === categoria;
    const matchStatus = statusFilter === 'todos' || p.statusEstoque === statusFilter;
    return matchBusca && matchCat && matchStatus;
  });

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between overflow-hidden">
        <h1 className="font-display text-xl font-bold text-foreground">Estoque</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/categorias')} className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground text-xs font-medium rounded-lg active:scale-95 transition-transform"><Tag size={14} /> Categorias</button>
          <button onClick={() => navigate('/estoque/entrada')} className="flex items-center gap-1.5 px-3 py-2 bg-primary rounded-lg text-primary-foreground text-xs font-bold active:scale-95 transition-transform"><Plus size={15} /> Nova Peça</button>
        </div>
      </div>
      <div className="px-4 mb-3"><SearchInput value={busca} onChange={setBusca} placeholder="Buscar peça, modelo, SKU..." /></div>
      <div className="px-4 mb-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 pb-1">
          {categorias.map(cat => (
            <button key={cat} onClick={() => setCategoria(cat)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${categoria === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground border border-border'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="px-4 mb-4 flex gap-2">
        {[{ k: 'todos', l: 'Todos' }, { k: 'normal', l: 'Normal' }, { k: 'baixo', l: 'Baixo' }, { k: 'critico', l: 'Crítico' }].map(f => (
          <button key={f.k} onClick={() => setStatusFilter(f.k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === f.k ? 'bg-card border-primary border text-foreground' : 'bg-secondary text-muted-foreground border border-border'}`}>{f.l}</button>
        ))}
      </div>
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title="Nenhuma peça encontrada" description="Ajuste os filtros ou cadastre uma nova peça" />
      ) : (
        <div className="px-4 space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="p-3.5 bg-card rounded-lg border border-border shadow-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{p.compatibilidade || '-'}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <StatusBadge status={p.statusEstoque} />
                  <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-primary"><Pencil size={14} /></button>
                  <button onClick={() => handleDeleteClick(p)} disabled={loadingDelete} className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-40"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div><p className="text-lg font-bold text-foreground">{p.quantidade}</p><p className="text-[10px] text-muted-foreground">em estoque</p></div>
                  <div><p className="text-lg font-bold text-primary">R$ {Number(p.preco).toFixed(2)}</p><p className="text-[10px] text-muted-foreground">preço</p></div>
                </div>
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">{p.categoria || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Editar Peça */}
      {editPeca && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Peça</h2>
              <button onClick={() => setEditPeca(null)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label><input value={eNome} onChange={e => setENome(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Modelo</label><input value={eModelo} onChange={e => setEModelo(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label><select value={eCategoria} onChange={e => setECategoria(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"><option value="">Selecionar...</option>{categorias.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Compatibilidade</label><input value={eCompat} onChange={e => setECompat(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Qtd</label><input value={eQtd} onChange={e => setEQtd(e.target.value)} type="number" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Preço</label><input value={ePreco} onChange={e => setEPreco(e.target.value)} type="number" step="0.01" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Est.Mín</label><input value={eEstMin} onChange={e => setEEstMin(e.target.value)} type="number" className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-lg active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"><Save size={16} />{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir Peça */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Excluir peça?</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {deleteModal.osVinculadas.length > 0 ? (<><span className="font-semibold text-foreground">{deleteModal.peca.nome}</span> está vinculada a {deleteModal.osVinculadas.length} ordem{deleteModal.osVinculadas.length > 1 ? 's' : ''} de serviço:</>) : (<>Excluir <span className="font-semibold text-foreground">{deleteModal.peca.nome}</span> permanentemente?</>)}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
              {deleteModal.osVinculadas.map((os, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-secondary rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-primary font-mono">{os.numero}</p>
                    <p className="text-xs text-muted-foreground">{os.clienteNome}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      os.status === 'finalizada' ? 'bg-success/15 text-success' :
                      os.status === 'aberta' ? 'bg-info/15 text-info' :
                      'bg-warning/15 text-warning'
                    }`}>{os.status.replace('_', ' ')}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{os.quantidade} un. usadas</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mb-4 p-3 bg-destructive/5 border border-destructive/15 rounded-lg">
              Ao confirmar, a peça será removida dessas ordens e excluída permanentemente do estoque.
            </p>

            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 h-11 bg-secondary text-foreground font-medium rounded-xl active:scale-[0.97] transition-transform">
                Cancelar
              </button>
              <button onClick={handleDeleteForce} disabled={deletingForce}
                className="flex-1 h-11 bg-destructive text-white font-bold rounded-xl active:scale-[0.97] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {deletingForce ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {deletingForce ? 'Excluindo...' : deleteModal.osVinculadas.length > 0 ? 'Excluir mesmo assim' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
