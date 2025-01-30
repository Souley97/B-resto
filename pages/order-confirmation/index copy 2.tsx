"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Clock, Truck } from "lucide-react"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  extras?: string[]
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  location?: { latitude: number; longitude: number }; // Ajoutez la localisation
}


export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Clé API Google Maps
  });
  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided")
      setLoading(false)
      return
    }

    const orderRef = doc(db, "orders", orderId)

    const unsubscribe = onSnapshot(
      orderRef,
      (doc) => {
        if (doc.exists()) {
          const orderData = doc.data() as Omit<Order, "id">
          setOrder({ id: doc.id, ...orderData })
        } else {
          setError("Order not found")
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching order:", error)
        setError("Error fetching order")
        setLoading(false)
      },
    )

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe()
  }, [orderId])

  if (loading) {
    return (
      <>
        <main className="container py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </main>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <main className="container py-6">
          <Card>
            <CardContent className="py-10">
              <div className="text-center text-red-500">{error || "Commande introuvable"}</div>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const statusSteps = [
    {
      status: "pending",
      icon: CheckCircle2,
      message: "Votre commande a bien été reçue!",
    },
    {
      status: "preparing",
      icon: Clock,
      message: "Votre commande est en préparation.",
    },
    {
      status: "ready",
      icon: CheckCircle2,
      message: "Votre commande est prête.",
    },
    {
      status: "delivered",
      icon: Truck,
      message: "Votre commande a été livrée. Bon appétit!",
    },
  ]

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <main className="container max-w-6xl py-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Order Details */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-orange-600 mb-2">Merci pour votre commande!</h2>
                  <p className="text-gray-600">Votre commande a été passée et vous sera livrée sous peu!</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Détails du client</h3>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-[120px,1fr]">
                        <span className="text-gray-600">Client</span>
                        <span>{order.customerName}</span>
                      </div>
                      <div className="grid grid-cols-[120px,1fr]">
                        <span className="text-gray-600">Numéro de portable</span>
                        <span>{order.customerPhone}</span>
                      </div>
                      <div className="grid grid-cols-[120px,1fr]">
                        <span className="text-gray-600">Email</span>
                        <span>{order.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Numéro de commande : #{order.id}</h3>
                    <p className="text-gray-600">Merci de patienter, votre commande est en cours de traitement</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                    <p>{order.deliveryAddress}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Montant à collecter</h3>
                    <p className="text-orange-600 font-semibold">{order.total.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Order Status */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Statut de la commande</h2>
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const isCompleted = statusSteps.findIndex((s) => s.status === order.status) >= index
                  const Icon = step.icon
                  return (
                    <div key={index} className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full ${isCompleted ? "bg-orange-500" : "bg-gray-300"} flex items-center justify-center`}
                      >
                        <Icon className={`w-4 h-4 ${isCompleted ? "text-white" : "text-gray-500"}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`${isCompleted ? "text-gray-800" : "text-gray-500"}`}>{step.message}</p>
                        {isCompleted && <p className="text-sm text-gray-500">{formatDateTime(new Date())}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Carte Google Maps */}
        {order.location && isLoaded && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Localisation de la commande</h2>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "400px" }}
              center={{ lat: order.location.latitude, lng: order.location.longitude }}
              zoom={15}
            >
              <Marker position={{ lat: order.location.latitude, lng: order.location.longitude }} />
            </GoogleMap>
          </div>
        )}
      </main>
    </>
  )
}

