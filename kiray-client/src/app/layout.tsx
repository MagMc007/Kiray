import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Kiray | Peer-to-Peer Rental Marketplace in Addis Ababa',
    template: '%s | Kiray',
  },
  description:
    'Rent directly from verified homeowners across Addis Ababa without brokers or commission fees.',
  keywords: [
    'Kiray',
    'Addis Ababa rentals',
    'Ethiopia real estate',
    'peer-to-peer rental',
    'apartments Addis Ababa',
    'houses for rent',
    'no broker fees',
  ],
  openGraph: {
    title: 'Kiray | Peer-to-Peer Rental Marketplace',
    description:
      'Rent directly from verified homeowners across Addis Ababa without brokers or commission fees.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Kiray',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiray | Peer-to-Peer Rental Marketplace',
    description:
      'Rent directly from verified homeowners across Addis Ababa without brokers or commission fees.',
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[#fafaf9] text-[#1e293b] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
