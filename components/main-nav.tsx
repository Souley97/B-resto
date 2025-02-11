"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

export function MainNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/menu", label: "Commander !" },
    { href: "#", label: "À propos" },
    { href: "#", label: "Contactez-Nous" },
  ]

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "relative transition-colors duration-200 hover:text-orange-600",
        "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0",
        "after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full",
        pathname === href ? "text-orange-600 after:w-full" : "text-foreground"
      )}
    >
      {label}
    </Link>
  )

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95",
        "backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-shadow duration-200",
        isScrolled && "shadow-md"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link 
          href="/" 
          className={cn(
            "flex items-center ml-7 space-x-2 transition-transform",
            "hover:scale-105 active:scale-95"
          )}
        >
          <span className="text-xl font-bold text-orange-600 md:text-2xl">
            Bamsachine
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-8 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative h-5 w-5">
            <div className={cn(
              "absolute transition-all duration-300",
              isMenuOpen ? "rotate-0 opacity-0" : "rotate-0 opacity-100"
            )}>
              <Menu className="h-5 w-5" />
            </div>
            <div className={cn(
              "absolute transition-all duration-300",
              isMenuOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
            )}>
              <X className="h-5 w-5" />
            </div>
          </div>
        </Button>

        {/* Login Button (Desktop) */}
        <div className="hidden md:block">
          <Button
            asChild
            variant="default"
            className={cn(
              "bg-orange-600 transition-all duration-200",
              "hover:bg-orange-700 hover:scale-105",
              "active:scale-95"
            )}
          >
            <Link href="/login">Se connecter</Link>
          </Button>
          <ThemeToggle />

        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 md:hidden",
          isMenuOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <nav className="flex flex-col space-y-4 px-4 pb-6 pt-2">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          <Button
            asChild
            variant="default"
            className="mt-2 w-full bg-orange-600 hover:bg-orange-700"
          >
            <Link href="/login">Se connecter</Link>

          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}