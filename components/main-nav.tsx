"use client"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-orange-600">RestoPro</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors hover:text-orange-600 ${
              pathname === "/" ? "text-orange-600" : "text-foreground"
            }`}
          >
            Accueil
          </Link>
          <Link
            href="/menu"
            className={`transition-colors hover:text-orange-600 ${
              pathname === "/menu" ? "text-orange-600" : "text-foreground"
            }`}
          >
            Commander !
          </Link>
          <Link
            href="/about"
            className={`transition-colors hover:text-orange-600 ${
              pathname === "/about" ? "text-orange-600" : "text-foreground"
            }`}
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className={`transition-colors hover:text-orange-600 ${
              pathname === "/contact" ? "text-orange-600" : "text-foreground"
            }`}
          >
            Contactez-Nous
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-600 text-[10px] font-medium text-white flex items-center justify-center">
                0
              </span>
            </Button>
          </Link>
          <Button asChild variant="default" className="bg-orange-600 hover:bg-orange-700">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

