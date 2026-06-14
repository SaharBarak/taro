import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VotesView } from './components/VotesView';
import type { Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'הצבעות פומביות',
  description:
    'צפו בהצבעות פעילות, הצבעות שהסתיימו ותוצאות ברשויות המקומיות בישראל.',
};

interface VotesPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function VotesPage({ params }: VotesPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main>
        <VotesView />
      </main>
      <Footer locale={locale} />
    </>
  );
}
