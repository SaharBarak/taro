import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Locale } from '@/lib/i18n';
import { LegalContent } from './LegalContent';
import styles from './LegalPage.module.css';

export interface LegalSection {
  heading: string;
  /** Paragraphs of body text */
  paragraphs?: string[];
  /** Optional bullet list rendered after the paragraphs */
  bullets?: string[];
}

interface LegalPageProps {
  locale: Locale;
  title: string;
  /** Short lead paragraph under the title */
  intro?: string;
  /** "Last updated" label + date, already localized */
  updated?: string;
  sections: LegalSection[];
}

/**
 * Shared layout for static legal / informational pages
 * (terms, privacy, refund, pricing). RTL-aware via the locale.
 * Server shell — the luminous, interactive body lives in {@link LegalContent}.
 */
export function LegalPage({ locale, title, intro, updated, sections }: LegalPageProps) {
  return (
    <>
      <Header locale={locale} />
      <main className={styles.main}>
        <div className={styles.aura} aria-hidden />
        <div className={styles.container}>
          <LegalContent title={title} intro={intro} updated={updated} sections={sections} />
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
