'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './NewsButton.module.css';

type NewsVariant = 'red' | 'ink' | 'outline';
type NewsSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: NewsVariant;
  size?: NewsSize;
  className?: string;
  children: React.ReactNode;
  /** Trailing glyph/icon (kept hard-edged, no rounding) */
  trailing?: React.ReactNode;
}

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & { href?: undefined };
type AnchorProps = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & { href: string };

/**
 * Press control surface: hard-cornered block that inverts on hover (ink↔paper,
 * red↔ink). The primary "participate" affordance of the brand.
 */
export function NewsButton(props: ButtonProps | AnchorProps) {
  const { variant = 'red', size = 'md', className, children, trailing, ...rest } = props;
  const cls = clsx(styles.btn, styles[variant], styles[size], className);

  const inner = (
    <>
      <span className={styles.label}>{children}</span>
      {trailing ? <span className={styles.trailing} aria-hidden>{trailing}</span> : null}
    </>
  );

  if ('href' in props && props.href !== undefined) {
    return (
      <a className={cls} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
}
