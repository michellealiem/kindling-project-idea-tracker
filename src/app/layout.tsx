import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthGate } from '@/components/AuthGate';
import { AppProvider } from '@/components/AppProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Idea Forge | Project Tracker',
  description: 'Track your ideas from spark to shipped. Build to explore.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthGate>
          <AppProvider>{children}</AppProvider>
        </AuthGate>
      </body>
    </html>
  );
}
