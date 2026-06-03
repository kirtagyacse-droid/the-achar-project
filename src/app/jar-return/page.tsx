import { Metadata } from 'next';
import JarReturnClient from './JarReturnClient';

export const metadata: Metadata = {
  title: 'Return Empty Jars | The Achar Project',
  description: 'Participate in our sustainable Jar Return Program. Return 5 empty martabans (jars) for a 10% discount. Homemade Rajasthani Achar, made with love in Jaipur.',
  openGraph: {
    title: 'Return Empty Jars | The Achar Project',
    description: 'Participate in our sustainable Jar Return Program. Return 5 empty martabans (jars) for a 10% discount. Homemade Rajasthani Achar, made with love in Jaipur.',
    images: [{ url: '/uploads/keri-ka-khatta.jpg' }],
  },
};

export default function Page() {
  return <JarReturnClient />;
}
