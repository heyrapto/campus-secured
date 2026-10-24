'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  successMessage?: string;
  isTouched?: boolean;
  isPassword?: boolean;
  hint?: string;
  badge?: React.ReactNode;
}

export default function AuthInput({
  label,
  id,
  error,
  successMessage,
  isTouched = false,
  isPassword = false,
  hint,
  badge,
  type = 'text',
  className = '',
  required = false,
  value,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const hasError = Boolean(isTouched && error);
  const isSuccess = Boolean(isTouched && !error && value && successMessage);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Border & background classes based on validation state
  let borderClass = 'border-[var(--cs-border)] focus:border-[var(--cs-teal)]';
  if (hasError) {
    borderClass = 'border-[var(--cs-red)] focus:border-[var(--cs-red)] bg-[var(--cs-red)]/[0.04]';
  } else if (isSuccess) {
    borderClass = 'border-[var(--cs-teal)]/60 focus:border-[var(--cs-teal)] bg-[var(--cs-teal)]/[0.03]';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="cs-overline block">
          {label} {required && <span className="text-[var(--cs-red)]">*</span>}
        </label>
        {badge && <div>{badge}</div>}
      </div>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : isSuccess ? `${id}-success` : hint ? `${id}-hint` : undefined}
          className={`cs-input pr-10 font-mono text-sm transition-colors duration-150 ${borderClass} ${className}`}
          {...props}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-auto">
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[var(--cs-muted)] hover:text-[var(--cs-teal)] transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {!isPassword && hasError && (
            <AlertCircle className="w-4 h-4 text-[var(--cs-red-bright)] shrink-0" />
          )}

          {!isPassword && isSuccess && (
            <Check className="w-4 h-4 text-[var(--cs-teal)] shrink-0" />
          )}
        </div>
      </div>

      {/* Realtime validation feedback */}
      {hasError && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-xs font-mono text-[var(--cs-red-bright)] pt-0.5"
          role="alert"
        >
          <span className="font-bold text-[10px] tracking-wider uppercase">[!]</span>
          <span>{error}</span>
        </p>
      )}

      {!hasError && isSuccess && (
        <p
          id={`${id}-success`}
          className="flex items-center gap-1.5 text-xs font-mono text-[var(--cs-teal)] pt-0.5"
        >
          <span className="font-bold text-[10px] tracking-wider uppercase">[✓]</span>
          <span>{successMessage}</span>
        </p>
      )}

      {!hasError && !isSuccess && hint && (
        <p id={`${id}-hint`} className="text-[10px] font-mono text-[var(--cs-muted)] pt-0.5">
          {hint}
        </p>
      )}
    </div>
  );
}
