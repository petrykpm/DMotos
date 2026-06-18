import logo from '@/assets/logo-dm-motos.png';

interface LogoHeaderProps {
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-7', md: 'h-10', lg: 'h-20' };

export function LogoHeader({ showName = true, size = 'md' }: LogoHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <img src={logo} alt="DM Motos" className={`${sizes[size]} w-auto object-contain`} />
      {showName && (
        <h1 className="font-display text-lg font-bold text-foreground leading-tight tracking-wider">DM MOTOS</h1>
      )}
    </div>
  );
}
