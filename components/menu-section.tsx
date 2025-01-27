"use client"
import { useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

interface MenuSectionProps {
  categories: MenuCategory[]
}

export function MenuSection({ categories }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id)

  return (
    <div className="py-8">
      <Tabs defaultValue={categories[0]?.id} className="w-full">
        <TabsList className="w-full justify-start mb-8 overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="min-w-[120px]"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex gap-4">
                    {item.image && (
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.price} €</p>
                          <Button size="sm" className="mt-2">
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

