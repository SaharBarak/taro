'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Text } from '@/components/ui/Typography';
import { useReducedMotion } from '@/hooks';
import styles from './AppFeatures.module.css';

type Accent = 'blue' | 'green' | 'purple' | 'amber';

interface Feature {
  accent: Accent;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: Feature[] = [
  {
    accent: 'blue',
    title: 'הצבעות בזמן אמת',
    description: 'עקבו אחרי תמונת המצב המתעדכנת וקבלו התראה על כל הצבעה חדשה ברשות שלכם.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 19V11M12 19V5M19 19v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    accent: 'green',
    title: 'אימות מיקום',
    description: 'אימות GPS פשוט מבטיח שרק תושבי המקום מצביעים — בלי זיופים, בלי כפילויות.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    accent: 'purple',
    title: 'מאומת ובלתי ניתן לזיוף',
    description: 'כל הצבעה נחתמת ונרשמת בשרשרת ציבורית פתוחה לביקורת — שקיפות מלאה, מקצה לקצה.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    accent: 'amber',
    title: 'בעברית, על המובייל',
    description: 'ממשק נקי ומלא בעברית, מותאם RTL ולכף היד — להשפיע על הקהילה בכמה הקשות.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="7" y="3" width="10" height="18" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function AppFeatures() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease }}
        >
          <Eyebrow>מה באפליקציה</Eyebrow>
          <h2 className={styles.heading}>כל מה שצריך כדי שהקול שלכם ייספר</h2>
          <Text size="lg" color="secondary" className={styles.lead}>
            השתתפות בקבלת החלטות מקומיות — מאומתת, שקופה ובקצות האצבעות.
          </Text>
        </motion.div>

        <div className={styles.bento}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={[styles.cell, styles[feature.accent]].join(' ')}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: reducedMotion ? 0 : index * 0.1, ease }}
            >
              <GlassCard variant="interactive" glow={feature.accent} className={styles.card}>
                <span className={styles.icon} aria-hidden>
                  {feature.icon}
                </span>
                <h3 className={styles.title}>{feature.title}</h3>
                <Text size="sm" color="secondary" className={styles.body}>
                  {feature.description}
                </Text>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
