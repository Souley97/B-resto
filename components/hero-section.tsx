"use client"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative min-h-[400px] bg-[url(https://i.pinimg.com/736x/48/16/99/481699e843b567e4b4dcc1e11c0e7c91.jpg)]  bg-no-repeat bg-cover bg-center rounded-lg flex items-center justify-center overflow-hidden ">
     

      {/* Content */}
      <div className="container relative z-10 text-center px-4">
        <h1 className="text-4xl text-white md:text-6xl font-bold mb-6">Vos repas livrés chez vous en un clic !</h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Commandez rapidement et directement auprès de votre restaurant favori
        </p>

        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
          <Select defaultValue="delivery">
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Mode de livraison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivery">Livraison</SelectItem>
              <SelectItem value="pickup">À emporter</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input type="text" placeholder="Saisissez votre adresse" className="w-full pl-10" />
          </div>

          <button className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors">
            Rechercher
          </button>
        </div>
      </div>
    </div>
  )
}

