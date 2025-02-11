import { GetServerSideProps } from "next";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-context";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import CartComponent from "@/components/cart";

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
export default function ProductComponent({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.id || "");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const extrasTotal = selectedExtras.length * 2; // Assuming each extra costs 2€
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
    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} x ${product.name} ${selectedSizeOption?.name ? `(${selectedSizeOption.name})` : ""}`,
    });
  };

  return (
    <>
      <main className="container py-6">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/menu">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour au menu
          </Link>
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-square">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl font-bold mt-2">{total.toFixed(2)} €</p>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <Card>
              <CardHeader>
                <CardTitle>Personnalisation</CardTitle>
                <CardDescription>Choisissez votre taille et vos suppléments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.sizes?.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Taille</label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name} - {size.price.toFixed(2)} €
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {product.extras?.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Suppléments</label>
                    <div className="grid gap-2">
                      {product.extras.map((extra) => (
                        <div key={extra} className="flex items-center justify-between p-2 border rounded">
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
                            <label htmlFor={extra}>{extra}</label>
                          </div>
                          <span>+2.00 €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantité</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ajouter au panier - {total.toFixed(2)} €
            </Button>
          </div>
        </div>

        <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                    <SheetDescription>Affinez votre recherche avec nos filtres</SheetDescription>
                  </SheetHeader>
                  <CartComponent/>
                </SheetContent>
              </Sheet>
      </main>
    </>
  );
}
