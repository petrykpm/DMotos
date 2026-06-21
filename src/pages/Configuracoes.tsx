import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { configService } from '@/services/api';
import { LoadingState } from '@/components/shared/LoadingState';
import { LogOut, Bell, AlertTriangle, Save, Building2, ChevronDown, ChevronUp, Shield, Wrench, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import logo from '@/assets/logo-dm-motos.png';

interface ConfigData {
  nome_oficina: string;
  notificacoes_ativas: boolean;
  alerta_estoque_ativo: boolean;
  limite_estoque_baixo: number;
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${active ? 'bg-primary' : 'bg-secondary border border-border'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function Configuracoes() {
  const { profile, logout, updateProfile } = useAuth();
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  // Perfil
  const [nomeUser, setNomeUser] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);

  // Senha
  const [senhaAberto, setSenhaAberto] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [savingSenha, setSavingSenha] = useState(false);

  // Oficina
  const [nomeOficina, setNomeOficina] = useState('');
  const [limiteEstoque, setLimiteEstoque] = useState('5');
  const [savingOficina, setSavingOficina] = useState(false);
  const [oficinaAberto, setOficinaAberto] = useState(false);

  useEffect(() => {
    configService.obter()
      .then(c => {
        setConfig(c);
        setNomeOficina(c.nome_oficina || '');
        setLimiteEstoque(String(c.limite_estoque_baixo || 5));
        setLoading(false);
      })
      .catch(() => {
        setConfig({ nome_oficina: 'DM Motos', notificacoes_ativas: true, alerta_estoque_ativo: true, limite_estoque_baixo: 5 });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (profile) setNomeUser(profile.nome || '');
  }, [profile]);

  const handleSaveSenha = async () => {
    if (!senhaAtual.trim()) { toast.error('Digite a senha atual'); return; }
    if (!novaSenha.trim() || novaSenha.length < 6) { toast.error('Nova senha deve ter pelo menos 6 caracteres'); return; }
    if (novaSenha !== confirmarSenha) { toast.error('As senhas não coincidem'); return; }
    setSavingSenha(true);
    try {
      // Verifica senha atual fazendo login
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: profile?.email || '',
        password: senhaAtual,
      });
      if (signInErr) { toast.error('Senha atual incorreta'); setSavingSenha(false); return; }
      // Atualiza senha
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw new Error(error.message);
      toast.success('Senha alterada com sucesso!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      setSenhaAberto(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar senha');
    } finally {
      setSavingSenha(false);
    }
  };

  const handleSaveUser = async () => {
    if (!nomeUser.trim()) { toast.error('Nome não pode ser vazio'); return; }
    setSavingUser(true);
    try {
      await updateProfile({ nome: nomeUser.trim() });
      toast.success('Nome atualizado!');
      setPerfilAberto(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar nome');
    } finally {
      setSavingUser(false);
    }
  };

  const handleSaveOficina = async () => {
    if (!nomeOficina.trim()) { toast.error('Nome da oficina não pode ser vazio'); return; }
    setSavingOficina(true);
    try {
      const updated = await configService.atualizar({
        nome_oficina: nomeOficina.trim(),
        limite_estoque_baixo: parseInt(limiteEstoque) || 5
      });
      setConfig(prev => prev ? { ...prev, ...updated } : prev);
      toast.success('Dados da oficina salvos!');
      setOficinaAberto(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSavingOficina(false);
    }
  };

  const handleToggle = async (field: 'notificacoes_ativas' | 'alerta_estoque_ativo') => {
    if (!config) return;
    const newVal = !config[field];
    try {
      await configService.atualizar({ [field]: newVal });
      setConfig(prev => prev ? { ...prev, [field]: newVal } : prev);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar');
    }
  };

  const inputClass = "w-full h-11 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";

  if (loading) return <LoadingState />;

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">
      <div className="px-4 pt-5 pb-2">
        <h1 className="font-display text-xl font-bold text-foreground">Configurações</h1>
      </div>

      {/* Card perfil */}
      <div className="px-4 mb-4">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <button
            onClick={() => setPerfilAberto(!perfilAberto)}
            className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
              {profile?.nome?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{profile?.nome || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || ''}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {profile?.role || 'admin'}
              </span>
            </div>
            {perfilAberto ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
          </button>

          {perfilAberto && (
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
                <input
                  value={nomeUser}
                  onChange={e => setNomeUser(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
                <input
                  value={profile?.email || ''}
                  disabled
                  className="w-full h-11 px-4 bg-secondary border border-border rounded-xl text-muted-foreground text-sm"
                />
              </div>
              <button
                onClick={handleSaveUser}
                disabled={savingUser}
                className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {savingUser ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {savingUser ? 'Salvando...' : 'Salvar Nome'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Segurança */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Segurança</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <button
            onClick={() => setSenhaAberto(!senhaAberto)}
            className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Alterar Senha</p>
              <p className="text-xs text-muted-foreground">Altere sua senha de acesso</p>
            </div>
            {senhaAberto ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>

          {senhaAberto && (
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha Atual</label>
                <div className="relative">
                  <input
                    type={showSenhaAtual ? 'text' : 'password'}
                    value={senhaAtual}
                    onChange={e => setSenhaAtual(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 pr-10 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                  <button type="button" onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showSenhaAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNovaSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-11 px-4 pr-10 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                  <button type="button" onClick={() => setShowNovaSenha(!showNovaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full h-11 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
              {novaSenha && confirmarSenha && novaSenha !== confirmarSenha && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
              <button
                onClick={handleSaveSenha}
                disabled={savingSenha}
                className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {savingSenha ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {savingSenha ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Oficina */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Oficina</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <button
            onClick={() => setOficinaAberto(!oficinaAberto)}
            className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Dados da Oficina</p>
              <p className="text-xs text-muted-foreground truncate">{config?.nome_oficina || 'DM Motos'}</p>
            </div>
            {oficinaAberto ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>

          {oficinaAberto && (
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome da Oficina</label>
                <input value={nomeOficina} onChange={e => setNomeOficina(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Limite Estoque Baixo (un.)</label>
                <input value={limiteEstoque} onChange={e => setLimiteEstoque(e.target.value)} type="number" min="1" className={inputClass} />
                <p className="text-xs text-muted-foreground mt-1">Alerta quando estoque atingir esse valor</p>
              </div>
              <button onClick={handleSaveOficina} disabled={savingOficina}
                className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                {savingOficina ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {savingOficina ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notificações */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notificações</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card divide-y divide-border">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Bell size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Notificações</p>
              <p className="text-xs text-muted-foreground">{config?.notificacoes_ativas ? 'Ativadas' : 'Desativadas'}</p>
            </div>
            <Toggle active={!!config?.notificacoes_ativas} onToggle={() => handleToggle('notificacoes_ativas')} />
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Alertas de Estoque</p>
              <p className="text-xs text-muted-foreground">{config?.alerta_estoque_ativo ? 'Ativados' : 'Desativados'}</p>
            </div>
            <Toggle active={!!config?.alerta_estoque_ativo} onToggle={() => handleToggle('alerta_estoque_ativo')} />
          </div>
        </div>
      </div>

      {/* Sistema */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sistema</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card divide-y divide-border">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Versão</p>
              <p className="text-xs text-muted-foreground">v2.7.7</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Wrench size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Limite Estoque Baixo</p>
              <p className="text-xs text-muted-foreground">Alerta abaixo de {config?.limite_estoque_baixo || 5} unidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logo + Logout */}
      <div className="px-4 flex flex-col items-center gap-4">
        <img src={logo} alt="DM Motos" className="h-10 w-auto opacity-20" />
        <button onClick={logout}
          className="w-full h-12 flex items-center justify-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive font-bold rounded-2xl active:scale-[0.97] transition-transform">
          <LogOut size={17} />
          Sair do Sistema
        </button>
        <p className="text-[10px] text-muted-foreground">DM Motos © 2026 • v2.7.7</p>
      </div>
    </div>
  );
}
