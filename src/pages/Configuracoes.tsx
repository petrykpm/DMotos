import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { configService } from '@/services/api';
import { LoadingState } from '@/components/shared/LoadingState';
import { LogOut, Bell, AlertTriangle, Save, User, Building2, ChevronRight, X, Shield, Wrench } from 'lucide-react';
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-lg p-5 animate-fade-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-secondary text-muted-foreground"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Configuracoes() {
  const { profile, logout, updateProfile } = useAuth();
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editUser, setEditUser] = useState(false);
  const [editOficina, setEditOficina] = useState(false);

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
      .catch(() => {
        setConfig({ nome_oficina: 'DM Motos', notificacoes_ativas: true, alerta_estoque_ativo: true, limite_estoque_baixo: 5 });
        setLoading(false);
      });
  }, []);

  useEffect(() => { if (profile) setNomeUser(profile.nome); }, [profile]);

  const handleSaveUser = async () => {
    if (!nomeUser.trim()) return;
    setSaving(true);
    try { await updateProfile({ nome: nomeUser.trim() }); toast.success('Nome atualizado!'); setEditUser(false); }
    catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleSaveOficina = async () => {
    if (!nomeOficina.trim()) return;
    setSaving(true);
    try {
      const updated = await configService.atualizar({ nome_oficina: nomeOficina.trim(), limite_estoque_baixo: parseInt(limiteEstoque) || 5 });
      setConfig(prev => prev ? { ...prev, ...updated } : prev);
      toast.success('Configurações salvas!'); setEditOficina(false);
    } catch (err: any) { toast.error(err.message || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (field: 'notificacoes_ativas' | 'alerta_estoque_ativo') => {
    if (!config) return;
    const newVal = !config[field];
    try {
      await configService.atualizar({ [field]: newVal });
      setConfig(prev => prev ? { ...prev, [field]: newVal } : prev);
    } catch (err: any) { toast.error(err.message || 'Erro ao atualizar'); }
  };

  const inputClass = "w-full h-11 px-4 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  if (loading) return <LoadingState />;

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in">

      {/* Header com perfil */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="font-display text-xl font-bold text-foreground mb-4">Configurações</h1>

        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
            {profile?.nome?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground truncate">{profile?.nome || 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email || ''}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {profile?.role || 'admin'}
            </span>
          </div>
          <button onClick={() => setEditUser(true)} className="p-2 rounded-xl bg-secondary text-muted-foreground flex-shrink-0">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Seção: Oficina */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Oficina</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <button onClick={() => setEditOficina(true)}
            className="w-full flex items-center gap-3 p-4 text-left active:bg-secondary transition-colors">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Dados da Oficina</p>
              <p className="text-xs text-muted-foreground">{config?.nome_oficina || 'DM Motos'}</p>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Seção: Notificações */}
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

      {/* Seção: Sistema */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sistema</p>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card divide-y divide-border">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Versão</p>
              <p className="text-xs text-muted-foreground">v2.6.0</p>
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
        <img src={logo} alt="DM Motos" className="h-10 w-auto opacity-30" />
        <button onClick={logout}
          className="w-full h-12 flex items-center justify-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive font-bold rounded-2xl active:scale-[0.97] transition-transform">
          <LogOut size={17} />
          Sair do Sistema
        </button>
        <p className="text-[10px] text-muted-foreground">DM Motos © 2026 • v2.6.0</p>
      </div>

      {/* Modal: Editar Usuário */}
      {editUser && (
        <Modal title="Editar Usuário" onClose={() => setEditUser(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome</label>
              <input value={nomeUser} onChange={e => setNomeUser(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
              <input value={profile?.email || ''} disabled className="w-full h-11 px-4 bg-secondary border border-border rounded-xl text-muted-foreground" />
            </div>
            <button onClick={handleSaveUser} disabled={saving}
              className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
              <Save size={15} />{saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal: Editar Oficina */}
      {editOficina && (
        <Modal title="Dados da Oficina" onClose={() => setEditOficina(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome da Oficina</label>
              <input value={nomeOficina} onChange={e => setNomeOficina(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Limite Estoque Baixo (un.)</label>
              <input value={limiteEstoque} onChange={e => setLimiteEstoque(e.target.value)} type="number" min="1" className={inputClass} />
              <p className="text-xs text-muted-foreground mt-1">Alerta quando estoque atingir esse valor</p>
            </div>
            <button onClick={handleSaveOficina} disabled={saving}
              className="w-full h-11 bg-gradient-red text-primary-foreground font-bold rounded-xl active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2">
              <Save size={15} />{saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
