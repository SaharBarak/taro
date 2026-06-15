import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CoinMarket } from './components/CoinMarket';
import type { Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'מטבעות הקהילה',
  description:
    'שוק מטבעות הקהילה של תַּרְאוּ — כל הצבעה יכולה להנפיק Issue Coin שתומכים מגבים בו, והעמלות זורמות 70% לקרן הרשות. שקוף, מאומת, חתום בבלוקצ׳יין.',
};

interface CoinPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function CoinPage({ params }: CoinPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main>
        <CoinMarket locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
