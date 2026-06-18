import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo-dm-motos.png';

export default function Login() {
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimEmail = email.trim();
    const trimSenha = senha.trim();
    if (!trimEmail || !trimSenha) { setLocalError('Preencha todos os campos'); return; }
    setLocalError('');
    try {
      await login(trimEmail, trimSenha);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo + Nome */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-2xl bg-card border border-border shadow-card flex items-center justify-center mb-5 shadow-red">
            <img src={logo} alt="DM Motos" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-widest">DM MOTOS</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px w-8 bg-border" />
            <span className="text-xs text-muted-foreground tracking-widest uppercase">Sistema de Gestão</span>
            <div className="h-px w-8 bg-border" />
          </div>
        </div>

        {/* Card do formulário */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <p className="text-sm font-semibold text-foreground mb-5">Acesse sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" autoComplete="email"
                className="w-full h-12 px-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full h-12 px-4 pr-12 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1 hover:text-foreground transition-colors">
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {(error || localError) && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                {localError || error}
              </div>
            )}

            <button
              type="submit" disabled={isLoading}
              className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-xl shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">DM Motos © 2026</p>
      </div>
    </div>
  );
}
