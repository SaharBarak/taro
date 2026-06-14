'use client';

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading, Text } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: 'למה לא פשוט לתרום ישירות?',
    answer:
      'כי Issue Coins יוצרים שוק. אתה לא רק תורם — אתה מחזיק נכס שמייצג את התמיכה שלך. אם יותר אנשים תומכים, הנכס שלך שווה יותר. זה יוצר תמריץ לשתף ולהפיץ את הנושא.',
  },
  {
    question: 'מה קורה לכסף?',
    answer:
      '70% זורם ישירות לקרן הקהילתית. 30% מממן את הפלטפורמה. הכל שקוף על הבלוקצ\'יין — אפשר לראות כל עסקה בזמן אמת.',
  },
  {
    question: 'האם זה קריפטו?',
    answer:
      'כן, אבל אתה לא צריך לדעת כלום על קריפטו כדי להשתמש. תושבים משלמים בשקלים רגילים דרך כרטיס אשראי. הקריפטו עובד מאחורי הקלעים כדי להבטיח שקיפות ואבטחה.',
  },
  {
    question: 'מה אם אני לא גר בישראל?',
    answer:
      'מצוין! אפשר לתמוך בקהילות ישראליות מכל מקום בעולם דרך Issue Coins. צריך ארנק קריפטו ומטבע לרכישה. כשההצבעה מסתיימת — מתקבלת תעודת "תומך קהילתי".',
  },
  {
    question: 'מה זו התעודה הדיגיטלית ולמה אני צריך אותה?',
    answer:
      'התעודה (NFT) היא "תעודת זהות דיגיטלית" שמוכיחה שהשתתפת בהצבעה ספציפית. היא נשארת איתך לתמיד ומראה את המחויבות האזרחית שלך. ערכה יכול לעלות ככל שהפלטפורמה גדלה.',
  },
  {
    question: 'איך הפלטפורמה מרוויחה כסף?',
    answer:
      '30% מעמלות המסחר ומתשלומי ההצבעות. אנחנו לא תלויים במשקיעים חיצוניים — המודל הכלכלי מתקיים מעצמו מהיום הראשון.',
  },
  {
    question: 'מה קורה כשההצבעה מסתיימת?',
    answer:
      'כשהצבעה מסתיימת: ה-Issue Coin נקפא (אי אפשר לסחור בו יותר), הכספים מועברים לקרן הקהילתית, ותעודות דיגיטליות מונפקות לכל המשתתפים — "מצביע מאומת" לתושבים ו"תומך קהילתי" לתומכים החיצוניים.',
  },
  {
    question: 'האם זה בטוח?',
    answer:
      'כן. אנחנו משתמשים בטכנולוגיית בלוקצ\'יין מוכחת, תשלומים מאובטחים דרך Merchant of Record, ואימות זהות באמצעות Google ו-GPS. כל הקוד פתוח לביקורת.',
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
  reduced,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  reduced: boolean;
}) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}>
      <button
        id={buttonId}
        className={styles.faqQuestion}
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span>{question}</span>
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
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const reduced = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <AnimatedFadeInUp>
            <Eyebrow>שאלות נפוצות</Eyebrow>
          </AnimatedFadeInUp>
          <Heading level={2} id="faq-title" className={styles.title}>
            כל מה שרציתם לשאול על הכלכלה האזרחית
          </Heading>
          <AnimatedFadeInUp delay={0.1}>
            <Text as="p" size="lg" color="secondary" className={styles.subtitle}>
              בלי ז&apos;רגון, בלי אותיות קטנות — התשובות הישירות.
            </Text>
          </AnimatedFadeInUp>
        </header>

        <AnimatedFadeInUp delay={0.1} className={styles.faqList}>
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              reduced={reduced}
            />
          ))}
        </AnimatedFadeInUp>
      </div>
    </section>
  );
}
