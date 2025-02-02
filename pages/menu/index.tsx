"use client"
import { useState, useEffect, useMemo } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Search, SlidersHorizontal, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProductCard } from "@/components/product-card"
import { ProductGrid } from "@/components/product-grid"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

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

// Custom hook for menu data management
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

// Filter component
const FilterSheet = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
}: {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon" className="relative">
        <SlidersHorizontal className="h-4 w-4" />
        {selectedCategory !== "Tous" && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-600" />
        )}
      </Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Filtres</SheetTitle>
        <SheetDescription>Affinez votre recherche avec nos filtres</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Catégorie</h3>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Trier par</h3>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommandés</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="name">Nom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SheetContent>
  </Sheet>
)

export default function MenuPage() {
  const { menuItems, isLoading, error } = useMenuData()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [sortBy, setSortBy] = useState("recommended")

  // Debounce search query to prevent excessive filtering
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Memoize categories to prevent unnecessary recalculations
  const categories = useMemo(() => {
    return ["Tous", ...Array.from(new Set(menuItems.map((item) => item.category)))]
  }, [menuItems])

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    return menuItems
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          product.description.toLowerCase().includes(debouncedSearch.toLowerCase())
        const matchesCategory = selectedCategory === "Tous" || product.category === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.price - b.price
          case "price-desc":
            return b.price - a.price
          case "name":
            return a.name.localeCompare(b.name)
          default:
            return 0
        }
      })
  }, [menuItems, debouncedSearch, selectedCategory, sortBy])

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <main className="container py-6 min-h-screen">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Notre Menu</h1>
          <div className="flex w-full sm:w-auto gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un plat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <FilterSheet
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "whitespace-nowrap transition-all",
                selectedCategory === category && "bg-orange-600 hover:bg-orange-700"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun produit trouvé</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("Tous")
                  }}
                  className="mt-2"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <ProductGrid>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
            )}
          </>
        )}
      </div>
    </main>
  )
}