import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { CartProvider } from "./context/cart-context"
import { Cart } from "./components/cart"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurant App",
  description: "Restaurant menu and ordering system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="relative min-h-screen">
            <header className="fixed right-4 top-4 z-50">
              <Cart />
            </header>
            {children}
            <Toaster 
  position="top-center"
  toastOptions={{
    style: { marginTop: '7rem' },
    duration: 2000, 
  }}
  richColors 
/>
          </div>
        </CartProvider>
      </body>
    </html>
  )
}