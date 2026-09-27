import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Rental Properties in Addis Ababa',
  description:
    'Find and compare verified rental apartments, villas, and houses in Addis Ababa directly from homeowners without broker fees.',
  openGraph: {
    title: 'Browse Rental Properties in Addis Ababa | Kiray',
    description:
      'Find and compare verified rental apartments, villas, and houses in Addis Ababa directly from homeowners without broker fees.',
  },
};

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
