import { useState } from 'react';
import { LogoHeader } from '@/components/shared/LogoHeader';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Eye, EyeOff } from 'lucide-react';

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

  const inputClass = "w-full h-12 px-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <LogoHeader size="lg" showName={false} />
          <h1 className="font-display text-3xl font-bold text-foreground mt-4 tracking-wide">DM MOTOS</h1>
          <p className="text-sm text-muted-foreground mt-1">Peças e Serviços</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" className={inputClass} autoComplete="email" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Senha</label>
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
      </div>
    </div>
  );
}
