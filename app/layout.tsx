import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar, Footer } from "@/components/layout/Navigation";

const inter = Inter({ 
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "AirQuality Balkan Monitor | Praćenje kvaliteta vazduha",
    template: "%s | AirQuality Balkan",
  },
  description: "Najsavremenija aplikacija za praćenje kvaliteta vazduha na Balkanu u realnom vremenu. Podaci za Srbiju, Hrvatsku, BiH, Crnu Goru i druge zemlje.",
  keywords: [
    "zagadjenost vazduha", 
    "kvalitet vazduha", 
    "Balkan", 
    "Srbija", 
    "AQI", 
    "PM2.5", 
    "PM10",
    "air quality",
    "pollution",
    "real-time monitoring"
  ],
  authors: [{ name: "AirQuality Team", url: "https://github.com/zoxknez" }],
  creator: "AirQuality Team",
  openGraph: {
    title: "AirQuality Balkan Monitor",
    description: "Praćenje kvaliteta vazduha u realnom vremenu na Balkanu",
    type: "website",
    locale: "sr_RS",
    siteName: "AirQuality Balkan",
  },
  twitter: {
    card: "summary_large_image",
    title: "AirQuality Balkan Monitor",
    description: "Praćenje kvaliteta vazduha u realnom vremenu na Balkanu",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-background font-sans antialiased">
        <ThemeProvider defaultTheme="system" storageKey="air-quality-theme">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

