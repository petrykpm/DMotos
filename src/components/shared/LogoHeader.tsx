import logo from '@/assets/logo-dm-motos.png';

interface LogoHeaderProps {
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-8', md: 'h-12', lg: 'h-20' };

export function LogoHeader({ showName = true, size = 'md' }: LogoHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <img src={logo} alt="DM Motos" className={`${sizes[size]} w-auto object-contain`} />
      {showName && (
        <div>
          <h1 className="font-display text-lg font-bold text-foreground leading-tight">DM MOTOS</h1>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">Peças e Serviços</p>
        </div>
      )}
    </div>
  );
}
