import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RS Savoury Rider Portal',
  description: 'Rider operations portal for Jaipur deliveries'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-light min-h-screen">{children}</body>
    </html>
  );
}