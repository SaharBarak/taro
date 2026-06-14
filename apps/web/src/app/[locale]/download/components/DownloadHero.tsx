'use client';

import { motion } from 'framer-motion';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { RippleButton } from '@/components/ui/RippleButton';
import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimatedLetters } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './DownloadHero.module.css';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc';

const ease = [0.22, 1, 0.36, 1] as const;

export function DownloadHero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={styles.hero}>
      <div className={styles.mesh} aria-hidden />

      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <Eyebrow live>פיילוט קריית טבעון · חי</Eyebrow>
          </motion.div>

          <h1 className={styles.heading}>
            <AnimatedLetters text="תַּרְאוּ בכיס שלכם —" delay={0.15} />
            <span className={styles.accentLine}>
              <motion.span
                initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.7, ease }}
              >
                <GradientText animated>בקרוב.</GradientText>
              </motion.span>
            </span>
          </h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease }}
          >
            האפליקציה תהיה זמינה ב-App Store וב-Google Play לקראת ההצבעה הראשונה.
            בינתיים — הצטרפו לוואטסאפ הפיילוט ותהיו הראשונים לדעת כשהיא יוצאת.
          </motion.p>

          <motion.div
            className={styles.primary}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05, ease }}
          >
            <MagneticButton>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryLink}
              >
                <RippleButton size="xl">
                  <span className={styles.primaryLabel}>
                    <svg
                      className={styles.whatsappIcon}
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden
                    >
                      <path
                        fill="currentColor"
                        d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.47-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.5-.17-.01-.37-.01-.56-.01-.2 0-.51.07-.78.37-.27.3-1.02 1-1.02 2.42 0 1.43 1.04 2.8 1.19 3 .15.2 2.05 3.13 4.96 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.74-.71 1.98-1.4.24-.69.24-1.28.17-1.4-.07-.13-.27-.2-.57-.35M12.04 2.5C6.81 2.5 2.56 6.75 2.56 11.98c0 1.67.44 3.3 1.27 4.74L2.5 21.5l4.92-1.29a9.4 9.4 0 0 0 4.61 1.18h.01c5.23 0 9.48-4.25 9.48-9.48S17.27 2.5 12.04 2.5"
                      />
                    </svg>
                    הצטרפו לוואטסאפ הפיילוט
                  </span>
                </RippleButton>
              </a>
            </MagneticButton>
          </motion.div>

          {/* Store badges — disabled "coming soon" state */}
          <motion.div
            className={styles.stores}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease }}
            aria-label="חנויות אפליקציות — בקרוב"
          >
            <span className={styles.storeBadge} aria-disabled="true">
              <svg viewBox="0 0 24 24" className={styles.storeIcon} aria-hidden>
                <path
                  fill="currentColor"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              <span className={styles.storeText}>
                <span className={styles.storeName}>App Store</span>
                <span className={styles.storeState}>בקרוב</span>
              </span>
            </span>

            <span className={styles.storeBadge} aria-disabled="true">
              <svg viewBox="0 0 24 24" className={styles.storeIcon} aria-hidden>
                <path
                  fill="currentColor"
                  d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35m13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31M6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z"
                />
              </svg>
              <span className={styles.storeText}>
                <span className={styles.storeName}>Google Play</span>
                <span className={styles.storeState}>בקרוב</span>
              </span>
            </span>
          </motion.div>
        </div>

        {/* Glass app preview */}
        <motion.div
          className={styles.visual}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reducedMotion ? 0 : 0.5, ease }}
          aria-hidden
        >
          <div className={styles.phone}>
            <span className={styles.phoneGlow} aria-hidden />
            <div className={styles.phoneScreen}>
              <div className={styles.appBar}>
                <span className={styles.appTitle}>תַּרְאוּ</span>
                <span className={styles.appLive}>
                  <span className={styles.appLiveDot} />
                  חי
                </span>
              </div>

              <div className={styles.appCard}>
                <span className={styles.appCardEyebrow}>הצבעה פעילה</span>
                <span className={styles.appCardLine} />
                <span className={[styles.appCardLine, styles.short].join(' ')} />
                <div className={styles.appMeter}>
                  <span className={styles.appMeterFill} />
                </div>
              </div>

              <div className={styles.appRow}>
                <span className={styles.appPill} />
                <span className={styles.appCheck}>
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                    <path
                      d="M5 13l4 4 10-10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  מאומת
                </span>
              </div>

              <div className={styles.appNav}>
                <span className={styles.appNavDot} />
                <span className={styles.appNavDot} />
                <span className={styles.appNavDot} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
