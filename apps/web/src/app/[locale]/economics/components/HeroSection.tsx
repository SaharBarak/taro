'use client';

import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Text } from '@/components/ui/Typography';
import { AnimatedLetters, AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './HeroSection.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section className={styles.hero} aria-labelledby="econ-hero-title">
      <span className={styles.auraBlue} aria-hidden />
      <span className={styles.auraGreen} aria-hidden />
      <span className={styles.auraPurple} aria-hidden />

      <div className={styles.container}>
        <div className={styles.content}>
          <AnimatedFadeInUp>
            <Eyebrow>הכלכלה האזרחית של תַּרְאוּ</Eyebrow>
          </AnimatedFadeInUp>

          <h1 id="econ-hero-title" className={styles.heading}>
            <AnimatedLetters text="איך 3 שקלים בונים" delay={0.15} />
            <span className={styles.headingAccent}>
              <motion.span
                initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: reduced ? 0 : 0.6, ease: EASE }}
              >
                <GradientText animated>קהילה שמשפיעה.</GradientText>
              </motion.span>
            </span>
          </h1>

          <AnimatedFadeInUp delay={0.4}>
            <Text as="p" size="lg" color="secondary" className={styles.description}>
              כל הצבעה מזרימה כסף לקרן קהילתית ייעודית (Issue Coin) שמשרתת את הנושא עצמו.
              ככל שיותר תושבים תומכים — כך לנושא יותר משאבים אמיתיים מאחוריו. שקיפות מלאה,
              כל עסקה גלויה.
            </Text>
          </AnimatedFadeInUp>
        </div>

        <AnimatedFadeInUp delay={0.5} className={styles.visualWrap}>
          <div
            className={styles.flow}
            role="img"
            aria-label="שלושה שקלים זורמים אל קרן קהילתית ואל השפעה אמיתית"
          >
            <div className={`${styles.node} ${styles.nodeBlue}`}>
              <span className={styles.nodeAmount}>
                <span className={styles.shekel} aria-hidden>
                  ₪
                </span>
                3
              </span>
              <span className={styles.nodeLabel}>הצבעה</span>
            </div>

            <svg className={styles.connector} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path
                d="M19 12H5M11 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className={`${styles.node} ${styles.nodeGreen}`}>
              <span className={styles.nodeIcon} aria-hidden>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    d="M12 3v18M7 7h7a3 3 0 0 1 0 6H7m0 0h8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className={styles.nodeLabel}>קרן קהילתית</span>
            </div>

            <svg className={styles.connector} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path
                d="M19 12H5M11 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className={`${styles.node} ${styles.nodePurple}`}>
              <span className={styles.nodeIcon} aria-hidden>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    d="M4 19V9m5 10V5m5 14v-7m5 7V11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className={styles.nodeLabel}>השפעה אמיתית</span>
            </div>
          </div>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
