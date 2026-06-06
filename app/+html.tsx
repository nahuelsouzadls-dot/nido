import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Standard theme color (Android Chrome + Safari tab bar) */}
        <meta name="theme-color" content="#6B2D3E" />

        {/* iOS standalone PWA — these three tags together make iOS create a
            native-looking home screen app instead of a browser bookmark.
            apple-touch-icon: home screen icon (must match a real asset).
            apple-mobile-web-app-capable: enables standalone mode on iOS.
            apple-mobile-web-app-status-bar-style: "black-translucent" lets the
            app draw behind the status bar; SafeAreaView edges handle the inset. */}
        <link rel="apple-touch-icon" href="/assets/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Nido" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Android Chrome standalone */}
        <meta name="mobile-web-app-capable" content="yes" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
