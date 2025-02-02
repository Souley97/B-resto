"use client";

import { useEffect, useState } from "react";
import { query, collection, orderBy, limit, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Truck } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interfaces pour la structure des commandes
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  extras?: string[];
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
  paymentMethod: string;
}

export default function OrdersToday() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des commandes du jour
  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt.toDate();
          if (createdAt >= startOfDay && createdAt <= endOfDay) {
            ordersData.push({
              id: doc.id,
              customerName: data.customerName,
              items: data.items,
              total: data.total,
              status: data.status,
              createdAt,
              customerEmail: data.customerEmail,
              customerPhone: data.customerPhone,
              deliveryAddress: data.deliveryAddress,
              paymentMethod: data.paymentMethod,
            });
          }
        });
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Mise à jour du statut de commande
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const currentOrder = orders.find((order) => order.id === orderId);

      if (!currentOrder) {
        console.error("Commande introuvable !");
        return;
      }

      // Vérifier si le statut est déjà "delivered" ou "cancelled"
      if (["delivered", "cancelled"].includes(currentOrder.status)) {
        console.error("Impossible de changer le statut d'une commande livrée ou annulée.");
        return;
      }

      // Mettre à jour le statut dans Firebase
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });

      console.log("Statut mis à jour avec succès !");
    } catch (err) {
      console.error("Échec de la mise à jour du statut :", err);
    }
  };


  // Formatage de la date et de l'heure
  const formatDateTime = (date: Date) => {
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Étapes des statuts de commande
  const statusSteps = [
    { status: "pending", label: "En attente", icon: Clock },
    { status: "preparing", label: "En préparation", icon: CheckCircle2 },
    { status: "ready", label: "Prêt", icon: CheckCircle2 },
    { status: "delivered", label: "Livré", icon: Truck },
  ];

  if (loading) {
    return (
      <main className="container py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      </main>
    );
  }
  return (
    <main className="container max-w-6xl py-6">
      <h1 className="text-2xl font-bold m-3">Commandes d'aujourd'hui</h1>
      
      {/* Grid responsive */}
      <div className="grid px-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="bg-white/10 backdrop-blur-sm rounded-2xl border-white border-2 shadow-xl transition-all duration-300"
          >
            <CardContent className="p-4 md:p-6">
              {/* Barre de progression */}
              <div className="relative flex items-center justify-between mb-6">
                <div className="absolute h-1 w-full bg-gray-300 top-5 left-0 z-0"></div>
                <div
                  className="absolute h-1 bg-orange-500 ml-1 top-5 z-10"
                  style={{
                    width: `${(statusSteps.findIndex((s) => s.status === order.status) /
                      (statusSteps.length - 1)) *
                      100
                      }%`,
                  }}
                ></div>
  
                {statusSteps.map((step, index) => {
                  const isActive = statusSteps.findIndex((s) => s.status === order.status) === index;
                  const isCompleted =
                    statusSteps.findIndex((s) => s.status === order.status) >= index;
  
                  return (
                    <motion.div
                      key={index}
                      className="relative flex flex-col items-center text-center z-20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.2 }}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ${isCompleted ? "bg-orange-500" : "bg-gray-300"
                          }`}
                      >
                        <step.icon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${isCompleted ? "text-white" : "text-gray-600"}`}
                        />
                      </div>
                      <p
                        className={`mt-2 text-xs sm:text-sm ${isActive ? "text-orange-500 font-semibold" : "text-gray-600"
                          }`}
                      >
                        {step.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
  
              {/* Order Details */}
              <div className="space-y-4">
                {/* Détails Client */}
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Détails du client</h3>
                  <p className="text-xs md:text-sm">{order.customerName}</p>
                  <p className="text-xs md:text-sm">{order.customerPhone}</p>
                  <p className="text-xs md:text-sm">{order.customerEmail}</p>
                </div>
                <div className="h-0.5 w-full bg-gray-300"></div>
  
                {/* Adresse et paiement */}
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Adresse de livraison</h3>
                  <div className="flex flex-col sm:flex-row justify-between">
                    <p className="text-xs md:text-sm">{order.deliveryAddress}</p>
                    <p className="text-xs md:text-sm">{order.paymentMethod}</p>
                  </div>
                </div>
                <div className="h-0.5 w-full bg-gray-300"></div>
  
                {/* Montant total */}
                <div>
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Montant total</h3>
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div>
                      {order.items.map((item, index) => (
                        <div key={index} className="text-xs md:text-sm">
                          {item.name} x {item.quantity}
                        </div>
                      ))}
                    </div>
                    <p className="text-orange-600 font-semibold">{order.total} FCFA</p>
                  </div>
                </div>
                <div className="h-0.5 w-full bg-gray-300"></div>
  
                {/* Date et statut */}
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <h3 className="font-semibold mb-2 text-sm md:text-base">Date de création</h3>
                    <p className="text-xs md:text-sm">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <Select
                    onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                    defaultValue={order.status}
                    disabled={["delivered", "cancelled"].includes(order.status)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Changer le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusSteps.map((step) => (
                        <SelectItem key={step.status} value={step.status}>
                          {step.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
  
}
