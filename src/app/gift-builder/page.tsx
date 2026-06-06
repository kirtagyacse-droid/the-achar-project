import { Metadata } from 'next';
import GiftBuilderClient from './GiftBuilderClient';

export const metadata: Metadata = {
  title: 'Build a Gift Box | RS Savoury',
  description: 'Curate your own premium Rajasthani pickle gift box. Select 2-6 pickles, wrapping styles, and add a custom letter. Homemade Rajasthani pickles and delicacies, made with love in Jaipur.',
  openGraph: {
    title: 'Build a Gift Box | RS Savoury',
    description: 'Curate your own premium Rajasthani pickle gift box. Select 2-6 pickles, wrapping styles, and add a custom letter. Homemade Rajasthani pickles and delicacies, made with love in Jaipur.',
    images: [{ url: '/uploads/keri-ka-khatta.jpg' }],
  },
};

export default function Page() {
  return <GiftBuilderClient />;
}
