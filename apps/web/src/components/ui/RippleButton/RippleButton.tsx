'use client';

import React, { useState, useCallback } from 'react';
import clsx from 'clsx';
import { useReducedMotion } from '@/hooks';
import styles from './RippleButton.module.css';

type RippleSize = 'md' | 'lg' | 'xl';
type RippleTone = 'brand' | 'glass';

interface RippleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  size?: RippleSize;
  tone?: RippleTone;
  isFullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

let rippleSeq = 0;

/**
 * Primary luminous CTA. Brand-gradient fill with a hue glow at rest, a color
 * ripple emitted from the click coordinates, and a tactile press. Ripple is
 * suppressed under reduced motion.
 */
export function RippleButton({
  size = 'lg',
  tone = 'brand',
  isFullWidth = false,
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: RippleButtonProps) {
  const reducedMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!reducedMotion) {
        const r = e.currentTarget.getBoundingClientRect();
        const id = ++rippleSeq;
        setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((rp) => rp.id !== id));
        }, 650);
      }
      onClick?.(e);
    },
    [reducedMotion, onClick]
  );

  return (
    <button
      type={type}
      className={clsx(
        styles.btn,
        styles[tone],
        styles[size],
        isFullWidth && styles.fullWidth,
        className
      )}
      onClick={handleClick}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
      {ripples.map((rp) => (
        <span
          key={rp.id}
          aria-hidden
          className={styles.ripple}
          style={{ left: rp.x, top: rp.y }}
        />
      ))}
    </button>
  );
}
