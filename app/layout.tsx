import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Sandbox - Shared Trip Container",
  description: "Relive the trip without the cleanup",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sandbox",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Clerk publishable key — must be set in env
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkKey) {
    return (
      <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
        <body className="font-sans antialiased bg-sand text-midnight min-h-screen">
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-500">Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
        <body className="font-sans antialiased bg-sand text-midnight min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
