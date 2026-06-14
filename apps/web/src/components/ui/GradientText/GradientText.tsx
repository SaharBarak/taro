import React from 'react';
import clsx from 'clsx';
import styles from './GradientText.module.css';

type GradientVariant = 'brand' | 'blue' | 'green' | 'purple' | 'amber';

interface GradientTextProps {
  children: React.ReactNode;
  variant?: GradientVariant;
  /** Render as a different element (default span) */
  as?: React.ElementType;
  className?: string;
  /** Animate the gradient sweeping across the text */
  animated?: boolean;
}

/**
 * Brand-gradient text. Usage guard: keep to <=1 per viewport (design system §3).
 */
export function GradientText({
  children,
  variant = 'brand',
  as: Tag = 'span',
  className,
  animated = false,
}: GradientTextProps) {
  return (
    <Tag
      className={clsx(
        styles.gradient,
        styles[variant],
        animated && styles.animated,
        className
      )}
    >
      {children}
    </Tag>
  );
}
