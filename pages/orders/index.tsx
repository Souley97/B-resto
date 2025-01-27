"use client"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  tableNumber: number
  items: OrderItem[]
  status: "preparing" | "ready" | "delivered"
  total: number
  type: "dine-in" | "takeaway" | "online"
  createdAt: Date | Timestamp
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const q = query(collection(db, "orders"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: Order[] = []
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order)
      })
      setOrders(
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0)
          const dateB = b.createdAt?.toDate?.() || new Date(0)
          return dateB.getTime() - dateA.getTime()
        }),
      )
    })

    return () => unsubscribe()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus })
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">
              {order.type === "dine-in" ? `Table ${order.tableNumber}` : order.type}
            </h2>
            <ul className="mb-4">
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="font-bold">Total: ${order.total.toFixed(2)}</p>
            <p className="mt-2">Status: {order.status}</p>
            <div className="mt-4">
              <button
                onClick={() => updateOrderStatus(order.id, "preparing")}
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
              >
                Preparing
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, "ready")}
                className="bg-green-500 text-white px-2 py-1 rounded mr-2"
              >
                Ready
              </button>
              <button
                onClick={() => updateOrderStatus(order.id, "delivered")}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                Delivered
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

