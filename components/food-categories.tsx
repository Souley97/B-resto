"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  extras: string[]
  sizes: { id: string; name: string; price: number }[]
}
interface Category {
  id: string
  name: string
  variants: string[]
}
// const categories = [
//   {
//     id: 1,
//     name: "PETIT DÉJEUNER ET BRUNCH",
//     image: "/placeholder.svg?height=300&width=400",
//     slug: "breakfast",
//   },
//   {
//     id: 2,
//     name: "BURGERS",
//     image: "/placeholder.svg?height=300&width=400",
//     slug: "burgers",
//   },
//   {
//     id: 3,
//     name: "CUISINE LIBANAISE - GRILL",
//     image: "/placeholder.svg?height=300&width=400",
//     slug: "lebanese",
//   },
//   {
//     id: 4,
//     name: "POKE BOWLS",
//     image: "/placeholder.svg?height=300&width=400",
//     slug: "poke",
//   },
//   {
//     id: 5,
//     name: "SUSHI",
//     image: "/placeholder.svg?height=300&width=400",
//     slug: "sushi",
//   },
//   {
//     id: 6,
//     name: "PASTA",
//     image: "/placeholder.svg?height=300&width=400",
//     slug: "pasta",
//   },
//   {
//     id: 7,
//     name: "PIZZA",
//     image: "/placeholder.svg?height=300&width=400",
//     slug: "pizza",
//   },
// ];
const useMenuData = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true)
        const menuQuery = query(collection(db, "menuItems"), orderBy("name"))
        const querySnapshot = await getDocs(menuQuery)
        const items: MenuItem[] = []
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as MenuItem)
        })
        setMenuItems(items)
      } catch (err) {
        setError("Erreur lors du chargement du menu")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMenuItems()
  }, [])

  return { menuItems, isLoading, error }
}

export function FoodCategories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4; // Nombre de catégories visibles à la fois
  const { menuItems, isLoading, error } = useMenuData()

  const categories = useMemo(() => {
    return ["Tous", ...Array.from(new Set(menuItems.map((item) => item.category)))]
  }, [menuItems])

  const maxIndex = Math.max(0, categories.length - itemsPerPage);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  return (
    <section className="py-12">
      <div className="container">
        {/* Titre et boutons de navigation */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recherches rapides</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Liste des catégories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories
            .slice(currentIndex, currentIndex + itemsPerPage)
            .map((category) => (
              <Link
                key={category.id}
                href={`#`}
                // href={`/menu/${category.slug}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                  <h3 className="text-white text-center font-medium">{category.name}</h3>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
