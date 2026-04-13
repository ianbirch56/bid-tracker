import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/shared/design/globals.css';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Sidebar } from '@/shared/components/Sidebar/Sidebar';
import { ToastProvider } from '@/shared/components/Toast/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Funding Bid Tracker',
  description: 'Enterprise Tracking for Funding, Grants, and Tenders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              <Sidebar />
              <main style={{ flex: 1, padding: '40px', height: '100vh', overflowY: 'auto' }}>
                {children}
              </main>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
