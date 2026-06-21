import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { pecaService, categoriaService } from '@/services/api';
import { toast } from 'sonner';
import { OfflineGuard } from '@/components/shared/OfflineGuard';



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

  useEffect(() => {
    categoriaService.listar()
      .then(cats => {
        if (cats.length > 0) {
          setCategorias(cats.map((cat: any) => cat.nome));
        }
      })
      .catch(() => {}); // mantém fallback hardcoded
  }, []);
  const [categorias, setCategorias] = useState<string[]>(['Freio', 'Transmissão', 'Lubrificante', 'Filtro', 'Ignição', 'Pneu', 'Embreagem', 'Elétrica', 'Suspensão', 'Motor', 'Outros']);

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
        categoria: categoria || undefined,
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

  const inputClass = "w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "text-xs font-medium text-muted-foreground mb-1.5 block";

  return (
    <OfflineGuard action="cadastrar uma peça">
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Nova Peça</h1>
      </div>
      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        <div>
          <label className={labelClass}>Nome da Peça *</label>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pastilha de Freio Dianteira" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Selecionar...</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Modelo</label>
            <input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: ESD-123" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Compatibilidade</label>
          <input value={compat} onChange={e => setCompat(e.target.value)} placeholder="Ex: Honda CG 160, Titan 150" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Quantidade *</label>
            <input value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" type="number" min="1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Preço de Venda (R$)</label>
            <input value={preco} onChange={e => setPreco(e.target.value)} placeholder="0,00" type="number" step="0.01" min="0" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Estoque Mínimo</label>
          <input value={estoqueMinimo} onChange={e => setEstoqueMinimo(e.target.value)} placeholder="5" type="number" min="0" className={inputClass} />
          <p className="text-xs text-muted-foreground mt-1">Alerta quando estoque atingir esse valor</p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Cadastrando...' : 'Cadastrar Peça'}
        </button>
      </form>
    </div>
    </OfflineGuard>
  );
}