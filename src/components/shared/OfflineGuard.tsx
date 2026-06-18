import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface OfflineGuardProps {
  children: React.ReactNode;
  action?: string; // ex: "criar uma OS"
}

export function OfflineGuard({ children, action = 'realizar esta ação' }: OfflineGuardProps) {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
          <WifiOff size={28} className="text-warning" />
        </div>
        <p className="text-base font-bold text-foreground mb-1">Sem conexão</p>
        <p className="text-sm text-muted-foreground">
          Você precisa estar conectado à internet para {action}.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Verifique sua conexão e tente novamente.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
