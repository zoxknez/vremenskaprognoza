import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers/Providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e17" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vremevazduh.space'),
  title: {
    default: "VremeVazduh | Vremenska prognoza i kvalitet vazduha",
    template: "%s | VremeVazduh",
  },
  description: "Pratite vremensku prognozu, kvalitet vazduha, UV index i mnogo više za gradove širom Balkana i sveta.",
  keywords: ["vremenska prognoza", "kvalitet vazduha", "AQI", "vreme", "meteorologija", "Srbija", "Balkan", "PM2.5", "PM10", "vremevazduh"],
  authors: [{ name: "VremeVazduh", url: "https://vremevazduh.space" }],
  creator: "VremeVazduh",
  publisher: "VremeVazduh",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: "https://vremevazduh.space",
    siteName: "VremeVazduh",
    title: "VremeVazduh | Vremenska prognoza i kvalitet vazduha",
    description: "Pratite vremensku prognozu i kvalitet vazduha u realnom vremenu za gradove na Balkanu",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VremeVazduh - Vremenska prognoza i kvalitet vazduha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VremeVazduh | Vremenska prognoza i kvalitet vazduha",
    description: "Pratite vremensku prognozu i kvalitet vazduha u realnom vremenu",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VremeVazduh",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="preconnect" href="https://api.mapbox.com" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {/* Noise texture overlay */}
          <div className="noise-overlay" aria-hidden="true" />
          
          {/* Grid pattern background */}
          <div className="fixed inset-0 grid-pattern pointer-events-none" aria-hidden="true" />
          
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
          >
            Preskoči na glavni sadržaj
          </a>
          
          {/* Main content */}
          <div className="relative min-h-screen flex flex-col">
            <Navigation />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

