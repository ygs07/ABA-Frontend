import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import { brand } from "@/config/brand";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from 'sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: brand.metaTitleTemplate,
    default: brand.name,
  },
  description: brand.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("h-full scroll-smooth", "antialiased", inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-bg text-text">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
