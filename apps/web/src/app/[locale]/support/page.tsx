import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SupportHero } from './components/SupportHero';
import { SupportFlow } from './components/SupportFlow';
import type { Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'תמיכה חיצונית | Issue Coins',
  description:
    'תמכו ביוזמות מקומיות בכל מקום בעולם. רכשו Issue Coins והפכו לתומכים אזרחיים.',
};

interface SupportPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main>
        <SupportHero />
        <SupportFlow />
      </main>
      <Footer locale={locale} />
    </>
  );
}
