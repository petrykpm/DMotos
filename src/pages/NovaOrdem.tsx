import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronRight, Plus, Minus } from 'lucide-react';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { clienteService, motoService, pecaService, ordemService } from '@/services/api';
import { toast } from 'sonner';

type Step = 'cliente' | 'moto' | 'detalhes' | 'pecas' | 'resumo';

export default function NovaOrdem() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('cliente');
  const [clientes, setClientes] = useState<any[]>([]);
  const [motos, setMotos] = useState<any[]>([]);
  const [pecas, setPecas] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [selectedMoto, setSelectedMoto] = useState<any>(null);
  const [problema, setProblema] = useState('');
  const [servico, setServico] = useState('');
  const [maoObra, setMaoObra] = useState('');
  const [selectedPecas, setSelectedPecas] = useState<{ peca: any; qtd: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [buscaPeca, setBuscaPeca] = useState('');

  useEffect(() => {
    clienteService.listar().then(setClientes).catch(err => {
      console.error('Erro ao listar clientes:', err);
      toast.error('Erro ao carregar clientes');
    });
    pecaService.listar().then(setPecas).catch(err => {
      console.error('Erro ao listar peças:', err);
    });
  }, []);

  useEffect(() => {
    if (selectedCliente) {
      motoService.listarPorCliente(selectedCliente.id).then(setMotos).catch(err => {
        console.error('Erro ao listar motos:', err);
      });
    }
  }, [selectedCliente]);

  const totalPecas = selectedPecas.reduce((t, sp) => t + Number(sp.peca.preco) * sp.qtd, 0);
  const totalMaoObra = parseFloat(maoObra) || 0;
  const totalGeral = totalPecas + totalMaoObra;

  const togglePeca = (peca: any) => {
    const exists = selectedPecas.find(sp => sp.peca.id === peca.id);
    if (exists) {
      setSelectedPecas(prev => prev.filter(sp => sp.peca.id !== peca.id));
    } else {
      setSelectedPecas(prev => [...prev, { peca, qtd: 1 }]);
    }
  };

  const updateQtd = (pecaId: string, delta: number) => {
    setSelectedPecas(prev => prev.map(sp => {
      if (sp.peca.id !== pecaId) return sp;
      const novaQtd = sp.qtd + delta;
      if (novaQtd <= 0) return sp;
      if (novaQtd > sp.peca.quantidade) { toast.error(`Só há ${sp.peca.quantidade} unidades em estoque`); return sp; }
      return { ...sp, qtd: novaQtd };
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCliente || !selectedMoto || !problema.trim()) {
      toast.error('Dados incompletos');
      return;
    }
    setSaving(true);
    try {
      await ordemService.criar({
        cliente_id: selectedCliente.id,
        moto_id: selectedMoto.id,
        problema_relatado: problema.trim(),
        descricao_servico: servico.trim() || undefined,
        valor_mao_obra: totalMaoObra,
        itens: selectedPecas.map(sp => ({
          peca_id: sp.peca.id,
          quantidade: sp.qtd,
          preco_unitario: sp.peca.preco,
        })),
      });
      toast.success('Ordem de serviço criada!');
      navigate('/ordens');
    } catch (err: any) {
      console.error('Erro ao criar OS:', err);
      toast.error(err.message || 'Erro ao criar OS');
    } finally {
      setSaving(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'moto', label: 'Moto' },
    { key: 'detalhes', label: 'Detalhes' },
    { key: 'pecas', label: 'Peças' },
    { key: 'resumo', label: 'Resumo' },
  ];
  const currentIdx = steps.findIndex(s => s.key === step);

  const inputClass = "w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const pecasFiltradas = pecas.filter(p => !buscaPeca || p.nome.toLowerCase().includes(buscaPeca.toLowerCase()) || (p.compatibilidade || '').toLowerCase().includes(buscaPeca.toLowerCase()));

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => currentIdx > 0 ? setStep(steps[currentIdx - 1].key) : navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground">
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground">Nova OS</h1>
        <span className="ml-auto text-xs text-muted-foreground">{currentIdx + 1}/{steps.length}</span>
      </div>

      <div className="px-4 mb-4 flex gap-1">
        {steps.map((s, i) => (
          <div key={s.key} className={`flex-1 h-1 rounded-full transition-all ${i <= currentIdx ? 'bg-primary' : 'bg-secondary'}`} />
        ))}
      </div>

      {step === 'cliente' && (
        <div className="px-4">
          <SectionTitle title="Selecionar Cliente" />
          <input value={buscaCliente} onChange={e => setBuscaCliente(e.target.value)} placeholder="Buscar cliente..."
            className="w-full h-11 px-4 mb-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <div className="space-y-2">
            {clientes.filter(c => !buscaCliente || c.nome.toLowerCase().includes(buscaCliente.toLowerCase())).map(c => (
              <button key={c.id} onClick={() => { setSelectedCliente(c); setStep('moto'); }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left active:scale-[0.98] transition-transform ${
                  selectedCliente?.id === c.id ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{c.nome.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.telefone}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
            {clientes.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhum cliente cadastrado</p>
            )}
          </div>
        </div>
      )}

      {step === 'moto' && (
        <div className="px-4">
          <SectionTitle title="Selecionar Moto" />
          {motos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">Nenhuma moto cadastrada para este cliente</p>
              <button onClick={() => navigate(`/motos/nova?clienteId=${selectedCliente?.id}`)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                Cadastrar Nova Moto
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {motos.map(m => (
                <button key={m.id} onClick={() => { setSelectedMoto(m); setStep('detalhes'); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left active:scale-[0.98] transition-transform ${
                    selectedMoto?.id === m.id ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                  }`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.marca} {m.modelo} {m.ano || ''}</p>
                    <p className="text-xs text-muted-foreground">{[m.placa, m.cor].filter(Boolean).join(' • ')}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
              <button onClick={() => navigate(`/motos/nova?clienteId=${selectedCliente?.id}`)} className="w-full p-3 border border-dashed border-primary/50 rounded-lg text-sm text-primary font-medium text-center">
                + Cadastrar Nova Moto
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'detalhes' && (
        <div className="px-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Problema Relatado *</label>
            <textarea value={problema} onChange={e => setProblema(e.target.value)} rows={3} placeholder="Descreva o problema..."
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descrição do Serviço</label>
            <textarea value={servico} onChange={e => setServico(e.target.value)} rows={3} placeholder="Descreva o serviço a ser realizado..."
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Mão de Obra (R$)</label>
            <input value={maoObra} onChange={e => setMaoObra(e.target.value)} placeholder="0,00" type="number" min="0" step="0.01" className={inputClass} />
          </div>
          <button onClick={() => setStep('pecas')} disabled={!problema.trim()}
            className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red disabled:opacity-50 active:scale-[0.97] transition-transform">
            Próximo
          </button>
        </div>
      )}

      {step === 'pecas' && (
        <div className="px-4">
          <SectionTitle title="Adicionar Peças (opcional)" />
          <input value={buscaPeca} onChange={e => setBuscaPeca(e.target.value)} placeholder="Buscar peça..."
            className="w-full h-11 px-4 mb-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />

          {/* Peças selecionadas com controle de quantidade */}
          {selectedPecas.length > 0 && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-primary mb-2">{selectedPecas.length} peça(s) selecionada(s)</p>
              {selectedPecas.map(sp => (
                <div key={sp.peca.id} className="flex items-center justify-between">
                  <p className="text-sm text-foreground flex-1 truncate">{sp.peca.nome}</p>
                  <div className="flex items-center gap-2 ml-2">
                    <button onClick={() => updateQtd(sp.peca.id, -1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-foreground w-5 text-center">{sp.qtd}</span>
                    <button onClick={() => updateQtd(sp.peca.id, 1)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
                      <Plus size={12} />
                    </button>
                    <span className="text-xs text-primary font-medium w-16 text-right">R$ {(sp.peca.preco * sp.qtd).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 mb-4">
            {pecasFiltradas.map(p => {
              const sel = selectedPecas.find(sp => sp.peca.id === p.id);
              return (
                <button key={p.id} onClick={() => togglePeca(p)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left active:scale-[0.98] transition-transform ${
                    sel ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                  }`}>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">R$ {Number(p.preco).toFixed(2)} • {p.quantidade} em estoque</p>
                  </div>
                  {sel ? <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">✓ {sel.qtd}x</span> : <Plus size={16} className="text-muted-foreground" />}
                </button>
              );
            })}
            {pecas.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Nenhuma peça no estoque</p>
            )}
          </div>
          <button onClick={() => setStep('resumo')}
            className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red active:scale-[0.97] transition-transform">
            Ver Resumo
          </button>
        </div>
      )}

      {step === 'resumo' && (
        <div className="px-4 space-y-3">
          <div className="p-4 bg-card rounded-lg border border-border">
            <SectionTitle title="Resumo da OS" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Cliente</span><span className="text-foreground font-medium">{selectedCliente?.nome}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Moto</span><span className="text-foreground font-medium">{selectedMoto?.marca} {selectedMoto?.modelo}</span></div>
              <div className="border-t border-border pt-2 mt-2">
                <p className="text-muted-foreground text-xs mb-1">Problema:</p>
                <p className="text-foreground">{problema}</p>
              </div>
              {servico && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Serviço:</p>
                  <p className="text-foreground">{servico}</p>
                </div>
              )}
              {selectedPecas.length > 0 && (
                <div className="border-t border-border pt-2 mt-2">
                  <p className="text-muted-foreground text-xs mb-2">Peças:</p>
                  {selectedPecas.map(sp => (
                    <div key={sp.peca.id} className="flex justify-between">
                      <span className="text-foreground">{sp.qtd}x {sp.peca.nome}</span>
                      <span className="text-foreground">R$ {(Number(sp.peca.preco) * sp.qtd).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peças</span>
                  <span className="text-foreground">R$ {totalPecas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mão de Obra</span>
                  <span className="text-foreground">R$ {totalMaoObra.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">R$ {totalGeral.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={saving}
            className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red disabled:opacity-50 active:scale-[0.97] transition-transform flex items-center justify-center gap-2">
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? 'Criando...' : 'Criar Ordem de Serviço'}
          </button>
        </div>
      )}
    </div>
  );
}
