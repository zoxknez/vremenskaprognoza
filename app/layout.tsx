import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Zagadjenost vazduha na Balkanu",
  description: "Najsavremenija aplikacija za praćenje kvaliteta vazduha na Balkanu",
  keywords: ["zagadjenost vazduha", "kvalitet vazduha", "Balkan", "Srbija", "AQI", "PM2.5", "PM10"],
  authors: [{ name: "o0o0o0o", url: "https://github.com/zoxknez" }],
  openGraph: {
    title: "Zagadjenost vazduha na Balkanu",
    description: "Praćenje kvaliteta vazduha u realnom vremenu na Balkanu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="air-quality-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

