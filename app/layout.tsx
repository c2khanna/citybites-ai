import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CityBites AI — Intelligent Food & Restaurant Concierge',
  description: 'AI-powered culinary concierge and semantic recommendation engine for Toronto, Waterloo Region, and beyond.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen p-4 md:p-8 antialiased">
        {children}
      </body>
    </html>
  );
}
