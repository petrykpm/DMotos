import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold transition-all ${
      showReconnected
        ? 'bg-success text-white'
        : 'bg-[#1a1a1a] border-b border-warning/40 text-warning'
    }`}>
      {showReconnected ? (
        <><Wifi size={14} /> Conexão restaurada</>
      ) : (
        <><WifiOff size={14} /> Sem conexão — dados em cache podem estar desatualizados</>
      )}
    </div>
  );
}
