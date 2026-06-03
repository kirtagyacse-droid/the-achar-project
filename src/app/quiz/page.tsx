import { Metadata } from 'next';
import QuizClient from './QuizClient';

export const metadata: Metadata = {
  title: 'Find Your Pickle | The Achar Project',
  description: 'Take Aunty\'s interactive flavor quiz to find your perfect Rajasthani pickle match. Homemade Rajasthani Achar, made with love in Jaipur.',
  openGraph: {
    title: 'Find Your Pickle | The Achar Project',
    description: 'Take Aunty\'s interactive flavor quiz to find your perfect Rajasthani pickle match. Homemade Rajasthani Achar, made with love in Jaipur.',
    images: [{ url: '/uploads/keri-ka-khatta.jpg' }],
  },
};

export default function Page() {
  return <QuizClient />;
}
