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
      className={`flex flex-col items-start gap-2 p-4 rounded-lg border transition-all active:scale-[0.97] w-full text-left shadow-card ${
        variant === 'primary'
          ? 'bg-gradient-red border-primary/20 shadow-red'
          : 'bg-card border-border'
      }`}
    >
      <div className={`p-2 rounded-md ${variant === 'primary' ? 'bg-primary-foreground/10' : 'bg-secondary'}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className={`text-xs ${variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{label}</p>
      </div>
    </button>
  );
}
