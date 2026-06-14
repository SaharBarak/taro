'use client';

import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Text, Heading } from '@/components/ui/Typography';
import { AnimatedFadeInUp, AnimatedWords } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './TreasuryHero.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Shekel mark — clean inline glyph, no emoji. */
function Shekel({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      ₪
    </span>
  );
}

interface Rule {
  accent: 'blue' | 'green' | 'purple';
  title: string;
  text: string;
  icon: React.ReactNode;
}

const RULES: Rule[] = [
  {
    accent: 'green',
    title: 'שקיפות מלאה',
    text: 'כל הכנסה וכל הוצאה מתועדות בזמן אמת — פתוחות לבדיקה של כל תושב, בלי חדרים סגורים.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    accent: 'blue',
    title: 'אישור הקהילה',
    text: 'הוצאות מעל סף מסוים אינן יוצאות לדרך ללא הצבעת אישור של הקהילה. הרוב מחליט גם על ההוצאה.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <path
          d="M9 12.5l2.2 2.2L15.5 10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3l7 3v5c0 4.4-2.9 7.9-7 9-4.1-1.1-7-4.6-7-9V6l7-3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    accent: 'purple',
    title: 'ביקורת עצמאית',
    text: 'הקרן עוברת ביקורת חשבונאית עצמאית מדי שנה — גורם חיצוני שמאמת שכל שקל במקומו.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
        <path
          d="M7 4h7l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M13 4v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path
          d="M9 13l1.8 1.8L14.5 11"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function TreasuryHero() {
  const reduced = useReducedMotion();

  return (
    <section className={styles.hero} aria-labelledby="treasury-hero-title">
      <span className={styles.auraGreen} aria-hidden />
      <span className={styles.auraBlue} aria-hidden />

      <div className={styles.container}>
        <header className={styles.head}>
          <AnimatedFadeInUp>
            <Eyebrow>שקיפות הקרן</Eyebrow>
          </AnimatedFadeInUp>

          <Heading level={1} id="treasury-hero-title" className={styles.heading}>
            <AnimatedWords text="כל שקל בקרן —" />
            <span className={styles.headingAccent}>
              <GradientText variant="green" animated>
                גלוי לעין.
              </GradientText>
            </span>
          </Heading>

          <AnimatedFadeInUp delay={0.1}>
            <Text as="p" size="lg" color="secondary" className={styles.description}>
              הקרן הקהילתית פתוחה לבדיקה: כל הכנסה וכל הוצאה מתועדות בזמן אמת. הוצאות
              מעל סף מסוים דורשות אישור הקהילה, והקרן עוברת ביקורת חשבונאית עצמאית.
            </Text>
          </AnimatedFadeInUp>
        </header>

        <ul className={styles.rules}>
          {RULES.map((rule, i) => (
            <motion.li
              key={rule.title}
              className={`${styles.rule} ${styles[`rule_${rule.accent}`]}`}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.1 }}
            >
              <span className={`${styles.ruleIcon} ${styles[`icon_${rule.accent}`]}`}>
                {rule.icon}
              </span>
              <h2 className={styles.ruleTitle}>{rule.title}</h2>
              <p className={styles.ruleText}>{rule.text}</p>
            </motion.li>
          ))}
        </ul>

        <AnimatedFadeInUp delay={0.2} className={styles.trust}>
          <span className={styles.trustIcon} aria-hidden>
            <Shekel />
          </span>
          <Text as="p" size="base" weight="medium" className={styles.trustText}>
            הכסף שלכם נשאר בקהילה — ואתם רואים בדיוק לאן הוא הולך.
          </Text>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
