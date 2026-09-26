import type { Metadata } from 'next';
import AdminClientLayout from './AdminClientLayout';

export const metadata: Metadata = {
  title: 'Admin Portal',
  description: 'Internal platform administration and system governance.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
