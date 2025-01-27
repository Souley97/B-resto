"use client"
import { useState, useEffect } from "react"
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [newItem, setNewItem] = useState<Omit<InventoryItem, "id">>({
    name: "",
    quantity: 0,
    unit: "",
  })

  useEffect(() => {
    const q = query(collection(db, "inventory"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: InventoryItem[] = []
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as InventoryItem)
      })
      setInventoryItems(items)
    })

    return () => unsubscribe()
  }, [])

  const addInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault()
    await addDoc(collection(db, "inventory"), newItem)
    setNewItem({ name: "", quantity: 0, unit: "" })
  }

  const updateInventoryItem = async (id: string, updatedItem: Partial<InventoryItem>) => {
    await updateDoc(doc(db, "inventory", id), updatedItem)
  }

  const deleteInventoryItem = async (id: string) => {
    await deleteDoc(doc(db, "inventory", id))
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      <form onSubmit={addInventoryItem} className="mb-8">
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseInt(e.target.value) })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Unit"
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Add Item
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventoryItems.map((item) => (
          <div key={item.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
            <p className="mb-2">
              Quantity: {item.quantity} {item.unit}
            </p>
            <button
              onClick={() => updateInventoryItem(item.id, { quantity: item.quantity + 1 })}
              className="bg-blue-500 text-white p-2 rounded mr-2"
            >
              Increase Quantity
            </button>
            <button onClick={() => deleteInventoryItem(item.id)} className="bg-red-500 text-white p-2 rounded">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

