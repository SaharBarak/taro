'use client';

import { motion } from 'framer-motion';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { GradientText } from '@/components/ui/GradientText';
import { Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations/AnimatedText';
import { useReducedMotion } from '@/hooks';
import styles from './ArchiveHero.module.css';

/** Trophy / wall-of-wins icon. */
function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" strokeLinejoin="round" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 17h6M10 13v4M14 13v4M8 21h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="15" r="5" />
      <path d="M9 10L6 3M15 10l3-7M11 15h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CoinsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const heroStats = [
  { icon: <ResultsIcon />, label: 'הצבעות שהסתיימו', glow: styles.glowBlue },
  { icon: <MedalIcon />, label: 'NFTs שהונפקו', glow: styles.glowPurple },
  { icon: <CoinsIcon />, label: 'כספים שנאספו', glow: styles.glowGreen },
];

export function ArchiveHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.hero}>
      <div className={styles.mesh} aria-hidden />

      <div className={styles.container}>
        <AnimatedFadeInUp delay={0}>
          <Eyebrow className={styles.eyebrow}>
            <span className={styles.eyebrowIcon} aria-hidden>
              <TrophyIcon />
            </span>
            ארכיון הצבעות
          </Eyebrow>
        </AnimatedFadeInUp>

        <h1 className={styles.heading}>
          <GradientText animated>קיר הניצחון</GradientText>
        </h1>

        <AnimatedFadeInUp delay={0.2}>
          <Text size="lg" color="secondary" className={styles.description}>
            הצבעות שהסתיימו, תוצאות שהושגו. כאן תוכלו לראות את כל ההצבעות
            שהשלימו את מסעם - מהרעיון הראשוני ועד להחלטה הסופית.
          </Text>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.3}>
          <div className={styles.stats}>
            {heroStats.map((stat) => (
              <motion.div
                key={stat.label}
                className={styles.statCard}
                whileHover={reducedMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={`${styles.statIcon} ${stat.glow}`} aria-hidden>
                  {stat.icon}
                </span>
                <div className={styles.statValue}>—</div>
                <Text size="sm" color="muted">{stat.label}</Text>
              </motion.div>
            ))}
          </div>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
