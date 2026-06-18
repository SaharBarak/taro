import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getProductBySlug, MERCH_CATALOG } from '@/lib/merch/catalog';
import type { Locale } from '@/lib/i18n';
import { ProductDetail } from '../components/ProductDetail';

interface ProductPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export function generateStaticParams() {
  return MERCH_CATALOG.filter((p) => p.active).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'מוצר לא נמצא | תַּרְאוּ' };
  return {
    title: `${product.name} | חנות המערכת`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <>
      <Header locale={locale} />
      <main>
        <ProductDetail product={product} locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
