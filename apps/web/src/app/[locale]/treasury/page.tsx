import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TreasuryHero } from './components/TreasuryHero';
import { TreasuryDashboard } from './components/TreasuryDashboard';
import type { Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'לוח הכפלה | קרן רשותית',
  description:
    'צפו ביתרת הקרן הרשותית, תרומות מקומיות ותמיכה חיצונית - השפעת SocialFi בפעולה.',
};

interface TreasuryPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function TreasuryPage({ params }: TreasuryPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main>
        <TreasuryHero />
        <TreasuryDashboard />
      </main>
      <Footer locale={locale} />
    </>
  );
}
