import type { Metadata } from 'next';
import { esMX } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  weight: ['400'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://millonariosapp.vercel.app'),
  applicationName: 'Divisas App',
  title: 'Divisas App — Panel de Control',
  description: 'Panel de control para envíos y conversión de divisas',
  openGraph: {
    title: 'Divisas App — Panel de Control',
    description: 'Panel de control para envíos y conversión de divisas',
    url: 'https://millonariosapp.vercel.app',
    siteName: 'Divisas App',
    images: [
      {
        url: '/logo.png',
        width: 1220,
        height: 913,
        alt: 'Divisas App',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Divisas App — Panel de Control',
    description: 'Panel de control para envíos y conversión de divisas',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-bg0">
        <ClerkProvider localization={esMX}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
