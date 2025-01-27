"use client"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Transaction {
  id: string
  total: number
  paymentMethod: string
  createdAt: Timestamp
  items: { name: string; quantity: number; price: number }[]
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sortField, setSortField] = useState<"date" | "amount">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData: Transaction[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        transactionsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt as Timestamp,
        } as Transaction)
      })
      setTransactions(transactionsData)
    })

    return () => unsubscribe()
  }, [])

  const sortTransactions = (field: "date" | "amount") => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortField === "date") {
      return sortOrder === "asc"
        ? a.createdAt.toMillis() - b.createdAt.toMillis()
        : b.createdAt.toMillis() - a.createdAt.toMillis()
    } else {
      return sortOrder === "asc" ? a.total - b.total : b.total - a.total
    }
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      <div className="mb-4">
        <button onClick={() => sortTransactions("date")} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded">
          Sort by Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => sortTransactions("amount")} className="px-4 py-2 bg-blue-500 text-white rounded">
          Sort by Amount {sortField === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>
      <div className="space-y-4">
        {sortedTransactions.map((transaction) => (
          <div key={transaction.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">Date: {transaction.createdAt.toDate().toLocaleString()}</span>
              <span className="font-bold">Total: ${transaction.total.toFixed(2)}</span>
            </div>
            <p>Payment Method: {transaction.paymentMethod}</p>
            <h3 className="font-bold mt-2">Items:</h3>
            <ul>
              {transaction.items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

