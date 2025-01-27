"use client"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

interface OrderItem extends MenuItem {
  quantity: number
}

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [currentCategory, setCurrentCategory] = useState<string>("All")
  const [order, setOrder] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")

  useEffect(() => {
    const q = query(collection(db, "menuItems"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: MenuItem[] = []
      const cats = new Set<string>()
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as MenuItem
        items.push(item)
        cats.add(item.category)
      })
      setMenuItems(items)
      setCategories(["All", ...Array.from(cats)])
    })

    return () => unsubscribe()
  }, [])

  const addToOrder = (item: MenuItem) => {
    const existingItem = order.find((orderItem) => orderItem.id === item.id)
    if (existingItem) {
      setOrder(
        order.map((orderItem) =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem,
        ),
      )
    } else {
      setOrder([...order, { ...item, quantity: 1 }])
    }
  }

  const removeFromOrder = (itemId: string) => {
    setOrder(order.filter((item) => item.id !== itemId))
  }

  const calculateTotal = () => {
    return order.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const submitOrder = async () => {
    const orderData = {
      items: order,
      total: calculateTotal(),
      paymentMethod,
      status: "preparing",
      createdAt: new Date(),
    }
    await addDoc(collection(db, "orders"), orderData)
    setOrder([])
    alert("Order submitted successfully!")
  }

  return (
    <div className="p-8 flex">
      <div className="w-2/3 pr-8">
        <h1 className="text-3xl font-bold mb-6">POS Module</h1>
        <div className="mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCurrentCategory(category)}
              className={`mr-2 mb-2 px-4 py-2 rounded ${
                currentCategory === category ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {menuItems
            .filter((item) => currentCategory === "All" || item.category === currentCategory)
            .map((item) => (
              <button key={item.id} onClick={() => addToOrder(item)} className="bg-white p-4 rounded shadow text-left">
                <h3 className="font-bold">{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
              </button>
            ))}
        </div>
      </div>
      <div className="w-1/3 bg-gray-100 p-4 rounded">
        <h2 className="text-2xl font-bold mb-4">Current Order</h2>
        {order.map((item) => (
          <div key={item.id} className="flex justify-between items-center mb-2">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
            <button onClick={() => removeFromOrder(item.id)} className="bg-red-500 text-white px-2 py-1 rounded">
              Remove
            </button>
          </div>
        ))}
        <div className="mt-4">
          <p className="font-bold">Total: ${calculateTotal().toFixed(2)}</p>
        </div>
        <div className="mt-4">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 mb-4">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile_money">Mobile Money</option>
          </select>
          <button onClick={submitOrder} className="bg-green-500 text-white p-2 rounded w-full">
            Submit Order
          </button>
        </div>
      </div>
    </div>
  )
}

