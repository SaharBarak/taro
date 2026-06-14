'use client';

import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading, Text } from '@/components/ui/Typography';
import { RippleButton } from '@/components/ui/RippleButton';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { AnimatedFadeInUp } from '@/components/animations';
import type { Locale } from '@/lib/i18n';
import styles from './CTASection.module.css';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc';

interface CTASectionProps {
  locale: Locale;
}

const trustStats = [
  { value: '₪3', label: 'עלות הצבעה' },
  { value: '70%', label: 'לקרן הקהילתית' },
  { value: 'תעודה', label: 'לכל משתתף' },
];

export function CTASection(_props: CTASectionProps) {
  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <span className={styles.mesh} aria-hidden />

      <div className={styles.container}>
        <div className={styles.content}>
          <AnimatedFadeInUp>
            <Eyebrow>פיילוט חי בקריית טבעון</Eyebrow>
          </AnimatedFadeInUp>

          <Heading level={2} id="cta-title" className={styles.title}>
            מוכנים להפוך{' '}
            <GradientText variant="brand" animated>
              3 שקלים
            </GradientText>{' '}
            לכוח קהילתי?
          </Heading>

          <AnimatedFadeInUp delay={0.1}>
            <Text as="p" size="lg" color="secondary" className={styles.subtitle}>
              הצטרפו לקהילת התושבים שבונה את הקרן הראשונה. הצטרפות חינם, בלי התחייבות.
            </Text>
          </AnimatedFadeInUp>

          <AnimatedFadeInUp delay={0.2} className={styles.actions}>
            <MagneticButton>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryLink}
              >
                <RippleButton size="xl">הצטרפו לפיילוט בוואטסאפ</RippleButton>
              </a>
            </MagneticButton>
          </AnimatedFadeInUp>

          <AnimatedFadeInUp delay={0.3} className={styles.stats}>
            {trustStats.map((stat, index) => (
              <div key={stat.label} className={styles.statItem}>
                {index > 0 && <span className={styles.statDivider} aria-hidden />}
                <span className={styles.statBlock}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </span>
              </div>
            ))}
          </AnimatedFadeInUp>
        </div>
      </div>
    </section>
  );
}
