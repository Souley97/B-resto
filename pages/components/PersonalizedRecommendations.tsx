"use client"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Image from "next/image"

interface RecommendedItem {
  id: string
  name: string
  price: number
  image: string
}

interface PersonalizedRecommendationsProps {
  userId: string
}

export default function PersonalizedRecommendations({ userId }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([])

  useEffect(() => {
    const fetchRecommendations = async () => {
      // In a real application, you would implement a recommendation algorithm
      // For this example, we'll just fetch random menu items
      const q = query(collection(db, "menuItems"), where("popular", "==", true))
      const querySnapshot = await getDocs(q)
      const items: RecommendedItem[] = []
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as RecommendedItem)
      })
      setRecommendations(items.slice(0, 3)) // Show top 3 recommendations
    }

    fetchRecommendations()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((item) => (
          <div key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <Image
              src={item.image || "/placeholder-dish.jpg"}
              alt={item.name}
              width={200}
              height={150}
              objectFit="cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-orange-600 font-bold">${item.price.toFixed(2)}</p>
              <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-300">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

