import { Metadata } from 'next';
import PassportClient from './PassportClient';

export const metadata: Metadata = {
  title: 'Pickle Passport | RS Savoury',
  description: 'Track your culinary journey with Aunty\'s Pickle Passport. Try all our flavors and earn a free jar of choice. Homemade Rajasthani pickles and delicacies, made with love in Jaipur.',
  openGraph: {
    title: 'Pickle Passport | RS Savoury',
    description: 'Track your culinary journey with Aunty\'s Pickle Passport. Try all our flavors and earn a free jar of choice. Homemade Rajasthani pickles and delicacies, made with love in Jaipur.',
    images: [{ url: '/uploads/keri-ka-khatta.jpg' }],
  },
};

export default function Page() {
  return <PassportClient />;
}
