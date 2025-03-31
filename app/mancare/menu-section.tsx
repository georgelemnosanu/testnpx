"use client"

import { useState } from "react"
import Image from "next/image"
import { useCart } from "@/app/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { BellRing, ChevronRight, Minus, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image: string
  ingredients: string[]
}

interface MenuSectionProps {
  section: {
    title: string
    items: MenuItem[]
  }
}

export function MenuSection({ section }: MenuSectionProps) {
  const { state, dispatch } = useCart()
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const [notes, setNotes] = useState<{ [key: number]: string }>({})
  const [dialogOpen, setDialogOpen] = useState(false)

  const addToOrder = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: quantity,
        notes: notes[item.id],
      },
    })

    toast.success(`${item.name} adăugat în coș`, {
      description: `Cantitate: ${quantity}`,
    })

    setDialogOpen(false)

    setQuantities((prev) => ({ ...prev, [item.id]: 1 }))
    setNotes((prev) => ({ ...prev, [item.id]: "" }))
  }

  const updateQuantity = (id: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }))
  }

  const callWaiter = () => {
    toast.success("Chelnerul a fost chemat", {
      description: "Un ospătar va veni la masa dvs. în curând",
    })
    setDialogOpen(false)
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-white">{section.title}</h2>
      <div className="grid gap-4">
        {section.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <Dialog
              open={dialogOpen && selectedItem?.id === item.id}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (open) {
                  setSelectedItem(item)
                } else {
                  setSelectedItem(null)
                }
              }}
            >
              <DialogTrigger asChild>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item)
                    setDialogOpen(true)
                  }}
                >
                  <div className="flex overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="h-[120px] w-[120px] object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between p-4 pt-0">
                        <span className="font-semibold">{item.price} lei</span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </CardFooter>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-xl overflow-hidden">
                <DialogHeader>
                  <DialogTitle>{item.name}</DialogTitle>
                  <DialogDescription>{item.description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 p-1">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={377}
                    height={200}
                    className="h-[200px] w-full rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="mb-3 font-semibold">Ingrediente:</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border p-4">
                      {item.ingredients.map((ingredient) => (
                        <li key={ingredient} className="text-sm list-none">
                          • {ingredient}
                        </li>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Note adiționale:</label>
                      <Textarea
                        placeholder="Specificații speciale, alergii, etc."
                        value={notes[item.id] || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="resize-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Cantitate:</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, -1)
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={quantities[item.id] || 1}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.id]: Math.max(1, Number.parseInt(e.target.value) || 1),
                            }))
                          }
                          className="h-8 w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateQuantity(item.id, 1)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full h-12" onClick={() => addToOrder(item)}>
                      Adaugă la comandă ({item.price * (quantities[item.id] || 1)} lei)
                    </Button>
                    <Button variant="outline" className="w-full" onClick={callWaiter}>
                      <BellRing className="mr-2 h-4 w-4" />
                      Cheamă chelnerul
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </div>
    </section>
  )
}

