import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import PrivyProvider from "@/components/PrivyProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Payos | Home",
  description: "Pay employees on any chain with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} antialiased min-h-screen flex flex-col`}
      >
        <PrivyProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </PrivyProvider>
      </body>
    </html>
  );
}
