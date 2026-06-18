import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { clienteService } from '@/services/api';
import { toast } from 'sonner';

export default function NovoCliente() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimNome = nome.trim();
    const trimTel = telefone.trim();
    if (!trimNome || !trimTel) { toast.error('Nome e telefone são obrigatórios'); return; }
    setSaving(true);
    try {
      await clienteService.criar({
        nome: trimNome,
        telefone: trimTel,
        email: email.trim() || undefined,
        endereco: endereco.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      toast.success('Cliente cadastrado!');
      navigate('/clientes');
    } catch (err: any) {
      console.error('Erro ao cadastrar cliente:', err);
      toast.error(err.message || 'Erro ao cadastrar');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "text-xs font-medium text-muted-foreground mb-1.5 block";

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-secondary text-foreground"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Novo Cliente</h1>
      </div>
      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        <div>
          <label className={labelClass}>Nome *</label>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do cliente" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telefone *</label>
          <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" type="tel" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" type="email" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Endereço</label>
          <input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Observações</label>
          <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações..." rows={3}
            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
        </div>
        <button type="submit" disabled={saving}
          className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Salvando...' : 'Cadastrar Cliente'}
        </button>
      </form>
    </div>
  );
}
