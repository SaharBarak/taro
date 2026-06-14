'use client';

import { useState, useId, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/components/ui/Typography';
import { RippleButton } from '@/components/ui/RippleButton';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import {
  faqData,
  faqCategories,
  faqCategoryOrder,
  type FAQItem,
  type FAQCategory,
} from '../data/faqData';
import styles from './FAQList.module.css';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc';

/** Per-category accent — one accent owns each chapter (design system §1). */
const categoryAccent: Record<FAQCategory, string> = {
  general: styles.accentBlue,
  voting: styles.accentBlue,
  payments: styles.accentGreen,
  security: styles.accentPurple,
  legal: styles.accentAmber,
  account: styles.accentBlue,
};

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  reduced,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  reduced: boolean;
}) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button
        id={buttonId}
        className={styles.faqQuestion}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span>{item.question}</span>
        <span className={styles.faqIcon} aria-hidden>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path
              className={styles.faqIconV}
              d="M12 5v14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className={styles.faqAnswer}
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQList() {
  const reduced = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(faqData[0]?.id ?? null);

  const grouped = useMemo(
    () =>
      faqCategoryOrder
        .map((category) => ({
          category,
          items: faqData.filter((item) => item.category === category),
        }))
        .filter((group) => group.items.length > 0),
    []
  );

  return (
    <section className={styles.faqSection} aria-labelledby="faq-list-title">
      <div className={styles.container}>
        <h2 id="faq-list-title" className={styles.srOnly}>
          רשימת שאלות נפוצות
        </h2>

        {grouped.map((group, groupIndex) => (
          <div key={group.category} className={styles.group}>
            <AnimatedFadeInUp delay={0.04 * groupIndex}>
              <span className={`${styles.chip} ${categoryAccent[group.category]}`}>
                {faqCategories[group.category]}
              </span>
            </AnimatedFadeInUp>

            <div className={styles.accordionList}>
              {group.items.map((item, index) => (
                <AnimatedFadeInUp key={item.id} delay={0.04 * index}>
                  <FAQAccordionItem
                    item={item}
                    isOpen={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                    reduced={reduced}
                  />
                </AnimatedFadeInUp>
              ))}
            </div>
          </div>
        ))}

        <AnimatedFadeInUp delay={0.1} className={styles.cta}>
          <Heading level={2} className={styles.ctaTitle}>
            לא מצאתם תשובה?
          </Heading>
          <Text as="p" size="lg" color="secondary" className={styles.ctaText}>
            דברו איתנו ישירות בקבוצת הוואטסאפ — נשמח לעזור.
          </Text>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaLink}
          >
            <RippleButton size="lg">דברו איתנו בוואטסאפ</RippleButton>
          </a>
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
