import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';

// Firebase Auth uses browser APIs — disable static prerendering
export const dynamic = 'force-dynamic';

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });


export const metadata: Metadata = {
  title: 'AI Project Tracker — Transform Documents into Requirements',
  description:
    'AI-powered project management tool that transforms documents into structured requirements with real-time team collaboration, colour-coded edits, and role-based access control.',
  keywords: 'project management, AI, requirements extraction, collaboration, real-time',
  openGraph: {
    title: 'AI Project Tracker',
    description: 'Transform documents into structured project requirements with AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  boxShadow: 'var(--shadow-md)',
                },
                duration: 3000,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
