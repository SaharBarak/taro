'use client';

import { motion } from 'framer-motion';
import { Heading, Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations/AnimatedText';
import styles from './SupportHero.module.css';

export function SupportHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <AnimatedFadeInUp delay={0}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🌍</span>
            <span>תמיכה חיצונית</span>
          </div>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.1}>
          <Heading level={1} className={styles.heading}>
            תמכו ביוזמות מקומיות
          </Heading>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.2}>
          <Text size="lg" color="secondary" className={styles.description}>
            גם אם אינכם תושבי הרשות, תוכלו לתמוך ביוזמות מקומיות דרך Issue Coins.
            כל רכישה תורמת ישירות לקרן הרשות ומזכה אתכם ב-NFT של &quot;תומך אזרחי&quot;.
          </Text>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.3}>
          <div className={styles.steps}>
            <motion.div
              className={styles.stepCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <Text weight="semibold">חברו ארנק</Text>
                <Text size="sm" color="muted">
                  Phantom או Solflare
                </Text>
              </div>
            </motion.div>

            <div className={styles.stepArrow}>→</div>

            <motion.div
              className={styles.stepCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <Text weight="semibold">בחרו יוזמה</Text>
                <Text size="sm" color="muted">
                  מכל רשות בישראל
                </Text>
              </div>
            </motion.div>

            <div className={styles.stepArrow}>→</div>

            <motion.div
              className={styles.stepCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <Text weight="semibold">רכשו טוקנים</Text>
                <Text size="sm" color="muted">
                  Issue Coins ב-SOL
                </Text>
              </div>
            </motion.div>

            <div className={styles.stepArrow}>→</div>

            <motion.div
              className={styles.stepCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <Text weight="semibold">קבלו NFT</Text>
                <Text size="sm" color="muted">
                  תומך אזרחי
                </Text>
              </div>
            </motion.div>
          </div>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
