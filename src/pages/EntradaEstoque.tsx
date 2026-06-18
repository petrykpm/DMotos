import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { pecaService } from '@/services/api';
import { toast } from 'sonner';

export default function EntradaEstoque() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [modelo, setModelo] = useState('');
  const [compat, setCompat] = useState('');
  const [categoria, setCategoria] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('5');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimNome = nome.trim();
    const qtd = parseInt(quantidade);
    if (!trimNome) { toast.error('Nome é obrigatório'); return; }
    if (!qtd || qtd <= 0) { toast.error('Quantidade deve ser maior que zero'); return; }

    setSaving(true);
    try {
      await pecaService.criar({
        nome: trimNome,
        modelo: modelo.trim() || undefined,
        compatibilidade: compat.trim() || undefined,
        categoria: categoria.trim() || undefined,
        quantidade: qtd,
        preco: parseFloat(preco) || 0,
        estoque_minimo: parseInt(estoqueMinimo) || 5,
      });
      toast.success('Peça cadastrada no estoque!');
      navigate('/estoque');
    } catch (err: any) {
      console.error('Erro ao cadastrar peça:', err);
      toast.error(err.message || 'Erro ao registrar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Nova Peça / Entrada</h1>
      </div>
      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nome da Peça *</label>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da peça"
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Modelo</label>
            <input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Modelo"
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
            <input value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: Freio"
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Compatibilidade</label>
          <input value={compat} onChange={e => setCompat(e.target.value)} placeholder="Ex: Honda CG 160"
            className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantidade *</label>
            <input value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" type="number" min="1"
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Preço Unit.</label>
            <input value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00" type="number" step="0.01" min="0"
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Est. Mín.</label>
            <input value={estoqueMinimo} onChange={e => setEstoqueMinimo(e.target.value)} placeholder="5" type="number" min="0"
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Registrando...' : 'Cadastrar Peça'}
        </button>
      </form>
    </div>
  );
}
