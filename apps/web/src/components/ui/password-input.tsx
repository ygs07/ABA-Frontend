'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from 'cn';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showLeadingIcon?: boolean;
  containerClassName?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, containerClassName, showLeadingIcon = true, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={cn('relative', containerClassName)}>
        {showLeadingIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-text-muted" />
          </div>
        )}
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'block w-full min-w-0 rounded-md border border-border bg-surface-1 py-2 pr-10 text-text focus:outline-none focus:ring-2 focus:ring-brand-500 sm:text-sm',
            showLeadingIcon ? 'pl-10' : 'pl-3',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text focus:outline-none"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
