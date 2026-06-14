import { Metadata } from 'next';
import { PricingContent } from './components/PricingContent';

export const metadata: Metadata = {
  title: 'תמחור | תַּרְאוּ',
  description:
    'פשוט, שקוף, בלי הפתעות. ₪3 להשתתפות בהצבעה (₪2 לקרן הקהילתית, ₪1 לתפעול), ₪50 ליצירת הצבעה חדשה. אין מנוי, אין דמי חבר, אין אותיות קטנות.',
};

export default function PricingPage() {
  return <PricingContent />;
}
