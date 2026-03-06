import React from 'react';

type Variant = 'primary' | 'success' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children: React.ReactNode;
  onClick?: (e?: any) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: Variant;
  outline?: boolean;
  size?: Size;
  className?: string;
}

const sizeMap: Record<Size, string> = {
  sm: 'py-2 px-3 text-sm',
  md: 'py-2 px-4 text-sm',
  lg: 'py-3 px-6 text-base',
};

const ModalButton = ({ children, onClick, disabled, type = 'button', variant = 'primary', outline = false, size = 'md', className = '' }: Props) => {
  const sizeCls = sizeMap[size];
  if (outline) {
    const borderColor = variant === 'danger' ? 'border-danger text-danger' : variant === 'success' ? 'border-success text-success' : 'border-primary text-primary';
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-md border ${borderColor} ${sizeCls} text-center font-medium hover:bg-opacity-90 ${className}`}
      >
        {children}
      </button>
    );
  }

  const bgColor = variant === 'danger' ? 'bg-danger text-white' : variant === 'success' ? 'bg-success text-white' : 'bg-primary text-white';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md ${bgColor} ${sizeCls} text-center font-medium hover:bg-opacity-90 ${className}`}
    >
      {children}
    </button>
  );
};

export default ModalButton;
