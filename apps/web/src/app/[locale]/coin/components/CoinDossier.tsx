'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NewsButton, SealCard } from '@/components/press';
import type { Locale } from '@/lib/i18n';
import { WHATSAPP_LINK, formatCurrency, formatNumber } from './format';
import styles from '../[id]/page.module.css';

interface IssueCoin {
  id: string;
  voteId: string;
  tokenMint: string | null;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals?: number;
  totalSupply: string | null;
  totalPurchased: string | null;
  /** Stored in agorot — divide by 100 for ILS. */
  totalValueILS: number;
  tradingEnabled: boolean;
  isFrozen: boolean;
  launchTxHash?: string | null;
  holderCount: number;
  createdAt?: string;
}

interface Holder {
  id: string;
  displayName: string;
  walletAddress?: string | null;
  tokenAmount: string;
  /** Stored in agorot — divide by 100 for ILS. */
  investedILS: number;
  isLocalResident: boolean;
}

interface VoteInfo {
  title?: string;
  municipality?: string;
  status?: string;
}

interface CoinDossierProps {
  voteId: string;
  locale?: Locale;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'פעילה',
  ended: 'הסתיימה',
  resolving: 'בהכרעה',
  resolved: 'הוכרעה',
  draft: 'טיוטה',
};

const toILS = (agorot: number): number => (Number.isFinite(agorot) ? agorot / 100 : 0);

