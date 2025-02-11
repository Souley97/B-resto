"use client"
import { useState, useEffect } from "react"
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Delete, DeleteIcon, Loader2, ArchiveX } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import Image from "next/image"

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

const emptyMenuItem: Omit<MenuItem, "id"> = {
  name: "",
  description: "",
  price: 0,
  category: "",
  image: "",
  extras: [],
  sizes: [],
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>(emptyMenuItem)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newExtra, setNewExtra] = useState("")
  const [newSize, setNewSize] = useState({ id: "", name: "", price: 0 })
  const [preview, setPreview] = useState("");
  useEffect(() => {
    const q = query(collection(db, "menuItems"))
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: MenuItem[] = []
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as MenuItem)
        })
        setMenuItems(items)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching menu items:", err)
        setError("Failed to load menu items. Please try again later.")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const addMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, "menuItems"), newItem)
      setNewItem(emptyMenuItem)
    } catch (err) {
      console.error("Error adding menu item:", err)
      setError("Failed to add menu item. Please try again.")
    }
  }

  const updateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      try {
        await updateDoc(doc(db, "menuItems", editingItem.id), editingItem)
        setEditingItem(null)
      } catch (err) {
        console.error("Error updating menu item:", err)
        setError("Failed to update menu item. Please try again.")
      }
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "menuItems", id))
    } catch (err) {
      console.error("Error deleting menu item:", err)
      setError("Failed to delete menu item. Please try again.")
    }
  }

  const addExtra = () => {
    if (newExtra) {
      const updatedExtras = editingItem
        ? [...(editingItem.extras || []), newExtra]
        : [...(newItem.extras || []), newExtra]
      editingItem
        ? setEditingItem({ ...editingItem, extras: updatedExtras })
        : setNewItem({ ...newItem, extras: updatedExtras })
      setNewExtra("")
    }
  }

  const addSize = () => {
    if (newSize.id && newSize.name && newSize.price) {
      const updatedSizes = editingItem ? [...(editingItem.sizes || []), newSize] : [...(newItem.sizes || []), newSize]
      editingItem
        ? setEditingItem({ ...editingItem, sizes: updatedSizes })
        : setNewItem({ ...newItem, sizes: updatedSizes })
      setNewSize({ id: "", name: "", price: 0 })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        <span className="text-xl font-semibold">Loading menu items...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  const currentItem = editingItem || newItem
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Affichage de l'aperçu
        editingItem
          ? setEditingItem({ ...editingItem, image: reader.result })
          : setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container">
      <Card className="rounded-3xl justify-between bg-gradient-to-r lg:p-8 p-3 bg-white/10 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6">Menu Admin</h1>

        <form onSubmit={editingItem ? updateMenuItem : addMenuItem} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className=" items-center ">
            <label htmlFor="description">Nom complet</label>
          
            <Input
              type="text"
              placeholder="Souleymane Ndiaye"
              value={currentItem.name}
              onChange={(e) =>
                editingItem
                  ? setEditingItem({ ...editingItem, name: e.target.value })
                  : setNewItem({ ...newItem, name: e.target.value })
              }
              required
            />
            </div>

          {/* div avec label et input*/}

          <div className=" items-center ">
            <label htmlFor="description">Prix</label>
            <Input
              type="number"
              placeholder="Price"
              value={currentItem.price}
              onChange={(e) =>
                editingItem
                  ? setEditingItem({ ...editingItem, price: Number(e.target.value) })
                  : setNewItem({ ...newItem, price: Number(e.target.value) })
              }
              required
            />
          </div>

            
          <div className=" items-center ">
            <label htmlFor="description">Categorie</label>
          
            <Select
              onValueChange={(value) =>
                editingItem
                  ? setEditingItem({ ...editingItem, category: value })
                  : setNewItem({ ...newItem, category: value })
              }
              value={currentItem.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appetizer">Membre daahira</SelectItem>
                <SelectItem value="main">Client simple</SelectItem>
                {/* <SelectItem value="dessert">Dessert</SelectItem>
                <SelectItem value="drink">Drink</SelectItem>*/}
              </SelectContent> 
            </Select>
            </div>
            <div className=" items-center ">
            <label htmlFor="description">Image</label>
          
            {/* Input de type file pour sélectionner une image locale */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2 border p-2 w-full"
            /> 
           
            </div>
            {preview && (
              <div className="mt-0">
                <p className="text-sm text-gray-500">Preview :</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-12 h-12 object-cover border rounded-md"
                />
              </div>
            )}
            {/* Widget Cloudinary pour uploader l'image */}
            {/* <CldUploadWidget
              uploadPreset="ton_upload_preset"
              onUpload={(result) => {
                const imageUrl = result.info.secure_url;
                setPreview(imageUrl); // Affichage de l'image après upload
                editingItem
                  ? setEditingItem({ ...editingItem, image: imageUrl })
                  : setNewItem({ ...newItem, image: imageUrl });
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Upload via Cloudinary
                </button>
              )}
            </CldUploadWidget> */}

            {/* Affichage de l'aperçu de l'image sélectionnée */}
          
            {/* <Input
  type="file"
  onChange={(e) => {
    const file = e.target.files[0]; // Récupère le fichier sélectionné
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editingItem
          ? setEditingItem({ ...editingItem, image: reader.result })
          : setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }}
  required
/>




<CldUploadWidget
  uploadPreset="ton_upload_preset"
  onUpload={(result) => {
    const imageUrl = result.info.secure_url;
    editingItem
      ? setEditingItem({ ...editingItem, image: imageUrl })
      : setNewItem({ ...newItem, image: imageUrl });
  }}
>
  {({ open }) => (
    <Button type="button" onClick={() => open()}>
      Upload Image
    </Button>
  )}
</CldUploadWidget>

{/* Affichage de l'image */}
            {/* {currentItem.image && (
              <CldImage
                src={currentItem.image}
                width="200"
                height="200"
                alt="Product Image"
              />
            )} */}
          </div>

          <Textarea
            placeholder="Description"
            value={currentItem.description}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, description: e.target.value })
                : setNewItem({ ...newItem, description: e.target.value })
            }
            required
          />

          {/* Extras Section */}
          <div>
            <h3 className="font-bold mb-2">Extras</h3>
            {(currentItem.extras || []).map((extra, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input value={extra} readOnly />
                <Button
                  className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white"
                  type="button"
                  onClick={() => {
                    const updatedExtras = (currentItem.extras || []).filter((_, i) => i !== index);
                    editingItem
                      ? setEditingItem({ ...editingItem, extras: updatedExtras })
                      : setNewItem({ ...newItem, extras: updatedExtras });
                  }}
                >
                  <ArchiveX />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="New Extra"
                value={newExtra}
                onChange={(e) => setNewExtra(e.target.value)}
              />
              <Button
                type="button"
                onClick={addExtra}
                className="bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500 text-white"
              >
                Add Extra
              </Button>
            </div>
          </div>

          {/* Sizes Section */}
          <div>
            <h3 className="font-bold mb-2">Sizes</h3>
            {(currentItem.sizes || []).map((size, index) => (
              <div key={index} className="flex flex-wrap   items-center gap-2 mb-2">
                <Input value={size.name} readOnly />
                <Input value={size.price} readOnly />
                <Button
                  className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white"
                  type="button"
                  onClick={() => {
                    const updatedSizes = (currentItem.sizes || []).filter((_, i) => i !== index);
                    editingItem
                      ? setEditingItem({ ...editingItem, sizes: updatedSizes })
                      : setNewItem({ ...newItem, sizes: updatedSizes });
                  }}
                >
                  <ArchiveX />
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Input
                type="text"
                placeholder="Size ID"
                value={newSize.id}
                onChange={(e) => setNewSize({ ...newSize, id: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Size Name"
                value={newSize.name}
                onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Size Price"
                value={newSize.price}
                onChange={(e) => setNewSize({ ...newSize, price: Number(e.target.value) })}
              />
              <Button
                className="bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-500 text-white"
                type="button"
                onClick={addSize}
              >
                Add Size
              </Button>

            </div>
          </div>

          <Button
            className="bg-gradient-to-r w-full from-indigo-400 via-blue-500 to-purple-500 text-white"
            type="submit"
          >
            {editingItem ? "Update Item" : "Add Item"}
          </Button>

          {editingItem && (
            <Button type="button" onClick={() => setEditingItem(null)} variant="outline">
              Cancel Edit
            </Button>
          )}
        </form>
      </Card>

      {/* Menu Items Table */}
      <Card className="rounded-3xl justify-between bg-gradient-to-r mt-5 bg-white/10 backdrop-blur-xl border-white border-2 shadow-xl transition-all duration-300">
        <h1 className="text-3xl font-bold m-6">Menu</h1>

        {menuItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell> <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name} width="30" // Transform the image: auto-crop to square aspect_ratio
                    height="30"

                  /></TableCell>
                  <TableCell> {item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.price} FCFA</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Button onClick={() => setEditingItem(item)} className="mr-2">
                      Edit
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 text-white"
                      onClick={() => deleteMenuItem(item.id)}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center">No menu items available.</p>
        )}
      </Card>
    </div>

  )
}

