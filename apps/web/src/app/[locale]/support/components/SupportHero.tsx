'use client';

import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimatedLetters } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './SupportHero.module.css';

const EASE_BRAND = [0.22, 1, 0.36, 1] as const;

export function SupportHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.hero}>
      <div className={styles.mesh} aria-hidden />

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_BRAND }}
        >
          <Eyebrow>מרכז התמיכה · אנשים אמיתיים</Eyebrow>
        </motion.div>

        <h1 className={styles.heading}>
          <AnimatedLetters text="יש שאלה?" delay={0.15} />
          <span className={styles.accentLine}>
            <motion.span
              initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.6, ease: EASE_BRAND }}
            >
              <GradientText animated={!reducedMotion}>יש תשובה.</GradientText>
            </motion.span>
          </span>
        </h1>

        <motion.p
          className={styles.lead}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: EASE_BRAND }}
        >
          כל מה שרציתם לדעת על הצבעה, אימות, כסף ופרטיות — במקום אחד. לא מצאתם?
          כתבו לנו בוואטסאפ, אנחנו אנשים אמיתיים.
        </motion.p>
      </div>
    </section>
  );
}
