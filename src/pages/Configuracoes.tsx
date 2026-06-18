import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { configService } from '@/services/api';
import { LogoHeader } from '@/components/shared/LogoHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { LogOut, Bell, AlertTriangle, Save, User, Shield, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigData {
  nome_oficina: string;
  notificacoes_ativas: boolean;
  alerta_estoque_ativo: boolean;
  limite_estoque_baixo: number;
}

export default function Configuracoes() {
  const { profile, logout, updateProfile } = useAuth();
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modais
  const [editUser, setEditUser] = useState(false);
  const [editOficina, setEditOficina] = useState(false);

  // Form state
  const [nomeUser, setNomeUser] = useState('');
  const [nomeOficina, setNomeOficina] = useState('');
  const [limiteEstoque, setLimiteEstoque] = useState('5');

  useEffect(() => {
    configService.obter()
      .then(c => {
        setConfig(c);
        setNomeOficina(c.nome_oficina || '');
        setLimiteEstoque(String(c.limite_estoque_baixo || 5));
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar config:', err);
        setConfig({
          nome_oficina: 'DM Motos',
          notificacoes_ativas: true,
          alerta_estoque_ativo: true,
          limite_estoque_baixo: 5,
        });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (profile) setNomeUser(profile.nome);
  }, [profile]);

  const handleSaveUser = async () => {
    if (!nomeUser.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ nome: nomeUser.trim() });
      toast.success('Nome atualizado!');
      setEditUser(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOficina = async () => {
    if (!nomeOficina.trim()) return;
    setSaving(true);
    try {
      const updated = await configService.atualizar({
        nome_oficina: nomeOficina.trim(),
        limite_estoque_baixo: parseInt(limiteEstoque) || 5,
      });
      setConfig(prev => prev ? { ...prev, ...updated } : prev);
      toast.success('Configurações salvas!');
      setEditOficina(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (field: 'notificacoes_ativas' | 'alerta_estoque_ativo') => {
    if (!config) return;
    const newVal = !config[field];
    try {
      await configService.atualizar({ [field]: newVal });
      setConfig(prev => prev ? { ...prev, [field]: newVal } : prev);
      toast.success('Atualizado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-4 pt-4 pb-3">
        <h1 className="font-display text-xl font-bold text-foreground">Configurações</h1>
      </div>

      {/* User card */}
      <div className="mx-4 p-4 bg-card rounded-lg border border-border shadow-card mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          {profile?.nome?.charAt(0) || 'A'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{profile?.nome || 'Admin'}</p>
          <p className="text-xs text-muted-foreground">{profile?.email || ''}</p>
          <p className="text-[10px] text-primary font-medium uppercase">{profile?.role || 'admin'}</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="mx-4 bg-card rounded-lg border border-border shadow-card overflow-hidden mb-4">
        {/* Dados do Usuário */}
        <button onClick={() => setEditUser(true)}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors border-b border-border">
          <User size={18} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Dados do Usuário</p>
            <p className="text-xs text-muted-foreground">{profile?.nome || 'Admin'}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {/* Dados da Oficina */}
        <button onClick={() => setEditOficina(true)}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors border-b border-border">
          <Shield size={18} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Dados da Oficina</p>
            <p className="text-xs text-muted-foreground">{config?.nome_oficina || 'DM Motos'}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {/* Notificações - Toggle */}
        <button onClick={() => handleToggle('notificacoes_ativas')}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors border-b border-border">
          <Bell size={18} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Notificações</p>
            <p className="text-xs text-muted-foreground">{config?.notificacoes_ativas ? 'Ativadas' : 'Desativadas'}</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${config?.notificacoes_ativas ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config?.notificacoes_ativas ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Alertas de Estoque - Toggle */}
        <button onClick={() => handleToggle('alerta_estoque_ativo')}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors">
          <AlertTriangle size={18} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Alertas de Estoque</p>
            <p className="text-xs text-muted-foreground">{config?.alerta_estoque_ativo ? 'Ativados' : 'Desativados'}</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${config?.alerta_estoque_ativo ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config?.alerta_estoque_ativo ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <LogoHeader size="sm" />
      </div>

      <div className="px-4">
        <button onClick={logout}
          className="w-full h-12 flex items-center justify-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive font-bold rounded-lg active:scale-[0.97] transition-transform">
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-6">DM Motos © 2026 • v2.0.0</p>

      {/* ---- Modal: Editar Usuário ---- */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Editar Usuário</h2>
              <button onClick={() => setEditUser(false)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
                <input value={nomeUser} onChange={e => setNomeUser(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
                <input value={profile?.email || ''} disabled
                  className="w-full h-11 px-4 bg-secondary border border-border rounded-lg text-muted-foreground" />
              </div>
              <button onClick={handleSaveUser} disabled={saving}
                className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-lg active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Modal: Editar Oficina ---- */}
      {editOficina && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Dados da Oficina</h2>
              <button onClick={() => setEditOficina(false)} className="p-1 text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome da Oficina</label>
                <input value={nomeOficina} onChange={e => setNomeOficina(e.target.value)}
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Limite Estoque Baixo (un.)</label>
                <input value={limiteEstoque} onChange={e => setLimiteEstoque(e.target.value)} type="number" min="1"
                  className="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <button onClick={handleSaveOficina} disabled={saving}
                className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-lg active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
