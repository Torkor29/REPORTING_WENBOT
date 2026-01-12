import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Investor Reporting Hub",
    template: "%s | Investor Hub",
  },
  description: "Plateforme de reporting investisseurs pour bot de trading crypto/markets",
  keywords: ["trading", "crypto", "reporting", "investor", "dashboard"],
  authors: [{ name: "Trading Bot Team" }],
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
