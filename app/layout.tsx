  "use client"
  import type { Metadata } from "next";
  import localFont from "next/font/local";
  import "./globals.css";
  import { SessionProvider } from "next-auth/react";
  import type { Session } from "next-auth";
  import { useEffect, useState } from "react";
  import { Toaster } from "@/components/ui/sonner"
import SessionRefreshProvider from "@/components/elements/session/session-refresh-provider";
import { Inter } from "next/font/google"
 
const inter = Inter({ subsets: ["latin"] })
  const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
  });
  const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
  });

  

  export default function RootLayout({
    children,
    session,
  }: Readonly<{
    children: React.ReactNode;
    session?: Session | null;
  }>) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    return (
      <html lang="en">
        <body className={inter.className}>
        <SessionProvider session={session}>
          <SessionRefreshProvider>{children}</SessionRefreshProvider>
        </SessionProvider>
      </body>
      </html>
      
    );
  }
  
