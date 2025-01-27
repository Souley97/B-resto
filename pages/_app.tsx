import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import "react-responsive-carousel/lib/styles/carousel.min.css";
import { CartProvider } from "@/lib/cart-context";

import RootLayout from "@/components/Layouts/RootLayout";
import AdminLayout from "@/components/Layouts/AdminLayout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  // Vérifiez si la route commence par /admin
  const isAdminRoute = router.pathname.startsWith("/admin");

  return (
      
          // <div className="font-bodyFont bg-gray-100">
          <div className="font-bodyFont bg-white">
            {/* Utilise AdminLayout pour les routes admin */}
            {isAdminRoute ? (
              <AdminLayout>
                <Component {...pageProps} />
              </AdminLayout>
            ) : (
              /* Utilise RootLayout pour les autres routes */
              <CartProvider>

              <RootLayout>
                <Component {...pageProps} />
              </RootLayout>
              </CartProvider>

            )}
          </div>
   
  );
}
