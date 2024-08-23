import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'conversAI',
  description: '--',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider publishableKey='pk_test_bW9kZXN0LXBob2VuaXgtNzUuY2xlcmsuYWNjb3VudHMuZGV2JA'>
      <html lang="en" className={inter.className}>
        <body className="bg-white flex flex-col gap-4">
          {children}
          <Analytics />  
        </body>
      </html>
    </ClerkProvider>
  );
}
