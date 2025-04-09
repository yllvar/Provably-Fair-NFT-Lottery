import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Solana Fortune Wheel - NFT Lottery",
  description: "Provably fair NFT lottery on Solana with Switchboard VRF",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <WalletProvider>{children}</WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'