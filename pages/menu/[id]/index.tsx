import { GetServerSideProps } from "next";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/lib/cart-context";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartComponent from "@/components/cart";
import { motion, AnimatePresence } from "framer-motion";

// Define the Product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  extras: string[];
  sizes: { id: string; name: string; price: number }[];
}

// Fetch product data on the server side
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const docRef = doc(db, "menuItems", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { notFound: true }; // Return 404 if product not found
    }

    const productData = { id: docSnap.id, ...docSnap.data() };

    return {
      props: { product: productData }, // Pass product data as props
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { notFound: true }; // Handle errors gracefully with a 404 page
  }
};

// Main Product Page component
export default function ProductPage({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.id || "");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [cartBounce, setCartBounce] = useState(false);

  const extrasTotal = selectedExtras.length * 0; // Assuming each extra costs 2€
  const selectedSizeOption = product.sizes?.find((size) => size.id === selectedSize);
  const total = ((selectedSizeOption?.price ?? product.price) + extrasTotal) * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: selectedSizeOption?.price ?? product.price,
      quantity,
      size: selectedSizeOption?.name,
      extras: selectedExtras,
      image: product.image,
    };
    addToCart(cartItem);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 500);
    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} x ${product.name} ${selectedSizeOption?.name ? `(${selectedSizeOption.name})` : ""}`,
    });
  };

  const { cart } = useCart();
  const getTotalItemsInCart = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <>
      <main className="container bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg transition-all duration-300 py-6">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/menu">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour au menu
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-3/4 lg:w-2/4 mx-auto grid gap-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative aspect-video rounded-lg overflow-hidden"
          >
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
                <CardContent className="space-y-4 p-6">
                  {product.sizes?.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Taille</label>
                      <div className="flex gap-2">
          {product.sizes.map((size) => (
            <Button
              key={size.id}
              variant={selectedSize === size.id ? "default" : "outline"}
              className={`flex-1 ${
                selectedSize === size.id
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedSize(size.id)}
            >
              {size.name} - {size.price} FCFA
            </Button>
          ))}
        </div>
                    </div>
                  )}
                  {product.extras?.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Suppléments</label>
                      <div className="grid gap-2">
                        {product.extras.map((extra) => (
                          <motion.div
                            key={extra}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-2 border rounded-lg bg-white"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={extra}
                                checked={selectedExtras.includes(extra)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedExtras([...selectedExtras, extra]);
                                  } else {
                                    setSelectedExtras(selectedExtras.filter((item) => item !== extra));
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <label htmlFor={extra} className="text-gray-700">
                                {extra}
                              </label>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantité</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center text-gray-700">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileTap={{ scale: 0.9, rotate: [-2, 2, -2, 2, 0] }}>
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ajouter au panier - {total} FCFA
              </Button>
            </motion.div>

          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-8 right-8">
        <Sheet>
          <SheetTrigger asChild>
            <motion.div
              animate={{ scale: cartBounce ? 1.4 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}

              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-orange-500 hover:bg-orange-600 p-4 rounded-full shadow-lg cursor-pointer"
            >
              <ShoppingCart className="text-4xl text-white" />
              <motion.span
                animate={{ scale: cartBounce ? 1.4 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className="absolute top-0 right-0 h-6 w-6 rounded-full bg-orange-700 text-xs font-medium text-white flex items-center justify-center"
              >
                {getTotalItemsInCart()}
              </motion.span>
            </motion.div>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Votre panier</SheetTitle>
            </SheetHeader>
            <CartComponent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}