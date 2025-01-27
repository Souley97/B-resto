"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  date: string
  status: "preparing" | "delivering" | "delivered"
  total: number
  items: OrderItem[]
}

// This would typically come from your backend
const mockOrders: Order[] = [
  {
    id: "1",
    date: "2023-05-15",
    status: "delivered",
    total: 35.97,
    items: [
      { id: "1", name: "Margherita Pizza", quantity: 2, price: 12.99 },
      { id: "2", name: "Coca-Cola", quantity: 2, price: 2.5 },
    ],
  },
  {
    id: "2",
    date: "2023-05-20",
    status: "delivering",
    total: 42.98,
    items: [
      { id: "3", name: "Pepperoni Pizza", quantity: 1, price: 14.99 },
      { id: "4", name: "Vegetarian Pizza", quantity: 1, price: 13.99 },
      { id: "5", name: "Garlic Bread", quantity: 2, price: 3.5 },
    ],
  },
]

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // This would typically be an API call to your backend
    setOrders(mockOrders)
  }, [])

  return (
    <>
      <main className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Historique des commandes</h1>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro de commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      order.status === "delivered"
                        ? "bg-green-200 text-green-800"
                        : order.status === "delivering"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {order.status === "delivered"
                      ? "Livré"
                      : order.status === "delivering"
                        ? "En livraison"
                        : "En préparation"}
                  </span>
                </TableCell>
                <TableCell>{order.total.toFixed(2)} €</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Voir les détails</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Détails de la commande #{order.id}</DialogTitle>
                        <DialogDescription>
                          Commande passée le {new Date(order.date).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead>Quantité</TableHead>
                            <TableHead>Prix unitaire</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.price.toFixed(2)} €</TableCell>
                              <TableCell>{(item.quantity * item.price).toFixed(2)} €</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 text-right font-semibold">Total: {order.total.toFixed(2)} €</div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </>
  )
}

