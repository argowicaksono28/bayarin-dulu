import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { AppShell } from "@/components/layout/AppShell"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Bayarin Dulu",
  description: "Split bills with friends, hassle-free",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
