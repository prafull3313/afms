import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'AFMS - Aarogyam Foods Management System',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: '#e46f1a'
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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <script>
          {`if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js').then((registration) => {
              console.log('Service Worker registered:', registration);
            }).catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
          }`}
        </script>
      </body>
    </html>
  );
}