export function CoinDossier({ voteId, locale = 'he' }: CoinDossierProps) {
  const [coin, setCoin] = useState<IssueCoin | null>(null);
  const [vote, setVote] = useState<VoteInfo | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [coinRes, holdersRes, voteRes] = await Promise.all([
          fetch(`/api/votes/${voteId}/issue-coin`),
          fetch(`/api/votes/${voteId}/issue-coin/holders?limit=100`),
          fetch(`/api/votes/${voteId}`),
        ]);

        if (cancelled) return;

        if (coinRes.ok) {
          const data = await coinRes.json();
          if (!data.issueCoin) {
            setNotFound(true);
          } else {
            setCoin(data.issueCoin);
          }
        } else {
          setNotFound(true);
        }

        if (holdersRes.ok) {
          const data = await holdersRes.json();
          if (!cancelled) setHolders(Array.isArray(data.holders) ? data.holders : []);
        }

        if (voteRes.ok) {
          const data = await voteRes.json();
          const v = data?.vote ?? data;
          if (!cancelled && v) {
            setVote({
              title: v.title,
              municipality: v.municipality ?? v.municipalityId ?? v.municipality_id,
              status: v.status,
            });
          }
        }
      } catch {
        if (!cancelled) setError('לא הצלחנו לטעון את תיק המטבע כרגע.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [voteId]);

  if (loading) return <DossierSkeleton />;

  if (error) {
    return (
      <section className={styles.page}>
        <DossierNotice message={error} />
        <BackLink locale={locale} />
      </section>
    );
  }

  if (notFound || !coin) {
    return (
      <section className={styles.page}>
        <div className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden>
            ▍
          </span>
          <h2 className={styles.emptyTitle}>אין מטבע קהילה להצבעה הזו.</h2>
          <p className={styles.emptyText}>
            ייתכן שההצבעה עדיין לא הנפיקה מטבע, או שהמזהה שגוי. חזרו לשוק או הצטרפו
            לפיילוט.
          </p>
          <div className={styles.emptyActions}>
            <NewsButton href={`/${locale}/coin`} variant="ink" size="md">
              ← לשוק המטבעות
            </NewsButton>
            <NewsButton
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              variant="red"
              size="md"
              trailing={<span aria-hidden>←</span>}
            >
              הצטרפו לפיילוט
            </NewsButton>
          </div>
        </div>
      </section>
    );
  }

  const raisedILS = toILS(coin.totalValueILS);
  const live = coin.tradingEnabled && !coin.isFrozen;
  const statusLabel = vote?.status ? STATUS_LABELS[vote.status] ?? vote.status : '—';

  return (
    <section className={styles.page}>
      {/* Header */}
      <header className={styles.head}>
        <Link className={styles.crumb} href={`/${locale}/coin`}>
          ← שוק המטבעות
        </Link>
        <span className={styles.kicker}>
          <span aria-hidden className={styles.kickerTick} />
          מטבע קהילה · ISSUE COIN
        </span>
        <h1 className={styles.headline}>
          {coin.tokenName} <span className={styles.symbol}>{coin.tokenSymbol}</span>
        </h1>
        <div className={styles.subline}>
          <span className={styles.subTitle}>{vote?.title ?? '—'}</span>
          <span className={styles.subMeta}>
            <span>{vote?.municipality ?? '—'}</span>
            <span className={styles.sep} aria-hidden>
              ■
            </span>
            <span>{statusLabel}</span>
            <span className={styles.sep} aria-hidden>
              ■
            </span>
            <span className={live ? styles.tradeLive : styles.tradeFrozen}>
              {live ? '● נסחר' : '□ קפוא'}
            </span>
          </span>
        </div>
      </header>

      {/* Stats grid */}
      <dl className={styles.stats}>
        <Stat label="גויס · ₪" value={formatCurrency(raisedILS)} accent />
        <Stat label="מחזיקים" value={formatNumber(coin.holderCount)} />
        <Stat
          label="היצע כולל"
          value={coin.totalSupply ? formatNumber(Number(coin.totalSupply)) : '—'}
        />
        <Stat
          label="נרכש"
          value={coin.totalPurchased ? formatNumber(Number(coin.totalPurchased)) : '—'}
        />
      </dl>

      {/* Layout: seal + holders */}
      <div className={styles.body}>
        {/* On-chain mint */}
        <div className={styles.colSeal}>
          <h2 className={styles.sectionTitle}>הטבעה על השרשרת</h2>
          {coin.tokenMint ? (
            <SealCard
              hash={coin.tokenMint}
              status={live ? 'sealed' : 'pending'}
              href={`https://solscan.io/token/${coin.tokenMint}`}
              meta={[
                {
                  label: 'היצע',
                  value: coin.totalSupply ? formatNumber(Number(coin.totalSupply)) : '—',
                },
                { label: 'מחזיקים', value: formatNumber(coin.holderCount) },
                { label: 'מצב', value: live ? 'נסחר' : 'קפוא' },
              ]}
            />
          ) : (
            <div className={styles.noMint}>
              <p>טרם נרשמה כתובת הטבעה על השרשרת.</p>
            </div>
          )}

          {/* How it works */}
          <div className={styles.explainer}>
            <h3 className={styles.explainerTitle}>איך זה עובד</h3>
            <p className={styles.explainerText}>
              לכל הצבעה אפשר להנפיק מטבע קהילה. תושבים מקומיים ותומכים חיצוניים רוכשים את
              המטבע ומגבים את הנושא — וכל עסקה מייצרת עמלה. 70% מהעמלות זורמות לקרן הרשות,
              30% לתפעול הפלטפורמה. המטבע שקוף, סחיר, וחתום בבלוקצ׳יין: הגיבוי לנושא הופך
              ממילים למשאבים אמיתיים.
            </p>
            <div className={styles.explainerLinks}>
              <NewsButton href={`/${locale}/votes/${voteId}`} variant="red" size="md" trailing={<span aria-hidden>←</span>}>
                להצבעה שמאחורי המטבע
              </NewsButton>
              <Link href={`/${locale}/economics`} className={styles.textLink}>
                איך הכלכלה עובדת ←
              </Link>
            </div>
          </div>
        </div>

        {/* Holders ledger */}
        <div className={styles.colHolders}>
          <h2 className={styles.sectionTitle}>
            פנקס המחזיקים
            <span className={styles.holderCount}>{formatNumber(holders.length)}</span>
          </h2>

          {holders.length === 0 ? (
            <div className={styles.ledgerEmpty}>
              <span aria-hidden>□</span> עדיין אין מחזיקים רשומים למטבע הזה.
            </div>
          ) : (
            <div className={styles.ledger}>
              <div className={styles.ledgerHead} aria-hidden>
                <span>מחזיק</span>
                <span>כמות</span>
                <span>הושקע · ₪</span>
              </div>
              <ul className={styles.ledgerRows}>
                {holders.map((h) => (
                  <li key={h.id} className={styles.ledgerRow}>
                    <span className={styles.holderName}>
                      <span
                        className={h.isLocalResident ? styles.resident : styles.external}
                        aria-hidden
                      >
                        {h.isLocalResident ? '✓' : '·'}
                      </span>
                      {h.displayName}
                      <span className={styles.holderTag}>
                        {h.isLocalResident ? 'תושב מאומת' : 'חיצוני'}
                      </span>
                    </span>
                    <span className={styles.holderAmount}>
                      {formatNumber(Number(h.tokenAmount))}
                    </span>
                    <span className={styles.holderInvested}>
                      {formatCurrency(toILS(h.investedILS))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pieces ---------- */

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`${styles.stat} ${accent ? styles.statAccent : ''}`}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>{value}</dd>
    </div>
  );
}

function BackLink({ locale }: { locale: Locale }) {
  return (
    <Link className={styles.crumb} href={`/${locale}/coin`}>
      ← שוק המטבעות
    </Link>
  );
}

function DossierNotice({ message }: { message: string }) {
  return (
    <div className={styles.notice}>
      <span className={styles.noticeGlyph} aria-hidden>
        ✕
      </span>
      <p className={styles.noticeText}>{message}</p>
    </div>
  );
}

function DossierSkeleton() {
  return (
    <section className={styles.page} aria-busy="true" aria-label="טוען">
      <div className={styles.head}>
        <span className={`${styles.skel} ${styles.skelSm}`} />
        <span className={`${styles.skel} ${styles.skelTitle}`} />
      </div>
      <div className={styles.stats}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.stat}>
            <span className={`${styles.skel} ${styles.skelSm}`} />
            <span className={`${styles.skel} ${styles.skelMd}`} />
          </div>
        ))}
      </div>
      <div className={styles.body}>
        <div className={`${styles.skel} ${styles.skelBlock}`} />
        <div className={`${styles.skel} ${styles.skelBlock}`} />
      </div>
    </section>
  );
}
