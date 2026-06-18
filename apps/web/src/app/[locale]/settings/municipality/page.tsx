'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NewsButton } from '@/components/press/NewsButton';
import { PressSelect } from '@/components/press/PressSelect/PressSelect';
import { MUNICIPALITIES } from '@sync/shared';
import type { UserProfile } from '@sync/shared';
import styles from './page.module.css';

const REDIRECT = '/sign-in?redirect=/settings/municipality';

const MUNICIPALITY_OPTIONS = MUNICIPALITIES.map((m) => ({ value: m, label: m }));

function MunicipalityContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [municipality, setMunicipality] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(REDIRECT);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const { profile: p } = (await response.json()) as { profile: UserProfile };
          setProfile(p);
          setMunicipality(p.municipality ?? '');
        } else {
          setErrorMessage('שגיאה בטעינת הפרופיל');
        }
      } catch {
        setErrorMessage('שגיאה בטעינת הפרופיל');
      } finally {
        setDataLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSave = async () => {
    if (!municipality) return;
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipality }),
      });

      if (response.ok) {
        const { profile: p } = (await response.json()) as { profile: UserProfile };
        setProfile(p);
        setSuccessMessage('הרשות המקומית עודכנה בהצלחה.');
        await refreshSession();
      } else {
        const err = await response.json().catch(() => ({}));
        setErrorMessage(err.error || 'שגיאה בשמירה');
      }
    } catch {
      setErrorMessage('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || dataLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} aria-hidden />
        <p>טוען…</p>
      </div>
    );
  }

  const changed = municipality !== (profile?.municipality ?? '');

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.head}>
            <span className={styles.kicker}>
              <span aria-hidden className={styles.kickerTick} />
              רשות מקומית · MUNICIPALITY
            </span>
            <h1 className={styles.title}>
              הרשות <span className={styles.red}>שלכם.</span>
            </h1>
            <p className={styles.standfirst}>
              הרשות המקומית היא העוגן האזרחי שלכם — היא קובעת אילו הצבעות רלוונטיות
              עבורכם ואיפה קולכם נספר.
            </p>
          </header>

          {successMessage && (
            <div className={`${styles.message} ${styles.success}`} role="status">
              <span aria-hidden className={styles.msgGlyph}>
                ✓
              </span>
              <p>{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} aria-label="סגור">
                ✕
              </button>
            </div>
          )}

          {errorMessage && (
            <div className={`${styles.message} ${styles.error}`} role="alert">
              <span aria-hidden className={styles.msgGlyph}>
                ✕
              </span>
              <p>{errorMessage}</p>
              <button onClick={() => setErrorMessage(null)} aria-label="סגור">
                ✕
              </button>
            </div>
          )}

          <section className={styles.formCard}>
            <PressSelect
              label="רשות מקומית"
              placeholder="בחרו רשות"
              options={MUNICIPALITY_OPTIONS}
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
            />

            <div className={styles.formActions}>
              <NewsButton
                variant="red"
                size="lg"
                onClick={handleSave}
                disabled={saving || !municipality || !changed}
              >
                {saving ? 'שומר…' : 'שמירת שינויים'}
              </NewsButton>
            </div>
          </section>

          <div className={styles.backLink}>
            <NewsButton
              variant="outline"
              size="md"
              onClick={() => router.push('/dashboard')}
              trailing={<span aria-hidden>←</span>}
            >
              חזרה ללוח הבקרה
            </NewsButton>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Cast Suspense for React 19 type compatibility
const SuspenseWrapper = Suspense as any;

export default function MunicipalitySettingsPage() {
  return (
    <SuspenseWrapper
      fallback={
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} aria-hidden />
          <p>טוען…</p>
        </div>
      }
    >
      <MunicipalityContent />
    </SuspenseWrapper>
  );
}
