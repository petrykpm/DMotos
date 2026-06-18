import type { StatusOS } from '@/types';

interface StatusBadgeProps {
  status: StatusOS | 'baixo' | 'critico' | 'normal';
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  aberta: { label: 'Aberta', className: 'bg-info/15 text-info border-info/30' },
  em_andamento: { label: 'Em Andamento', className: 'bg-warning/15 text-warning border-warning/30' },
  finalizada: { label: 'Finalizada', className: 'bg-success/15 text-success border-success/30' },
  cancelada: { label: 'Cancelada', className: 'bg-muted text-muted-foreground border-border' },
  normal: { label: 'Normal', className: 'bg-success/15 text-success border-success/30' },
  baixo: { label: 'Baixo', className: 'bg-warning/15 text-warning border-warning/30' },
  critico: { label: 'Crítico', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.normal;
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.className} ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
    }`}>
      {config.label}
    </span>
  );
}
