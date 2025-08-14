import { ReactNode, ButtonHTMLAttributes } from 'react';

interface TouchFriendlyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function TouchFriendlyButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: TouchFriendlyButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 active:scale-95 touch-manipulation';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px] min-w-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px] min-w-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px] min-w-[48px]'
  };
  
  const variantClasses = {
    primary: 'bg-[var(--accent)] text-[var(--background)] hover:bg-opacity-80',
    secondary: 'bg-[var(--gradient-start)] text-[var(--foreground)] hover:bg-[var(--accent)]/20 border border-[var(--secondary)]/20',
    ghost: 'text-[var(--foreground)] hover:bg-[var(--accent)]/10'
  };
  
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}