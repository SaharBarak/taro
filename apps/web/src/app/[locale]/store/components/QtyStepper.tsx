'use client';

import styles from './QtyStepper.module.css';

interface QtyStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Accessible label for the control group. */
  label?: string;
}

/**
 * Hard-edge mono quantity stepper: [−] [n] [+]. Thumb-friendly tap targets,
 * clamps to [min, max]. Tabular numerals.
 */
export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = 'כמות',
}: QtyStepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const dec = () => onChange(clamp(value - 1));
  const inc = () => onChange(clamp(value + 1));

  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.btn}
        onClick={dec}
        disabled={value <= min}
        aria-label="הפחתת כמות"
      >
        −
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={styles.btn}
        onClick={inc}
        disabled={value >= max}
        aria-label="הוספת כמות"
      >
        +
      </button>
    </div>
  );
}
