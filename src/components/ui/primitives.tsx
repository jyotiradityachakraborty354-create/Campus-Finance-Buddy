import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const bg = variant === 'subtle' ? 'bg-[#fafafa]' : 'bg-[#ffffff]';
  return (
    <div
      className={`${bg} border border-[#e5e5e5] rounded-[24px] p-[20px] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-[18px] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] focus-visible:ring-offset-1';

  const variants = {
    primary: 'bg-[#0a0a0a] text-[#fafafa] hover:bg-[#171717] border border-transparent',
    secondary: 'bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#e5e5e5] border border-transparent',
    outline: 'bg-transparent text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#f5f5f5]',
    destructive:
      'bg-transparent text-[#e7000b] border border-[#e5e5e5] hover:bg-[#fafafa] hover:border-[#e7000b]',
  };

  const sizes = {
    sm: 'h-[32px] px-[12px] text-[12px]',
    md: 'h-[38px] px-[16px] text-[14px]',
    lg: 'h-[42px] px-[20px] text-[14px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-[38px] bg-[#f5f5f5] text-[#0a0a0a] placeholder:text-[#737373] rounded-[18px] px-[14px] py-[8px] text-[14px] font-normal border border-transparent focus:border-[#e5e5e5] focus:bg-[#ffffff] focus:outline-none transition-colors ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full h-[38px] bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] px-[14px] py-[8px] text-[14px] font-normal border border-transparent focus:border-[#e5e5e5] focus:bg-[#ffffff] focus:outline-none transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'soft' | 'outline' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'soft',
  className = '',
  ...props
}) => {
  const styles = {
    solid: 'bg-[#171717] text-[#fafafa] border border-transparent',
    soft: 'bg-[#f5f5f5] text-[#171717] border border-transparent',
    outline: 'bg-transparent text-[#0a0a0a] border border-[#e5e5e5]',
    destructive: 'bg-transparent text-[#e7000b] border border-[#e7000b]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[18px] px-[10px] py-[2px] text-[12px] font-medium leading-[1.33] whitespace-nowrap shrink-0 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
