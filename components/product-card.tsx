"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      className="overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="relative overflow-hidden shadow-lg group">
        <Link href={`/menu/${product.id}`}>
          {/* Image avec effet */}
          <div className="relative aspect-video">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <h3 className="text-white text-lg font-semibold">{product.name}</h3>
            </div>
            <div className="absolute top-4 right-4 bg-black/70 px-2 py-1 rounded-lg shadow-md">
              <span className="text-sm font-medium text-white">{product.price} FCFA</span>
            </div>
          </div>
        </Link>

        {/* Contenu avec titre et description */}
        <CardContent className="p-4 max-h-32 h-28 space-y-2">
          <Link href={`/menu/${product.id}`}>
            <motion.h2
              className="text-lg font-semibold hover:text-orange-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {product.name}
            </motion.h2>
          </Link>
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </CardContent>

        {/* Bouton Ajouter */}
        
      </Card>
    </motion.div>
  );
}
