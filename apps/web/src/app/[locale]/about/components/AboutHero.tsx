'use client';

import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimatedLetters } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './AboutHero.module.css';

export function AboutHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.hero} aria-label="אודות תַּרְאוּ">
      <div className={styles.mesh} aria-hidden />

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow>אודות תַּרְאוּ</Eyebrow>
        </motion.div>

        <h1 className={styles.heading}>
          <AnimatedLetters text="מקולה של עיר," delay={0.15} />
          <span className={styles.accentLine}>
            <motion.span
              initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              לקולה של <GradientText animated>מדינה.</GradientText>
            </motion.span>
          </span>
        </h1>

        <motion.p
          className={styles.lead}
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.95 }}
        >
          התחלנו מהבנה אחת — לדמוקרטיה המקומית אין כלי מדידה אמין. אנחנו בונים את
          התשתית שהופכת את הקול של הרוב למדיד, מאומת ושקוף, עיר אחר עיר.
        </motion.p>
      </div>
    </section>
  );
}
