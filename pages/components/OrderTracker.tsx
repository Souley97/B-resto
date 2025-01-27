"use client"
import { useState, useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface OrderTrackerProps {
  orderId: string
}

export default function OrderTracker({ orderId }: OrderTrackerProps) {
  const [status, setStatus] = useState("")
  const [estimatedTime, setEstimatedTime] = useState(0)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "orders", orderId), (doc) => {
      if (doc.exists()) {
        setStatus(doc.data().status)
        setEstimatedTime(doc.data().estimatedTime)
      }
    })

    return () => unsubscribe()
  }, [orderId])

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Order Status</h2>
      <p>Status: {status}</p>
      <p>Estimated time: {estimatedTime} minutes</p>
      <div className="mt-2 h-2 bg-gray-200 rounded">
        <div className="h-full bg-orange-500 rounded" style={{ width: `${(estimatedTime / 60) * 100}%` }}></div>
      </div>
    </div>
  )
}

