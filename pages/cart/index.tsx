"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart()
  const [promoCode, setPromoCode] = useState("")

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // Assuming 10% tax
  const total = subtotal + tax

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    }
  }

  return (
    <>
      <main className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Votre Panier</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">Votre panier est vide</p>
            <Button asChild>
              <Link href="/menu">Continuer vos achats</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
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
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                      className=" hover:bg-orange-600"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                                            className=" hover:bg-orange-600"

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
                  <div className="text-right">
                    <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Résumé de la commande</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>{tax.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Input placeholder="Code promo" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                </div>
                <Button className="w-full mt-4" asChild>
                  <Link href="/checkout">Passer à la caisse</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

