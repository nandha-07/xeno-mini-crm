import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Xeno Mini CRM",
  description: "Your brand. Your shoppers. One AI that connects them.",
};

import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${outfit.variable} font-sans antialiased bg-background text-foreground flex min-h-screen`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy-client-id"}>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-right" />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
