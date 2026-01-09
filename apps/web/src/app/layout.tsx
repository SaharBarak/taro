import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import { LenisProvider } from '@/providers/LenisProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'תֵּרָאוּ | הצבעות קהילתיות מקומיות',
    template: '%s | תֵּרָאוּ',
  },
  description:
    'פלטפורמה לקבלת החלטות קהילתיות ברשויות המקומיות בישראל. הצביעו על נושאים מקומיים, עקבו אחרי החלטות, והשפיעו על הקהילה שלכם.',
  keywords: [
    'הצבעות',
    'קהילה',
    'רשויות מקומיות',
    'דמוקרטיה',
    'ישראל',
    'בלוקצ׳יין',
    'תראו',
  ],
  authors: [{ name: 'Taro' }],
  creator: 'Taro',
  publisher: 'Taro',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://taro.co.il',
    siteName: 'תֵּרָאוּ',
    title: 'תֵּרָאוּ | הצבעות קהילתיות מקומיות',
    description:
      'פלטפורמה לקבלת החלטות קהילתיות ברשויות המקומיות בישראל.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'תֵּרָאוּ - הצבעות קהילתיות',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'תֵּרָאוּ | הצבעות קהילתיות מקומיות',
    description:
      'פלטפורמה לקבלת החלטות קהילתיות ברשויות המקומיות בישראל.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <AuthProvider>
          <LenisProvider>{children}</LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
