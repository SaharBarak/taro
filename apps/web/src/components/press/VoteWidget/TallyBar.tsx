'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks';
import styles from './VoteWidget.module.css';

interface TallyBarProps {
  pct: number;
  selected?: boolean;
}

/** Hard-rectangle red tally bar on a cream track; fills on view. */
export function TallyBar({ pct, selected = false }: TallyBarProps) {
  const reduced = useReducedMotion();
  return (
    <div className={styles.track} aria-hidden>
      <motion.div
        className={`${styles.fill} ${selected ? styles.fillSelected : ''}`}
        initial={reduced ? false : { width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: reduced ? 0 : 0.7, ease: [0.2, 0, 0, 1] }}
      />
    </div>
  );
}
