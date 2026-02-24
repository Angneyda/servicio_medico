import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import './satoshi.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'SISMED',
  description: 'SISMED',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-satoshi" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
