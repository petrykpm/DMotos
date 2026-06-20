import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, X, Save, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { categoriaService } from '@/services/api';

export default function Categorias() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nova, setNova] = useState('');
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState<{ id: string; nome: string } | null>(null);
  const [deletando, setDeletando] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await categoriaService.listar();
      setCats(data);
    } catch { toast.error('Erro ao carregar categorias'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!nova.trim()) return;
    setSaving(true);
    try {
      await categoriaService.criar(nova.trim());
      setNova('');
      await load();
      toast.success('Categoria criada!');
    } catch (err: any) { toast.error(err.message || 'Erro ao criar'); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editando || !editando.nome.trim()) return;
    setSaving(true);
    try {
      await categoriaService.atualizar(editando.id, editando.nome.trim());
      setEditando(null);
      await load();
      toast.success('Categoria atualizada!');
    } catch (err: any) { toast.error(err.message || 'Erro ao editar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeletando(id);
    try {
      await categoriaService.deletar(id);
      await load();
      toast.success('Categoria removida!');
    } catch (err: any) { toast.error(err.message || 'Erro ao excluir'); }
    finally { setDeletando(null); }
  };

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Categorias de Peças</h1>
      </div>

      {/* Adicionar nova */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nova Categoria</p>
        <div className="flex gap-2">
          <input
            value={nova}
            onChange={e => setNova(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Ex: Suspensão, Motor, Freio..."
            className="flex-1 h-11 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !nova.trim()}
            className="h-11 px-4 bg-gradient-red text-white font-bold rounded-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="px-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Suas Categorias ({cats.length})
        </p>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
        ) : cats.length === 0 ? (
          <div className="text-center py-10">
            <Tag size={28} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma categoria ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cats.map(cat => (
              <div key={cat.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {editando?.id === cat.id ? (
                  <div className="flex items-center gap-2 p-3">
                    <input
                      value={editando.nome}
                      onChange={e => setEditando({ ...editando, nome: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleEdit()}
                      className="flex-1 h-9 px-3 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button onClick={handleEdit} disabled={saving} className="p-2 rounded-lg bg-primary/10 text-primary">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    </button>
                    <button onClick={() => setEditando(null)} className="p-2 rounded-lg bg-secondary text-muted-foreground">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Tag size={14} className="text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground flex-1">{cat.nome}</p>
                    <button onClick={() => setEditando({ id: cat.id, nome: cat.nome })} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletando === cat.id}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">
                      {deletando === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
