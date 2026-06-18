import type { ReactNode } from 'react';

interface SummaryCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  variant?: 'default' | 'primary';
  onClick?: () => void;
}

export function SummaryCard({ icon, label, value, variant = 'default', onClick }: SummaryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-3 p-4 rounded-xl border transition-all active:scale-[0.96] w-full text-left ${
        variant === 'primary'
          ? 'bg-gradient-red border-primary/20 shadow-red'
          : 'bg-card border-border shadow-card'
      }`}
    >
      <div className={`p-2 rounded-lg ${variant === 'primary' ? 'bg-white/10' : 'bg-primary/10'}`}>
        <span className={variant === 'primary' ? 'text-white' : 'text-primary'}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none mb-1 ${variant === 'primary' ? 'text-white' : 'text-foreground'}`}>{value}</p>
        <p className={`text-[11px] font-medium uppercase tracking-wider ${variant === 'primary' ? 'text-white/60' : 'text-muted-foreground'}`}>{label}</p>
      </div>
    </button>
  );
}
