import { Metadata } from 'next';
import SubscribeClient from './SubscribeClient';

export const metadata: Metadata = {
  title: 'Join the Achar Club | The Achar Project',
  description: 'Subscribe to the Achar Club to get fresh, sun-matured jars of Aunty\'s pickles delivered to your door every month. Homemade Rajasthani Achar, made with love in Jaipur.',
  openGraph: {
    title: 'Join the Achar Club | The Achar Project',
    description: 'Subscribe to the Achar Club to get fresh, sun-matured jars of Aunty\'s pickles delivered to your door every month. Homemade Rajasthani Achar, made with love in Jaipur.',
    images: [{ url: '/uploads/keri-ka-khatta.jpg' }],
  },
};

export default function Page() {
  return <SubscribeClient />;
}
