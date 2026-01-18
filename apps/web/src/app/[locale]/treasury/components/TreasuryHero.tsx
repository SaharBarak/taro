'use client';

import { motion } from 'framer-motion';
import { Heading, Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations/AnimatedText';
import styles from './TreasuryHero.module.css';

export function TreasuryHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <AnimatedFadeInUp delay={0}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>💰</span>
            <span>קרן רשותית</span>
          </div>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.1}>
          <Heading level={1} className={styles.heading}>
            לוח הכפלה
          </Heading>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.2}>
          <Text size="lg" color="secondary" className={styles.description}>
            כאן תוכלו לראות כיצד כספי הקהילה והתמיכה החיצונית מתאחדים ליצירת השפעה
            אמיתית. כל שקל שנתרם על ידי תושבים מקבל חיזוק מתומכים חיצוניים דרך מערכת Issue Coins.
          </Text>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.3}>
          <div className={styles.multiplierDemo}>
            <motion.div
              className={styles.multiplierCard}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className={styles.multiplierLabel}>מכפיל SocialFi</div>
              <div className={styles.multiplierValue}>
                <span className={styles.multiplierNumber}>1.5</span>
                <span className={styles.multiplierX}>x</span>
              </div>
              <Text size="sm" color="muted" className={styles.multiplierSubtext}>
                על כל ₪1 מקומי, מתקבל עוד ₪0.50 מתומכים חיצוניים
              </Text>
            </motion.div>
          </div>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
