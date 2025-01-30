"use client"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, doc, updateDoc, addDoc, orderBy, limit, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  quantity: number
  lastUpdated: Date
  minThreshold: number
}

interface StockMovement {
  id: string
  itemId: string
  itemName: string
  quantity: number
  type: "addition" | "consumption" | "loss"
  date: Date
}

export default function InventoryManagement() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, minThreshold: 0 })
  const [adjustQuantity, setAdjustQuantity] = useState({ id: "", quantity: 0 })

  useEffect(() => {
    const inventoryQuery = query(collection(db, "inventory"))
    const unsubscribeInventory = onSnapshot(inventoryQuery, (querySnapshot) => {
      const items: InventoryItem[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        items.push({
          id: doc.id,
          name: data.name,
          quantity: data.quantity,
          lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : new Date(),
          minThreshold: data.minThreshold,
        })
      })
      setInventoryItems(items)
    })

    const movementsQuery = query(collection(db, "stockMovements"), orderBy("date", "desc"), limit(50))
    const unsubscribeMovements = onSnapshot(movementsQuery, (querySnapshot) => {
      const movements: StockMovement[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        movements.push({
          id: doc.id,
          itemId: data.itemId,
          itemName: data.itemName,
          quantity: data.quantity,
          type: data.type,
          date: data.date.toDate(),
        })
      })
      setStockMovements(movements)
    })

    return () => {
      unsubscribeInventory()
      unsubscribeMovements()
    }
  }, [])

  const addInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault()
    await addDoc(collection(db, "inventory"), {
      ...newItem,
      lastUpdated: Timestamp.now(),
    })
    setNewItem({ name: "", quantity: 0, minThreshold: 0 })
  }

  const adjustInventoryQuantity = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = inventoryItems.find((item) => item.id === adjustQuantity.id)
    if (item) {
      const newQuantity = item.quantity + adjustQuantity.quantity
      await updateDoc(doc(db, "inventory", adjustQuantity.id), {
        quantity: newQuantity,
        lastUpdated: Timestamp.now(),
      })
      await addDoc(collection(db, "stockMovements"), {
        itemId: adjustQuantity.id,
        itemName: item.name,
        quantity: adjustQuantity.quantity,
        type: adjustQuantity.quantity > 0 ? "addition" : "consumption",
        date: Timestamp.now(),
      })
    }
    setAdjustQuantity({ id: "", quantity: 0 })
  }

  const lowStockItems = inventoryItems.filter((item) => item.quantity <= item.minThreshold)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventory Management</h1>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Alert className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
          <Bell className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            The following items are low on stock:
            <ul className="list-disc list-inside">
              {lowStockItems.map((item) => (
                <li key={item.id}>
                  {item.name} (Current: {item.quantity}, Threshold: {item.minThreshold})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Add New Item Form */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addInventoryItem} className="space-y-4">
            <Input
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              required
            />
            <Input
              type="number"
              placeholder="Minimum Threshold"
              value={newItem.minThreshold}
              onChange={(e) => setNewItem({ ...newItem, minThreshold: Number(e.target.value) })}
              required
            />
            <Button type="submit">Add Item</Button>
          </form>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Min Threshold</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.lastUpdated ? item.lastUpdated.toLocaleString() : "N/A"}</TableCell>
                  <TableCell>{item.minThreshold}</TableCell>
                  <TableCell>
                    <form onSubmit={adjustInventoryQuantity} className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Adjust Quantity"
                        value={adjustQuantity.id === item.id ? adjustQuantity.quantity : ""}
                        onChange={(e) => setAdjustQuantity({ id: item.id, quantity: Number(e.target.value) })}
                        className="w-24"
                      />
                      <Button type="submit">Adjust</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock Movement History */}
      <Card className="rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.itemName}</TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.type}</TableCell>
                  <TableCell>{movement.date.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

