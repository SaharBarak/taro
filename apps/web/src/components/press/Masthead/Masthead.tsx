'use client';

import Link from 'next/link';
import { NewsButton } from '@/components/press/NewsButton';
import type { Locale } from '@/lib/i18n';
import styles from './Masthead.module.css';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc';

interface MastheadProps {
  locale?: Locale;
}

const NAV = [
  { label: 'הצבעות', href: 'votes' },
  { label: 'BAGS', href: 'coin' },
  { label: 'כלכלה אזרחית', href: 'economics' },
  { label: 'שקיפות הקרן', href: 'treasury' },
  { label: 'חנות', href: 'store' },
  { label: 'אודות', href: 'about' },
  { label: 'שאלות נפוצות', href: 'faq' },
];

export function Masthead({ locale = 'he' }: MastheadProps) {
  return (
    <header className={styles.masthead}>
      {/* Edition ears */}
      <div className={styles.ears}>
        <span>יום שבת · 14.06.26</span>
        <span>מהדורת הפיילוט · גיליון 04</span>
        <span>קריית טבעון · ₪3 / הצבעה</span>
      </div>

      <div className={styles.ruleHair} />

      {/* Wordmark row */}
      <div className={styles.brandRow}>
        <span className={styles.tagL}>THE PUBLIC LEDGER</span>
        <Link href={`/${locale}`} className={styles.wordmark}>
          תַּרְאוּ
        </Link>
        <span className={styles.tagR}>מנגנון הקונצנזוס הציבורי</span>
      </div>

      <div className={styles.ruleMast} />

      {/* Nav + participate */}
      <nav className={styles.nav} aria-label="ניווט ראשי">
        <NewsButton href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" variant="red" size="sm">
          קבוצת המייסדים
        </NewsButton>
        <ul className={styles.navList}>
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={`/${locale}/${n.href}`} className={styles.navLink}>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.ruleHair} />
    </header>
  );
}
