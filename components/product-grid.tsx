import type React from "react"

interface ProductGridProps {
  children: React.ReactNode
}

export function ProductGrid({ children }: ProductGridProps) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 mx-32 md:grid-cols-3 lg:grid-cols-3 gap-8">{children}</div>
}

