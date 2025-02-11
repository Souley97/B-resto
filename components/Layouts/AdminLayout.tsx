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
import { Toaster } from "../ui/toaster";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "../theme-toggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false); // Gère l'état ouvert/réduit du menu en mode mobile
  const [isMobile, setIsMobile] = useState(false); // Détecte si l'écran est en mode mobile

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = "auth=; path=/; max-age=0"; // Supprime le cookie de l'authentification
      router.push("/login"); // Redirige vers la page de connexion
      toast.success("Déconnexion réussie !");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast.error("Échec de la déconnexion. Veuillez réessayer.");
    }
  };

  // Détecter si l'écran est en mode mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px est la taille de breakpoint pour lg
    };

    handleResize(); // Vérifier la taille de l'écran au chargement
    window.addEventListener("resize", handleResize); // Écouter les changements de taille

    return () => window.removeEventListener("resize", handleResize); // Nettoyer l'écouteur
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/menu", label: "Menu", icon: MenuIcon },
    { href: "/admin/inventory", label: "Inventory", icon: Package },
    // { href: "/admin/finance", label: "Finance", icon: CreditCard },
    { href: "/admin/staff", label: "Staff", icon: Users },
    // { href: "/admin/analytics", label: "Analytics", icon: PieChart },
    // { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const navMotion = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="flex h-screen dark:bg-globals-dark bg-globals-light">
      {/* Sidebar pour les écrans larges */}
      <motion.aside
        className={`${
          isMenuOpen ? "w-64" : "w-20"
        } bg-white/10 backdrop-blur-sm lg:m-4 lg:ml-12 rounded-2xl border-white border-2 shadow-xl transition-all duration-300 hidden lg:block`}
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
                  : "text-gray-500 hover:border-2 hover:border-orange-600 hover:animate-border-loop"
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

      {/* Sidebar pour les écrans mobiles */}
      {isMobile && (
        <motion.aside
          className={`fixed top-0 left-0 h-screen w-64 bg-white/85 backdrop-blur-sm rounded-r-2xl border-white border-2 shadow-xl transition-all duration-300 z-50 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Menu Toggle */}
          <div className="p-1 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-orange-600">RestoPro Admin</h1>
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
                <span className="ml-2">{label}</span>
              </Link>
            ))}
          </motion.nav>
          {/* Logout */}
          <div className="absolute bottom-4 left-4 w-full">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
              <LogOut className="w-5 h-5 mr-2" />
              Déconnexion
            </Button>
          </div>
        </motion.aside>
      )}

      {/* Bouton pour ouvrir le menu en mode mobile */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 left-4 p-2 rounded-full bg-white/10 backdrop-blur-sm border-white border-2 shadow-xl z-50 lg:hidden"
        >
          <MenuIcon className="w-6 h-6 text-gray-700" />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pb-8 lg:px-12 overflow-y-auto">
        <motion.div
          className="container mx-auto px-6 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* right */}
          <div
          className="absolute  top-2 right-28"
          >
          <ThemeToggle />

          </div>
          {children}
          <Toaster />
        </motion.div>
      </main>
      <ToastContainer />
    </div>
  );
}