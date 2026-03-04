import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Q SQL - Real-time SQL Editor & Playground",
  description: "An open-source real-time SQL editor with full RDBMS functionality, powered by Supabase.",
  keywords: ["sql", "editor", "supabase", "database", "playground", "rdbms", "open-source"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col milky-bg">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
