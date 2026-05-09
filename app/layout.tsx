import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import React from 'react';
import { Toaster } from '@/ui/components/ui/sonner';
import { Providers } from '@/ui/components/providers';
import { TooltipProvider } from '@/ui/components/ui/tooltip';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Учет инвентаря',
  description: 'Система управления праздничным инвентарем',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster position="top-center" duration={3000} />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
