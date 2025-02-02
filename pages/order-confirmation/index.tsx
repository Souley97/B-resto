"use client"
import { useEffect, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Clock, Truck, MapPin, Phone, Mail, User, AlertCircle } from "lucide-react"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  extras?: string[]
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
  createdAt: Date
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  location?: { latitude: number; longitude: number }
}
interface OrderTicketProps {
  order: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      size?: string;
      extras?: string[];
    }>;
    createdAt: Date;
    status: string;
  };
}
const CustomerInfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
    <Icon className="w-5 h-5 text-gray-500" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
)

const OrderStatus = ({ currentStatus, timestamp }: { currentStatus: Order["status"]; timestamp: Date }) => {
  const statusSteps = useMemo(
    () => [
      {
        status: "pending",
        icon: CheckCircle2,
        message: "Commande reçue",
        description: "Votre commande a été confirmée",
      },
      {
        status: "preparing",
        icon: Clock,
        message: "En préparation",
        description: "Vos plats sont en cours de préparation",
      },
      {
        status: "ready",
        icon: CheckCircle2,
        message: "Prête",
        description: "Votre commande est prête pour la livraison",
      },
      {
        status: "delivered",
        icon: Truck,
        message: "Livrée",
        description: "Bon appétit !",
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {statusSteps.map((step, index) => {
        const isCompleted = statusSteps.findIndex((s) => s.status === currentStatus) >= index
        const isActive = step.status === currentStatus
        return (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            <div
              className={`relative flex-shrink-0 w-8 h-8 rounded-full ${
                isCompleted ? "bg-green-500" : "bg-gray-200"
              } flex items-center justify-center`}
            >
              {isActive && (
                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-green-500"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <step.icon className={`w-5 h-5 ${isCompleted ? "text-white" : "text-gray-400"}`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                {step.message}
              </p>
              <p className="text-sm text-gray-500">{step.description}</p>
              {isActive && (
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

const LoadingState = () => (
  <div className="container max-w-6xl py-6">
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const { isLoaded: isMapsLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  useEffect(() => {
    if (!orderId) {
      toast.error("Numéro de commande manquant")
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (doc) => {
        if (doc.exists()) {
          const orderData = doc.data() as Omit<Order, "id">
          setOrder({ id: doc.id, ...orderData })
        } else {
          toast.error("Commande introuvable")
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching order:", error)
        toast.error("Erreur lors du chargement de la commande")
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [orderId])

  if (loading) return <LoadingState />

  if (!order) {
    return (
      <div className="container py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Commande introuvable</h2>
        <p className="text-gray-500 mb-6">
          Nous n'avons pas pu trouver la commande que vous recherchez.
        </p>
        <Button asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <main className="container max-w-6xl py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-orange-600">
                Détails de la commande #{order.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <CustomerInfoItem icon={User} label="Nom" value={order.customerName} />
              <CustomerInfoItem icon={Phone} label="Téléphone" value={order.customerPhone} />
              <CustomerInfoItem icon={Mail} label="Email" value={order.customerEmail} />
              <CustomerInfoItem icon={MapPin} label="Adresse" value={order.deliveryAddress} />
              
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-800">Montant total</p>
                <p className="text-2xl font-bold text-orange-600">{order.total.toFixed(2)} €</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Suivi de commande</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatus currentStatus={order.status} timestamp={order.createdAt} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Google Maps */}
        {order.location && isMapsLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Localisation de la livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={{ lat: order.location.latitude, lng: order.location.longitude }}
                    zoom={15}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      styles: [{ /* Your map styles */ }],
                    }}
                  >
                    <Marker
                      position={{ lat: order.location.latitude, lng: order.location.longitude }}
                    />
                  </GoogleMap>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </AnimatePresence>
  )
}