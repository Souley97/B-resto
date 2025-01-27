"use client"
import { Star, Clock, MapPin, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface RestaurantHeaderProps {
  name: string
  rating: number
  cuisine: string
  address: string
  phone: string
  openingHours: string
  coverImage: string
}

export function RestaurantHeader({
  name,
  rating,
  cuisine,
  address,
  phone,
  openingHours,
  coverImage,
}: RestaurantHeaderProps) {
  return (
    <div className="relative">
      <div className="h-[200px] md:h-[300px] w-full relative">
        <Image src={coverImage || "/placeholder.svg"} alt={name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container relative -mt-20 z-20">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1">{rating}</span>
                </div>
                <span>•</span>
                <Badge variant="secondary">{cuisine}</Badge>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {address}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {phone}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {openingHours}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors">
                Commander
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

