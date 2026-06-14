'use client';

import { useState } from 'react';
import { NewsButton } from '@/components/press/NewsButton';
import { TallyBar } from './TallyBar';
import styles from './VoteWidget.module.css';

interface Option {
  id: string;
  label: string;
  pct: number;
  count: number;
}

interface VoteWidgetProps {
  kicker?: string;
  place?: string;
  question?: string;
  options?: Option[];
  totalLabel?: string;
  /** WhatsApp / participate destination */
  href?: string;
}

const DEFAULT_OPTIONS: Option[] = [
  { id: 'for', label: 'בעד — להוסיף מעבר חצייה מואר', pct: 72, count: 1247 },
  { id: 'against', label: 'נגד — להשאיר כמו שהוא', pct: 19, count: 329 },
  { id: 'abstain', label: 'נמנע', pct: 9, count: 156 },
];

/**
 * The participation control surface — a live ballot rendered as press
 * furniture. Interactive selection + animated tallies; this is the styling/
 * surface, not the full multi-step flow.
 */
export function VoteWidget({
  kicker = 'הצבעה חיה',
  place = 'קריית טבעון',
  question = 'גינת השכונה ברחוב הרצל — מה עושים?',
  options = DEFAULT_OPTIONS,
  totalLabel = '1,732 קולות מאומתים',
  href = 'https://chat.whatsapp.com/FITvea9IVsn2Ljie1yCrAc',
}: VoteWidgetProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className={styles.widget} aria-label="הצבעה חיה">
      <header className={styles.head}>
        <span className={styles.kicker}>
          <span className={styles.live} aria-hidden />
          {kicker}
        </span>
        <span className={styles.place}>{place} · גיליון 04</span>
      </header>

      <h3 className={styles.question}>{question}</h3>

      <ul className={styles.options}>
        {options.map((o) => {
          const isSel = selected === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                className={`${styles.option} ${isSel ? styles.optionSel : ''}`}
                onClick={() => setSelected(o.id)}
                aria-pressed={isSel}
              >
                <span className={styles.optionTop}>
                  <span className={styles.mark} aria-hidden>{isSel ? '■' : '□'}</span>
                  <span className={styles.optionLabel}>{o.label}</span>
                  <span className={styles.pct}>{o.pct}%</span>
                </span>
                <TallyBar pct={o.pct} selected={isSel} />
                <span className={styles.count}>{o.count.toLocaleString('he-IL')} קולות</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.actions}>
        <NewsButton
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          variant="red"
          size="lg"
          trailing={<span aria-hidden>←</span>}
        >
          {selected ? 'אשרו את הקול · הצביעו' : 'הצביעו · VOTE'}
        </NewsButton>
        <span className={styles.total}>{totalLabel}</span>
      </div>

      <footer className={styles.meta}>
        <span>מאומת · זהות + GPS</span>
        <span className={styles.sep} aria-hidden>■</span>
        <span>חתום בבלוקצ׳יין</span>
        <span className={styles.sep} aria-hidden>■</span>
        <span>בלתי ניתן לזיוף</span>
      </footer>
    </section>
  );
}
