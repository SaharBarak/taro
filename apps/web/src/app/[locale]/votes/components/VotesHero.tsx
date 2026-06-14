'use client';

import { motion } from 'framer-motion';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { GradientText } from '@/components/ui/GradientText';
import { AnimatedFadeInUp, AnimatedWords } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import type { VoteFilter } from './types';
import styles from './VotesHero.module.css';

const filters: { value: VoteFilter; label: string }[] = [
  { value: 'all', label: 'הכל' },
  { value: 'active', label: 'פעילות' },
  { value: 'ended', label: 'הסתיימו' },
  { value: 'pending', label: 'ממתינות' },
];

interface VotesHeroProps {
  activeFilter: VoteFilter;
  onFilterChange: (filter: VoteFilter) => void;
}

export function VotesHero({ activeFilter, onFilterChange }: VotesHeroProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.hero}>
      <div className={styles.mesh} aria-hidden />

      <div className={styles.container}>
        <AnimatedFadeInUp>
          <Eyebrow live className={styles.eyebrow}>
            הצבעות פומביות — קריית טבעון
          </Eyebrow>
        </AnimatedFadeInUp>

        <h1 className={styles.heading}>
          <span className={styles.headingTop}>
            <AnimatedWords text="מה על הפרק" delay={0.1} />
          </span>
          <span className={styles.accentLine}>
            <motion.span
              initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <GradientText animated>בקהילה שלכם.</GradientText>
            </motion.span>
          </span>
        </h1>

        <AnimatedFadeInUp delay={0.3}>
          <p className={styles.description}>
            כל הנושאים הפעילים במקום אחד — תוצאות בזמן אמת, גלויות לכולם.
          </p>
        </AnimatedFadeInUp>

        {/* Filter Pills */}
        <motion.div
          className={styles.filters}
          role="tablist"
          aria-label="סינון הצבעות"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.filterPill} ${isActive ? styles.active : ''}`}
                onClick={() => onFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
