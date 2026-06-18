import { useState } from 'react';
import { LogoHeader } from '@/components/shared/LogoHeader';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { login, error, isLoading } = useAuth();
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [localError, setLocalError] = useState('');
  const [cadastrando, setCadastrando] = useState(false);
  const [cadastroOk, setCadastroOk] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimEmail = email.trim();
    const trimSenha = senha.trim();
    if (!trimEmail || !trimSenha) { setLocalError('Preencha todos os campos'); return; }
    setLocalError('');
    try {
      await login(trimEmail, trimSenha);
    } catch {}
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimNome = nome.trim();
    const trimEmail = email.trim();
    const trimSenha = senha.trim();
    if (!trimNome || !trimEmail || !trimSenha) { setLocalError('Preencha todos os campos'); return; }
    if (trimSenha.length < 6) { setLocalError('Senha deve ter no mínimo 6 caracteres'); return; }
    if (trimSenha !== confirmarSenha) { setLocalError('As senhas não coincidem'); return; }
    setLocalError('');
    setCadastrando(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimEmail.toLowerCase(),
        password: trimSenha,
        options: { data: { nome: trimNome } },
      });
      if (signUpError) throw new Error(signUpError.message);
      setCadastroOk(true);
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao cadastrar');
    } finally {
      setCadastrando(false);
    }
  };

  const trocarModo = (novoModo: 'login' | 'cadastro') => {
    setModo(novoModo);
    setLocalError('');
    setEmail('');
    setSenha('');
    setNome('');
    setConfirmarSenha('');
    setCadastroOk(false);
  };

  const inputClass = "w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";
  const labelClass = "text-xs font-medium text-muted-foreground mb-1.5 block";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <LogoHeader size="lg" showName={false} />
          <h1 className="font-display text-3xl font-bold text-foreground mt-4 tracking-wide">DM MOTOS</h1>
          <p className="text-sm text-muted-foreground mt-1">Peças e Serviços</p>
        </div>

        {/* Toggle login/cadastro */}
        <div className="flex bg-card border border-border rounded-lg p-1 mb-6">
          <button onClick={() => trocarModo('login')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${modo === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            Entrar
          </button>
          <button onClick={() => trocarModo('cadastro')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${modo === 'cadastro' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
            Criar Conta
          </button>
        </div>

        {/* Cadastro concluído */}
        {cadastroOk ? (
          <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-center space-y-3">
            <p className="text-success font-medium">Conta criada com sucesso!</p>
            <p className="text-sm text-muted-foreground">Verifique seu e-mail para confirmar o cadastro, depois faça login.</p>
            <button onClick={() => trocarModo('login')} className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              Ir para Login
            </button>
          </div>
        ) : modo === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={labelClass}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" className={inputClass} autoComplete="email" />
            </div>
            <div>
              <label className={labelClass}>Senha</label>
              <div className="relative">
                <input type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••" className={`${inputClass} pr-12`} autoComplete="current-password" />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {(error || localError) && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                {localError || error}
              </div>
            )}
            <button type="submit" disabled={isLoading}
              className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className={labelClass}>Nome *</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Seu nome completo" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>E-mail *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" className={inputClass} autoComplete="email" />
            </div>
            <div>
              <label className={labelClass}>Senha *</label>
              <div className="relative">
                <input type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres" className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1">
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirmar Senha *</label>
              <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha" className={inputClass} />
            </div>
            {localError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                {localError}
              </div>
            )}
            <button type="submit" disabled={cadastrando}
              className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-lg shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
              {cadastrando && <Loader2 size={20} className="animate-spin" />}
              {cadastrando ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
