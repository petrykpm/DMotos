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
    try { await login(trimEmail, trimSenha); } catch (err: any) { setLocalError(err.message || 'Erro ao entrar'); }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0a]">

      {/* Topo vermelho com logo */}
      <div className="relative flex flex-col items-center justify-end pb-10 pt-16 flex-shrink-0"
        style={{ background: 'linear-gradient(180deg, hsl(0 84% 28%) 0%, hsl(0 84% 18%) 60%, #0a0a0a 100%)', minHeight: '52vh' }}>

        {/* Grade decorativa sutil */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(hsl(0 0% 100% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center shadow-2xl">
            <img src={logo} alt="DM Motos" className="h-16 w-auto object-contain" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-white tracking-widest">DM MOTOS</h1>
            <p className="text-white/50 text-xs tracking-[0.3em] uppercase mt-1">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 px-6 pt-8 pb-10 animate-fade-in">
        <div className="w-full max-w-sm mx-auto">
          <p className="text-sm font-semibold text-foreground mb-5">Acesse sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" autoComplete="email"
                className="w-full h-12 px-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full h-12 px-4 pr-12 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1 hover:text-foreground transition-colors">
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {(error || localError) && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                {localError || error}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full h-12 bg-gradient-red text-primary-foreground font-bold rounded-xl shadow-red transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-[10px] text-muted-foreground mt-8">DM Motos © 2026</p>
        </div>
      </div>
    </div>
  );
}
