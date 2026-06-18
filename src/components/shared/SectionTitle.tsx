interface SectionTitleProps {
  title: string;
  action?: { label: string; onClick: () => void };
}

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h2>
      {action && (
        <button onClick={action.onClick} className="text-xs font-medium text-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
