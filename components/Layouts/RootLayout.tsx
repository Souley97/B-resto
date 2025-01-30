// import "./globals.css"
import { Inter } from "next/font/google"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { MainNav } from "@/components/main-nav"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "RestoPro - Livraison de repas",
  description: "Commandez vos repas préférés en ligne et faites-vous livrer rapidement",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <MainNav/>   
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
       
        <div className="container mx-auto px-6 py-8">{children}</div>
                  <Toaster />
        
      </main>
      </div>
     
  )
}

