import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Locale } from '@/lib/i18n';
import { CartView } from './components/CartView';

export const metadata: Metadata = {
  title: 'העגלה | חנות המערכת',
  description: 'סקירת ההזמנה ומעבר לתשלום מאובטח בשקלים.',
};

interface CartPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header locale={locale} />
      <main>
        <CartView locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
