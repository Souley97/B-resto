import { RestaurantHeader } from "@/components/restaurant-header"
import { MenuSection } from "@/components/menu-section"
import { ReviewsSection } from "@/components/reviews-section"

// This would normally come from your database
const restaurantData = {
  name: "Francesca Ristorante Italiano",
  rating: 4.8,
  cuisine: "Italien",
  address: "123 Rue de la Paix, Dakar",
  phone: "+221 12 345 6789",
  openingHours: "11:00 - 23:00",
  coverImage: "/placeholder.svg?height=300&width=1200",
}

const menuCategories = [
  {
    id: "starters",
    name: "Entrées",
    items: [
      {
        id: "1",
        name: "Bruschetta",
        description: "Pain grillé à l'ail, tomates, basilic et huile d'olive",
        price: 8.99,
        image: "/placeholder.svg?height=100&width=100",
        category: "starters",
      },
      // Add more items...
    ],
  },
  {
    id: "pasta",
    name: "Pâtes",
    items: [
      {
        id: "2",
        name: "Spaghetti Carbonara",
        description: "Pâtes fraîches, œuf, pecorino, guanciale",
        price: 16.99,
        image: "/placeholder.svg?height=100&width=100",
        category: "pasta",
      },
      // Add more items...
    ],
  },
  // Add more categories...
]

const reviews = [
  {
    id: "1",
    author: "Sophie M.",
    rating: 5,
    comment: "Excellent restaurant italien ! Les pâtes sont faites maison et le service est impeccable.",
    date: "15 janvier 2024",
  },
  {
    id: "2",
    author: "Jean D.",
    rating: 4,
    comment: "Très bonne cuisine, ambiance agréable. Un peu d'attente le weekend.",
    date: "10 janvier 2024",
  },
  // Add more reviews...
]

export default function RestaurantPage() {
  return (
    <>
      <main>
        <RestaurantHeader {...restaurantData} />
        <div className="container">
          <MenuSection categories={menuCategories} />
          <ReviewsSection reviews={reviews} averageRating={4.8} totalReviews={reviews.length} />
        </div>
      </main>
    </>
  )
}

