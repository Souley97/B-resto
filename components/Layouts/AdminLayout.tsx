"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart,
  ShoppingCart,
  Menu as MenuIcon,
  Package,
  CreditCard,
  Users,
  Settings,
  PieChart,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(true); // Gère l'état ouvert/réduit du menu

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/menu", label: "Menu", icon: MenuIcon },
    { href: "/admin/inventory", label: "Inventory", icon: Package },
    { href: "/admin/finance", label: "Finance", icon: CreditCard },
    { href: "/admin/staff", label: "Staff", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: PieChart },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const navMotion = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="flex h-screen bg-globals">
      {/* Sidebar */}
      <motion.aside
        className={`${
          isMenuOpen ? "w-64" : "w-20"
        } bg-white/25 backdrop-blur-sm lg:m-4 lg:ml-12 rounded-2xl border-white border-2 shadow-xl transition-all duration-300`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Menu Toggle */}
        <div className="p-1 flex justify-between items-center">
          <h1
            className={`text-2xl font-bold text-orange-600 transition-opacity duration-300 ${
              isMenuOpen ? "opacity-100" : "opacity-0 hidden"
            }`}
          >
            RestoPro Admin
          </h1>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <MenuIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        {/* Navigation */}
        <motion.nav
          className="mt-1 gap-1 ml-4 flex flex-col items-start"
          variants={navMotion}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ staggerChildren: 0.1 }}
        >
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center my-2 gap-2 px-4 py-2 rounded-full w-full transition-colors ${
                pathname === href
                  ? "bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 text-white"
                  : "text-gray-600 hover:border-2 hover:border-orange-600 hover:animate-border-loop"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span
                className={`ml-2 transition-opacity duration-300 ${
                  isMenuOpen ? "opacity-100" : "opacity-0 hidden"
                }`}
              >
                {label}
              </span>
            </Link>
          ))}
        </motion.nav>
        {/* Logout */}
        <div className={`absolute bottom-4 left-4 w-full ${!isMenuOpen && "hidden"}`}>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden lg:px-12 overflow-y-auto">
        <motion.div
          className="container mx-auto px-6 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
