'use client';

import { motion } from 'framer-motion';
import { Heading, Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations/AnimatedText';
import styles from './ArchiveHero.module.css';

export function ArchiveHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <AnimatedFadeInUp delay={0}>
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🏆</span>
            <span>ארכיון הצבעות</span>
          </div>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.1}>
          <Heading level={1} className={styles.heading}>
            קיר הניצחון
          </Heading>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.2}>
          <Text size="lg" color="secondary" className={styles.description}>
            הצבעות שהסתיימו, תוצאות שהושגו. כאן תוכלו לראות את כל ההצבעות
            שהשלימו את מסעם - מהרעיון הראשוני ועד להחלטה הסופית.
          </Text>
        </AnimatedFadeInUp>

        <AnimatedFadeInUp delay={0.3}>
          <div className={styles.stats}>
            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statValue}>--</div>
              <Text size="sm" color="muted">הצבעות שהסתיימו</Text>
            </motion.div>

            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.statIcon}>🎖️</div>
              <div className={styles.statValue}>--</div>
              <Text size="sm" color="muted">NFTs שהונפקו</Text>
            </motion.div>

            <motion.div
              className={styles.statCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statValue}>--</div>
              <Text size="sm" color="muted">כספים שנאספו</Text>
            </motion.div>
          </div>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
