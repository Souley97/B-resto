"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart, ShoppingCart, Menu, Package, CreditCard, Users, Settings, PieChart, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/admin/login")
  //   }
  // }, [user, loading, router])

  // const handleLogout = async () => {
  //   await signOut(auth)
  //   router.push("/admin/login")
  // }

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <LoadingSpinner />
  //     </div>
  //   )
  // }

  // if (!user) {
  //   return null
  // }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-orange-600">RestoPro Admin</h1>
        </div>
        <nav className="mt-4">
          <Link href="/admin" className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600">
            <BarChart className="inline-block w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
          >
            <ShoppingCart className="inline-block w-5 h-5 mr-2" />
            Orders
          </Link>
          <Link href="/admin/menu" className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600">
            <Menu className="inline-block w-5 h-5 mr-2" />
            Menu
          </Link>
          <Link
            href="/admin/inventory"
            className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
          >
            <Package className="inline-block w-5 h-5 mr-2" />
            Inventory
          </Link>
          <Link
            href="/admin/finance"
            className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
          >
            <CreditCard className="inline-block w-5 h-5 mr-2" />
            Finance
          </Link>
          <Link href="/admin/staff" className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600">
            <Users className="inline-block w-5 h-5 mr-2" />
            Staff
          </Link>
          <Link
            href="/admin/analytics"
            className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
          >
            <PieChart className="inline-block w-5 h-5 mr-2" />
            Analytics
          </Link>
          <Link
            href="/admin/settings"
            className="block px-4 py-2 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
          >
            <Settings className="inline-block w-5 h-5 mr-2" />
            Settings
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4">
          {/* <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </Button> */}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}

