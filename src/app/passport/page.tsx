import { Metadata } from 'next';
import PassportClient from './PassportClient';

export const metadata: Metadata = {
  title: 'Pickle Passport | The Achar Project',
  description: 'Track your culinary journey with Aunty\'s Pickle Passport. Try all our flavors and earn a free jar of choice. Homemade Rajasthani Achar, made with love in Jaipur.',
  openGraph: {
    title: 'Pickle Passport | The Achar Project',
    description: 'Track your culinary journey with Aunty\'s Pickle Passport. Try all our flavors and earn a free jar of choice. Homemade Rajasthani Achar, made with love in Jaipur.',
    images: [{ url: '/uploads/keri-ka-khatta.jpg' }],
  },
};

export default function Page() {
  return <PassportClient />;
}
