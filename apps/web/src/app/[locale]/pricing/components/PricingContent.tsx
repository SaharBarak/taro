'use client';

import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { GlassCard } from '@/components/ui/GlassCard';
import { RippleButton } from '@/components/ui/RippleButton';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Text, Heading } from '@/components/ui/Typography';
import { AnimatedFadeInUp, AnimatedWords } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './PricingContent.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;
const WHATSAPP_URL = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc';

/** Shekel mark — clean inline glyph, no emoji. */
function Shekel({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      ₪
    </span>
  );
}

/** Small reusable check glyph for the "no fine print" strip. */
function Check() {
  return (
    <svg className={styles.trustCheck} viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TRUST_ITEMS = ['אין מנוי', 'אין דמי חבר', 'אין אותיות קטנות'] as const;

/**
 * Pricing — "Luminous Civic" restyle. Two premium glass price cards:
 * (1) ₪3 vote participation with the ₪2 (community fund, green) / ₪1
 * (operations, blue) split rendered as a proportional bar; (2) ₪50 to create
 * a new vote, framed as spam prevention + quality funding. Closes with a
 * jargon-free trust strip and a WhatsApp CTA.
 *
 * Hebrew-only, RTL logical props, transform/opacity choreography only. Isolated
 * client leaf; every reveal + the split bar pause under reduced motion.
 */
export function PricingContent() {
  const reduced = useReducedMotion();

  return (
    <main className={styles.page} dir="rtl">
      <span className={styles.auraBlue} aria-hidden />
      <span className={styles.auraPurple} aria-hidden />

      <div className={styles.container}>
        {/* ---------- Header ---------- */}
        <header className={styles.head}>
          <AnimatedFadeInUp>
            <Eyebrow>תמחור</Eyebrow>
          </AnimatedFadeInUp>

          <Heading level={1} className={styles.title}>
            <AnimatedWords text="פשוט, שקוף," />
            <span className={styles.titleAccent}>
              <GradientText variant="brand" animated>
                בלי הפתעות.
              </GradientText>
            </span>
          </Heading>

          <AnimatedFadeInUp delay={0.1}>
            <Text as="p" size="lg" color="secondary" className={styles.lead}>
              <Shekel className={styles.inlineShekel} />3 להשתתפות בהצבעה (
              <Shekel className={styles.inlineShekel} />2 לקרן הקהילתית,{' '}
              <Shekel className={styles.inlineShekel} />1 לתפעול).{' '}
              <Shekel className={styles.inlineShekel} />50 ליצירת הצבעה חדשה. אין מנוי, אין דמי
              חבר, אין אותיות קטנות.
            </Text>
          </AnimatedFadeInUp>
        </header>

        {/* ---------- Two price cards ---------- */}
        <div className={styles.cards}>
          {/* Card 1 — ₪3 participation */}
          <AnimatedFadeInUp delay={0.12} className={styles.cardWrap}>
            <GlassCard variant="spotlight" glow="green" className={styles.priceCard}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrowTag}>השתתפות בהצבעה</span>
                <span className={`${styles.price} ${styles.priceGreen}`}>
                  <Shekel className={styles.priceShekel} />3
                </span>
              </div>

              <Text as="p" size="base" color="secondary" className={styles.cardBody}>
                עמלה חד-פעמית להצבעה מאומתת בנושא מקומי. כל שקל הולך למקום ברור:
              </Text>

              {/* Proportional split bar: 2/3 fund (green) + 1/3 ops (blue) */}
              <div
                className={styles.bar}
                role="img"
                aria-label="מתוך שלושה שקלים: שני שקלים לקרן הקהילתית, שקל אחד לתפעול"
              >
                <motion.div
                  className={styles.barFund}
                  initial={reduced ? false : { transform: 'scaleX(0)' }}
                  whileInView={{ transform: 'scaleX(1)' }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                >
                  <span className={styles.barLabel}>
                    <Shekel className={styles.barShekel} />2
                  </span>
                </motion.div>
                <motion.div
                  className={styles.barOps}
                  initial={reduced ? false : { transform: 'scaleX(0)' }}
                  whileInView={{ transform: 'scaleX(1)' }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.55, ease: EASE, delay: 0.45 }}
                >
                  <span className={styles.barLabel}>
                    <Shekel className={styles.barShekel} />1
                  </span>
                </motion.div>
              </div>

              <ul className={styles.splitList}>
                <li className={styles.splitItem}>
                  <span className={`${styles.splitDot} ${styles.dotGreen}`} aria-hidden />
                  <span className={styles.splitAmount}>
                    <Shekel className={styles.splitShekel} />2
                  </span>
                  <span className={styles.splitText}>לקרן הקהילתית</span>
                </li>
                <li className={styles.splitItem}>
                  <span className={`${styles.splitDot} ${styles.dotBlue}`} aria-hidden />
                  <span className={styles.splitAmount}>
                    <Shekel className={styles.splitShekel} />1
                  </span>
                  <span className={styles.splitText}>לתפעול ופיתוח</span>
                </li>
              </ul>
            </GlassCard>
          </AnimatedFadeInUp>

          {/* Card 2 — ₪50 create a vote */}
          <AnimatedFadeInUp delay={0.22} className={styles.cardWrap}>
            <GlassCard variant="spotlight" glow="purple" className={styles.priceCard}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrowTag}>יצירת הצבעה חדשה</span>
                <span className={`${styles.price} ${styles.pricePurple}`}>
                  <Shekel className={styles.priceShekel} />50
                </span>
              </div>

              <Text as="p" size="base" color="secondary" className={styles.cardBody}>
                עמלה חד-פעמית לפרסום הצבעה חדשה ברשות שלכם — כולל אפשרויות הבחירה ולוח הזמנים
                לסיום.
              </Text>

              <ul className={styles.reasonList}>
                <li className={styles.reasonItem}>
                  <span className={styles.reasonIcon} aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className={styles.reasonText}>מונע ספאם והצבעות שלא נועדו ברצינות.</span>
                </li>
                <li className={styles.reasonItem}>
                  <span className={styles.reasonIcon} aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        d="M4 13a8 8 0 0 1 16 0M9 13a3 3 0 0 1 6 0M12 13v6M9 19h6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className={styles.reasonText}>
                    שומר על איכות: כל הצבעה היא נושא אמיתי שמישהו עומד מאחוריו.
                  </span>
                </li>
              </ul>
            </GlassCard>
          </AnimatedFadeInUp>
        </div>

        {/* ---------- Trust strip ---------- */}
        <AnimatedFadeInUp delay={0.18} className={styles.trustWrap}>
          <div className={styles.trustStrip}>
            <span className={styles.trustHead}>אין אותיות קטנות</span>
            <ul className={styles.trustList}>
              {TRUST_ITEMS.map((item) => (
                <li key={item} className={styles.trustItem}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </AnimatedFadeInUp>

        {/* ---------- CTA ---------- */}
        <AnimatedFadeInUp delay={0.24} className={styles.ctaWrap}>
          <Heading level={2} className={styles.ctaTitle}>
            רוצים לשמוע עוד?
          </Heading>
          <Text as="p" size="base" color="secondary" className={styles.ctaBody}>
            הצטרפו לקהילה ב-WhatsApp — בלי התחייבות, בלי תשלום.
          </Text>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaLink}
          >
            <RippleButton size="lg">הצטרפו לקהילה ב-WhatsApp</RippleButton>
          </a>
        </AnimatedFadeInUp>
      </div>
    </main>
  );
}
