'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './Mission.module.css';

type Accent = 'blue' | 'green' | 'purple' | 'amber';

interface Value {
  key: string;
  title: string;
  description: string;
  accent: Accent;
  glyph: React.ReactNode;
}

const VALUES: Value[] = [
  {
    key: 'transparency',
    title: 'שקיפות מלאה',
    description:
      'כל הצבעה נרשמת בבלוקצ׳יין באופן פומבי ובלתי הפיך. אין חדרים סגורים ואין מקום לזיוף.',
    accent: 'blue',
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24Z" stroke="currentColor" strokeWidth="2.4" fill="none" opacity="0.5" />
        <circle cx="24" cy="24" r="6.5" fill="currentColor" opacity="0.18" />
        <circle cx="24" cy="24" r="6.5" stroke="currentColor" strokeWidth="2.4" fill="none" />
      </svg>
    ),
  },
  {
    key: 'security',
    title: 'אבטחה ללא פשרות',
    description:
      'אימות רב-שכבתי מבטיח שכל קול הוא תושב אמיתי אחד — מאומת, ייחודי ובלתי ניתן לערעור.',
    accent: 'green',
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M24 5l15 6v11c0 10-6.5 17-15 21-8.5-4-15-11-15-21V11z" fill="currentColor" opacity="0.16" />
        <path d="M24 5l15 6v11c0 10-6.5 17-15 21-8.5-4-15-11-15-21V11z" stroke="currentColor" strokeWidth="2.2" />
        <path d="M17 24l5 5 10-11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'access',
    title: 'נגישות לכולם',
    description:
      'ממשק פשוט ובהיר שמאפשר לכל תושב להשתתף — בלי קשר לרקע טכנולוגי, מהטלפון, בכמה דקות.',
    accent: 'purple',
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="16" cy="17" r="6" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <circle cx="32" cy="17" r="5" stroke="currentColor" strokeWidth="2.2" fill="none" opacity="0.55" />
        <path d="M6 40c0-6 4.5-10 10-10s10 4 10 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M28 32c5 0 9 3.6 9 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.55" />
      </svg>
    ),
  },
  {
    key: 'continuous',
    title: 'מדידה מתמשכת',
    description:
      'לא פעם בארבע שנים — אלא בכל יום שיש בו החלטה. תמונת מצב חיה שהמועצה לא יכולה להתעלם ממנה.',
    accent: 'amber',
    glyph: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="28" width="7" height="14" rx="2" fill="currentColor" opacity="0.35" />
        <rect x="20.5" y="18" width="7" height="24" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="35" y="8" width="7" height="34" rx="2" fill="currentColor" />
      </svg>
    ),
  },
];

export function Mission() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={`${styles.mission} lc-band-tint`} aria-label="המשימה שלנו">
      <div className={styles.inner}>
        <div className={styles.lead}>
          <Eyebrow className={styles.eyebrow}>המשימה שלנו</Eyebrow>

          <AnimatedFadeInUp>
            <Heading level={2} weight="extrabold" className={styles.headline}>
              למדוד, לאמת ולהנגיש את עמדת הרוב.
            </Heading>
          </AnimatedFadeInUp>

          <AnimatedFadeInUp delay={0.1}>
            <p className={styles.sub}>
              תַּרְאוּ הוא מנגנון קונצנזוס ציבורי. המטרה פשוטה: למדוד היכן עומד רוב
              הציבור, לאמת שכל קול הוא תושב אמיתי אחד, ולהנגיש את התמונה לכולם —
              בשקיפות מלאה.
            </p>
          </AnimatedFadeInUp>

          <AnimatedFadeInUp delay={0.18}>
            <p className={styles.sub}>
              לא דרך נציגים, אלא ישירות. לא באופן אנונימי, אלא כתושבים מאומתים שקולם
              נשמע ונספר.
            </p>
          </AnimatedFadeInUp>
        </div>

        <div className={styles.valuesGrid}>
          {VALUES.map((value, i) => (
            <motion.div
              key={value.key}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard
                variant="interactive"
                glow={value.accent}
                className={`${styles.valueCard} ${styles[`accent_${value.accent}`]}`}
              >
                <span className={styles.glyph}>{value.glyph}</span>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueLine}>{value.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
