import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@petradar/ui";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PetRadar Admin CMS",
  description: "Back office for verification, rescue operations, analytics, and CMS content.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
