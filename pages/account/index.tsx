"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface UserInfo {
  name: string
  email: string
  phone: string
}

export default function AccountPage() {
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the updated info to your backend
    console.log("Updated user info:", userInfo)
    setIsEditing(false)
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été mises à jour avec succès.",
    })
  }

  return (
    <>
      <main className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Mon compte</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Gérez vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                {isEditing ? (
                  <Button type="submit">Enregistrer les modifications</Button>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Modifier
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programme de fidélité</CardTitle>
              <CardDescription>Consultez vos points et récompenses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">500 points</p>
              <p className="mb-4">Vous êtes à mi-chemin d'une récompense gratuite !</p>
              <Button>Voir les récompenses disponibles</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

