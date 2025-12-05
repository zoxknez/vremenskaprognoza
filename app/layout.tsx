import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "VremenskaPrognoza | Vremenska prognoza i kvalitet vazduha",
  description: "Pratite vremensku prognozu, kvalitet vazduha, UV index i mnogo više za gradove širom Balkana i sveta.",
  keywords: ["vremenska prognoza", "kvalitet vazduha", "AQI", "vreme", "meteorologija", "Srbija", "Balkan"],
  authors: [{ name: "VremenskaPrognoza" }],
  openGraph: {
    title: "VremenskaPrognoza | Vremenska prognoza i kvalitet vazduha",
    description: "Pratite vremensku prognozu i kvalitet vazduha u realnom vremenu",
    type: "website",
    locale: "sr_RS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}>
        {/* Noise texture overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        
        {/* Grid pattern background */}
        <div className="fixed inset-0 grid-pattern pointer-events-none" aria-hidden="true" />
        
        {/* Main content */}
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

