import type { ReactNode } from 'react';

interface QuickActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary border border-border transition-all active:scale-[0.95] active:bg-secondary/80"
    >
      <div className="p-2.5 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground text-center leading-tight">{label}</span>
    </button>
  );
}
