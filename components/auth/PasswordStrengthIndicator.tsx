'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { PasswordValidationResult } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
  showWhenEmpty?: boolean;
}

export default function PasswordStrengthIndicator({
  validation,
  showWhenEmpty = false,
}: PasswordStrengthIndicatorProps) {
  const { score, level, checks, error } = validation;

  if (level === 'empty' && !showWhenEmpty) {
    return null;
  }

  // Level badge styling
  let badgeText = 'NOT SET';
  let badgeClass = 'text-[var(--cs-muted)] border-[var(--cs-border)] bg-transparent';

  if (level === 'weak') {
    badgeText = 'WEAK';
    badgeClass = 'cs-pill-red';
  } else if (level === 'fair') {
    badgeText = 'FAIR';
    badgeClass = 'text-amber-400 border-amber-400/40 bg-amber-400/10 font-bold';
  } else if (level === 'strong') {
    badgeText = 'STRONG';
    badgeClass = 'cs-pill-green';
  }

  // Checklist criteria items
  const criteria = [
    { label: '8+ chars', passed: checks.minLength },
    { label: 'Letter (a-z)', passed: checks.hasLetter },
    { label: 'Number (0-9)', passed: checks.hasNumber },
    { label: 'Symbol / case', passed: checks.hasSpecial || (checks.hasUpper && checks.hasLower) },
  ];

  return (
    <div className="space-y-2.5 p-3 rounded-none bg-[var(--cs-surface-alt)] border border-[var(--cs-border)] font-mono text-xs">
      {/* Header: Label & Strength Level */}
      <div className="flex justify-between items-center">
        <span className="cs-overline text-[9px]">SECURITY RATING</span>
        <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 border ${badgeClass}`}>
          {badgeText}
        </span>
      </div>

      {/* Segmented Strength Bar */}
      <div className="grid grid-cols-3 gap-1.5 h-1.5">
        <div
          className={`h-full transition-all duration-200 ${
            score >= 1
              ? score === 1
                ? 'bg-[var(--cs-red)]'
                : score === 2
                ? 'bg-amber-400'
                : 'bg-[var(--cs-green)]'
              : 'bg-[var(--cs-border)]'
          }`}
        />
        <div
          className={`h-full transition-all duration-200 ${
            score >= 2
              ? score === 2
                ? 'bg-amber-400'
                : 'bg-[var(--cs-green)]'
              : 'bg-[var(--cs-border)]'
          }`}
        />
        <div
          className={`h-full transition-all duration-200 ${
            score >= 3 ? 'bg-[var(--cs-green-bright)]' : 'bg-[var(--cs-border)]'
          }`}
        />
      </div>

      {/* Realtime Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {criteria.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-1.5 text-[11px] px-2 py-1 border transition-colors ${
              item.passed
                ? 'border-[var(--cs-green)]/40 bg-[var(--cs-green)]/10 text-[var(--cs-green-bright)]'
                : 'border-[var(--cs-border)]/70 bg-black/30 text-[var(--cs-muted)]'
            }`}
          >
            {item.passed ? (
              <Check className="w-3 h-3 text-[var(--cs-green)] shrink-0" />
            ) : (
              <span className="w-3 h-3 text-center leading-3 text-[10px] text-[var(--cs-muted)] shrink-0">
                ·
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Helper message: only show guidance when invalid/error */}
      {error && (
        <p className="text-[10px] pt-0.5 text-[var(--cs-red-bright)] font-mono">
          [!] {error}
        </p>
      )}
    </div>
  );
}
