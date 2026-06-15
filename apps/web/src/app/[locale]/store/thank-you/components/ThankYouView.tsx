'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NewsButton, Receipt } from '@/components/press';
import { useMerchCartStore } from '@/stores/merchCartStore';
import type { Locale } from '@/lib/i18n';
import styles from './ThankYouView.module.css';

interface ThankYouViewProps {
  locale: Locale;
}

export function ThankYouView({ locale }: ThankYouViewProps) {
  const searchParams = useSearchParams();
  const clear = useMerchCartStore((s) => s.clear);

  const orderId = searchParams.get('order') ?? '—';

  // Order is placed; empty the cart so a refresh/back doesn't re-show it.
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className={styles.thanks}>
      <div className={styles.inner}>
        <span className={styles.kicker}>
          <span aria-hidden className={styles.kickerTick} />
          אישור הזמנה · CONFIRMED
        </span>

        <h1 className={styles.headline}>
          ההזמנה <span className={styles.red}>התקבלה.</span>
        </h1>

        <p className={styles.standfirst}>
          תודה. ההזמנה נקלטה והתשלום אושר. שותף ההדפסה-לפי-הזמנה מתחיל בהכנה, וחשבונית
          מס כבר בדרך למייל שלכם.
        </p>

        <Receipt
          className={styles.receipt}
          kicker="פרטי הזמנה · ORDER"
          rows={[
            { label: 'מספר הזמנה', value: orderId },
            { label: 'סטטוס', value: 'שולם · בהכנה', strong: true },
          ]}
          footer="שילוח תוך 7–14 ימי עסקים · חשבונית מס נשלחה במייל."
        />

        <div className={styles.actions}>
          <NewsButton
            href={`/${locale}/store`}
            variant="red"
            size="lg"
            trailing={<span aria-hidden>←</span>}
          >
            חזרה לחנות
          </NewsButton>
        </div>
      </div>
    </div>
  );
}
