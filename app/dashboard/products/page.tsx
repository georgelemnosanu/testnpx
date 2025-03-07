"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDescriptionType,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  ingredients: string[]
  category: string
}

interface Category {
  id: number
  name: string
}

interface FormData {
  name: string
  description: string
  price: string
  specialityId: string
  ingredients: string
  image: File | null
}

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    specialityId: "",
    ingredients: "",
    image: null,
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch categories
        const categoriesResponse = await fetch("http://lmndev.com/speciality/allSpeciality")
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        // Fetch menu items
        const itemsResponse = await fetch("http://lmndev.com/menuItem/viewAllMenuItems")
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Eroare la încărcarea datelor")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value)
        }
      })

      const response = await fetch(
        selectedItem
          ? `http://lmndev.com/menuItem/updateMenuItem/${selectedItem.id}`
          : "http://lmndev.com/menuItem/submitCreateMenuItem",
        {
          method: selectedItem ? "PUT" : "POST",
          body: formDataToSend,
        },
      )

      if (!response.ok) throw new Error("Eroare la salvare")

      toast.success(selectedItem ? "Produsul a fost actualizat cu succes" : "Produsul a fost adăugat cu succes")

      // Refresh the list
      const itemsResponse = await fetch("http://lmndev.com/menuItem/viewAllMenuItems")
      const itemsData = await itemsResponse.json()
      setItems(itemsData)

      // Reset form
      setIsAddDialogOpen(false)
      setImagePreview(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        specialityId: "",
        ingredients: "",
        image: null,
      })
      setSelectedItem(null)
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast.error(selectedItem ? "Eroare la actualizarea produsului" : "Eroare la salvarea produsului")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://lmndev.com/menuItem/deleteMenuItem/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Eroare la ștergere")

      toast.success("Produsul a fost șters cu succes")

      // Refresh the list
      const itemsResponse = await fetch("http://lmndev.com/menuItem/viewAllMenuItems")
      const itemsData = await itemsResponse.json()
      setItems(itemsData)
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast.error("Eroare la ștergerea produsului")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestionare Produse</h1>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) {
              setSelectedItem(null)
              setImagePreview(null)
              setFormData({
                name: "",
                description: "",
                price: "",
                specialityId: "",
                ingredients: "",
                image: null,
              })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adaugă produs nou
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="space-y-3">
              <DialogTitle>{selectedItem ? "Editează produs" : "Adaugă produs nou"}</DialogTitle>
              <DialogDescription>
                {selectedItem
                  ? "Modifică detaliile produsului. Câmpurile marcate cu * sunt obligatorii."
                  : "Completează detaliile produsului nou. Câmpurile marcate cu * sunt obligatorii."}
              </DialogDescription>
            </DialogHeader>
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6 py-4">
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex flex-col items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-full h-40">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          fill
                          className="rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => {
                            setImagePreview(null)
                            setFormData((prev) => ({ ...prev, image: null }))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Label
                        htmlFor="image"
                        className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click pentru a încărca o imagine</span>
                      </Label>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      required={!selectedItem}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nume produs *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preț (lei) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="category">Categorie *</Label>
                  <Select
                    value={formData.specialityId}
                    onValueChange={(value: string) => setFormData((prev) => ({ ...prev, specialityId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Descriere *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    className="h-20"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="ingredients">Ingrediente (separate prin virgulă) *</Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ingredients: e.target.value }))}
                    required
                    className="h-20"
                  />
                </div>
              </div>
            </form>
            <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setImagePreview(null)
                  setFormData({
                    name: "",
                    description: "",
                    price: "",
                    specialityId: "",
                    ingredients: "",
                    image: null,
                  })
                  setSelectedItem(null)
                }}
              >
                Anulează
              </Button>
              <Button type="submit" form="product-form" disabled={isLoading}>
                {isLoading ? "Se salvează..." : selectedItem ? "Actualizează" : "Salvează"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Imagine</TableHead>
              <TableHead>Nume</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead>Preț</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.price} lei</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedItem(item)
                        setIsAddDialogOpen(true)
                        setImagePreview(item.image)
                        setFormData({
                          name: item.name,
                          description: item.description,
                          price: item.price.toString(),
                          specialityId: item.category,
                          ingredients: item.ingredients.join(", "),
                          image: null,
                        })
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                          <AlertDialogDescriptionType>
                            Această acțiune nu poate fi anulată. Produsul va fi șters definitiv.
                          </AlertDialogDescriptionType>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Șterge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

