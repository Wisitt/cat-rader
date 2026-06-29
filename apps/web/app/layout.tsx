import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@petradar/ui";
import { LocaleProvider } from "@/lib/i18n";
import { AppLocalizationBridge } from "@/components/app-localization-bridge";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PetRadar — Community Animal Sighting & Lost Pet Platform",
  description:
    "Report stray and injured animals, find lost pets, and coordinate rescues in your community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <LocaleProvider><AppLocalizationBridge><ToastProvider>{children}</ToastProvider></AppLocalizationBridge></LocaleProvider>
      </body>
    </html>
  );
}
