"use client"
import { useState, useEffect } from "react"
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Category {
  id: string
  name: string
  variants: string[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: "", variants: [] })
  const [newVariant, setNewVariant] = useState("")

  useEffect(() => {
    const q = query(collection(db, "categories"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const categoriesData: Category[] = []
      querySnapshot.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() } as Category)
      })
      setCategories(categoriesData)
    })

    return () => unsubscribe()
  }, [])

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    await addDoc(collection(db, "categories"), newCategory)
    setNewCategory({ name: "", variants: [] })
  }

  const updateCategory = async (id: string, updatedCategory: Partial<Category>) => {
    await updateDoc(doc(db, "categories", id), updatedCategory)
  }

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id))
  }

  const addVariant = () => {
    if (newVariant) {
      setNewCategory({
        ...newCategory,
        variants: [...newCategory.variants, newVariant],
      })
      setNewVariant("")
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Category and Variant Management</h1>
      <form onSubmit={addCategory} className="mb-8 space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="border p-2 w-full"
        />
        <div>
          <h3 className="font-bold mb-2">Variants</h3>
          {newCategory.variants.map((variant, index) => (
            <div key={index} className="mb-2">
              {variant}
            </div>
          ))}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="New Variant"
              value={newVariant}
              onChange={(e) => setNewVariant(e.target.value)}
              className="border p-2 flex-grow"
            />
            <button type="button" onClick={addVariant} className="bg-blue-500 text-white p-2 rounded">
              Add Variant
            </button>
          </div>
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">
          Add Category
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
            <h3 className="font-bold mb-2">Variants:</h3>
            <ul className="mb-4">
              {category.variants.map((variant, index) => (
                <li key={index}>{variant}</li>
              ))}
            </ul>
            <button onClick={() => deleteCategory(category.id)} className="bg-red-500 text-white p-2 rounded">
              Delete Category
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

