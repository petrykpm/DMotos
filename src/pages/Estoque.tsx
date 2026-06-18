import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { pecaService } from '@/services/api';
import { toast } from 'sonner';

const categorias = ['Todas', 'Freio', 'Transmissão', 'Lubrificante', 'Filtro', 'Ignição', 'Pneu', 'Embreagem', 'Elétrica', 'Suspensão', 'Motor', 'Outros'];

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

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta peça do estoque?')) return;
    try { await pecaService.deletar(id); toast.success('Peça excluída!'); loadData(); }
    catch (err: any) { toast.error(err.message || 'Erro ao excluir. Pode estar vinculada a uma OS.'); }
  };

  const filtered = pecas.filter(p => {
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.compatibilidade || '').toLowerCase().includes(busca.toLowerCase()) || (p.sku || '').toLowerCase().includes(busca.toLowerCase());
    const matchCat = categoria === 'Todas' || p.categoria === categoria;
    const matchStatus = statusFilter === 'todos' || p.statusEstoque === statusFilter;
    return matchBusca && matchCat && matchStatus;
  });

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">Estoque</h1>
        <button onClick={() => navigate('/estoque/entrada')} className="p-2.5 bg-primary rounded-lg text-primary-foreground active:scale-95 transition-transform"><Plus size={18} /></button>
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
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Peça</h2>
              <button onClick={() => setEditPeca(null)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label><input value={eNome} onChange={e => setENome(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Modelo</label><input value={eModelo} onChange={e => setEModelo(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label><input value={eCategoria} onChange={e => setECategoria(e.target.value)} className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
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
    </div>
  );
}
