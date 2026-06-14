import { Masthead, Ticker } from '@/components/press';
import {
  Lead,
  Participate,
  Pillars,
  HowItWorks,
  PilotDispatch,
  Colophon,
} from '@/components/press/sections';
import type { Locale } from '@/lib/i18n';

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <div className="np-page">
      <Masthead locale={locale} />
      <Ticker />
      <main>
        <Lead locale={locale} />
        <Participate locale={locale} />
        <Pillars locale={locale} />
        <HowItWorks locale={locale} />
        <PilotDispatch locale={locale} />
      </main>
      <Colophon locale={locale} />
    </div>
  );
}
