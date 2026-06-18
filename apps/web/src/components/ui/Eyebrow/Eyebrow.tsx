import React from 'react';
import clsx from 'clsx';
import styles from './Eyebrow.module.css';

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  /** Show the live breathing dot instead of the gradient dot */
  live?: boolean;
}

/** Letterspaced label with a gradient (or live) dot prefix. */
export function Eyebrow({ children, className, live = false }: EyebrowProps) {
  return (
    <span className={clsx(styles.eyebrow, className)}>
      <span aria-hidden className={clsx(styles.dot, live && styles.live)} />
      {children}
    </span>
  );
}
