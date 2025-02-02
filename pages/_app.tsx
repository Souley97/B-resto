"use client"
import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { CartProvider } from "@/lib/cart-context"
import RootLayout from "@/components/Layouts/RootLayout"
import AdminLayout from "@/components/Layouts/AdminLayout"
import { useRouter } from "next/router"
import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react"

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter()
  const isAdminRoute = router.pathname.startsWith("/admin")
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className={`
        font-bodyFont min-h-screen
        bg-white dark:bg-gray-950
        text-gray-900 dark:text-gray-50
        transition-colors duration-300
      `}>
        {isAdminRoute ? (
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        ) : (
          <CartProvider>
            <RootLayout>
              <Component {...pageProps} />
            </RootLayout>
          </CartProvider>
        )}
      </div>
    </ThemeProvider>
  )
}