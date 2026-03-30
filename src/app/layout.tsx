import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BEYOND ENTERTAINMENT — AI-Powered Entertainment Hub',
  description: 'The ultimate entertainment destination. AI-powered search across 12+ partner sites. Movies, Hit Series, Wrestling, Drama Shorts, Music, Comics & more.',
  icons: { icon: '/favicon.ico' },
  keywords: ['entertainment', 'movies', 'streaming', 'AI search', 'wrestling', 'drama shorts', 'music', 'comics', 'download movies'],
  openGraph: {
    title: 'BEYOND ENTERTAINMENT',
    description: 'AI-Powered Entertainment Hub — Movies, Music, Wrestling, Drama Shorts & 12+ Partner Sites',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-[#050507] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
