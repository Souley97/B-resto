import { HeroSection } from "@/components/hero-section"
import { FoodCategories } from "@/components/food-categories"
import { ProductGrid } from "@/components/product-grid"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProductCard } from "@/components/product-card"

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menuItems"))
        const productsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setProducts(productsData)
      } catch (error) {
        console.error("Error fetching products:", error)
        // Optionally, you can set an error state here and display it to the user
      }
    }

    fetchProducts()
  }, [])

  return (
    <>
      <main>
        <HeroSection />
        <FoodCategories />
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      </main>
    </>
  )
}

