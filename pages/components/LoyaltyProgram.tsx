"use client"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface LoyaltyProgramProps {
  userId: string
}

export default function LoyaltyProgram({ userId }: LoyaltyProgramProps) {
  const [points, setPoints] = useState(0)

  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        setPoints(userDoc.data().loyaltyPoints || 0)
      }
    }

    fetchLoyaltyPoints()
  }, [userId])

  return (
    <div className="bg-orange-100 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Loyalty Program</h2>
      <p>You have {points} loyalty points</p>
      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-300">
        Redeem Points
      </button>
    </div>
  )
}

