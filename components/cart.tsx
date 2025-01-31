"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, SlidersHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import CheckoutComponent from "./checkout"
export default function CartComponent() {
  const { cart, updateQuantity, removeFromCart } = useCart()
  const [promoCode, setPromoCode] = useState("")

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.18 // Assuming 18% tax
  const total = subtotal + tax

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    }
  }

  return (
    <>
      <main className="container py-6">

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">Votre panier est vide</p>
            <Button asChild>
              <Link href="/menu">Continuer vos achats</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1">
            {/* div scorol vertical */}
            <div className="overflow-y-auto h-80">

              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.size && `Taille: ${item.size}`}
                      {item.extras && item.extras.length > 0 && `, Extras: ${item.extras.join(", ")}`}
                    </p>
                    <div className="">
                    <p className="font-semibold">{(item.price * item.quantity)} FCFA</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                      <Button
                      className=" hover:bg-orange-400"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                                            className=" hover:bg-orange-400"

                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="ml-auto text-red-600" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="w-4 h-4 " />
                      </Button>
                    </div>
                  </div>
                 
                </div>
              ))}
            </div>

            <div>
              <div className="bg-muted p-4 rounded-lg">
                {/* <h3 className="font-semibold mb-4">Résumé de la commande</h3> */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>{tax} FCFA</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{total} FCFA</span>
                  </div>
                </div>
                {/* <div className="mt-4">
                  <Input placeholder="Code promo" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                </div> */}
                
                <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" className="w-full text-white hover:bg-orange-400 mt-4 cursor-pointer bg-orange-500" asChild>
                  <span >Passer à la caisse</span>

                </Button>
                  {/* <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button> */}
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                    <SheetDescription>Affinez votre recherche avec nos filtres</SheetDescription>
                  </SheetHeader>
                  <CheckoutComponent/>
                </SheetContent>
              </Sheet>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

