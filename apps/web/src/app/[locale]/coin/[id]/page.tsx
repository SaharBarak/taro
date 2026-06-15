import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CoinDossier } from '../components/CoinDossier';
import type { Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'מטבע קהילה',
  description:
    'תיק מטבע הקהילה — הנושא שהוא מגבה, ההיצע, סכום הגיוס, מחזיקי המטבע והחתימה בבלוקצ׳יין. שקוף ומאומת.',
};

interface CoinDetailPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

export default async function CoinDetailPage({ params }: CoinDetailPageProps) {
  const { locale, id } = await params;

  return (
    <>
      <Header locale={locale} />
      <main>
        <CoinDossier voteId={id} locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
