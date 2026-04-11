import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { SidebarProvider } from "@/components/Layout/SidebarContext";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

import { getDefaultMeta } from "@/lib/seo";

export const metadata: Metadata = getDefaultMeta();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to set dark mode BEFORE paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('cw-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        {/* Ambient background orbs */}
        <div className="bg-orb bg-orb--blue" aria-hidden="true" />
        <div className="bg-orb bg-orb--purple" aria-hidden="true" />
        <div className="bg-orb bg-orb--green" aria-hidden="true" />

        {/* Main content */}
        <SidebarProvider>
          <div className="relative z-10 flex flex-col min-h-full flex-1">
            <Navbar />
            <div className="flex flex-1">{children}</div>
            <Footer />
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
