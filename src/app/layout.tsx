import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { CookieBanner } from "@/components/CookieBanner"; // Import the banner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GutachtenPortal24 - Digitales Gutachten-Management",
  description: "Optimieren Sie Ihre Schadensregulierung. Erstellen Sie Kfz-Gutachten in Minuten, verwalten Sie Dokumente sicher und arbeiten Sie effizienter mit Versicherungen und Werkstätten zusammen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  );
}
