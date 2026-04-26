import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFMS - Agricultural Grain Management',
  description: 'Track and manage customer grain entries efficiently',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AFMS'
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#e46f1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AFMS" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <script>
          {`if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js');
          }`}
        </script>
      </body>
    </html>
  );
}