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
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Plus } from "lucide-react"

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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const { dispatch } = useCart()

  const addToOrder = (item: MenuItem) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        name: item.name,
        price: item.price,
      },
    })
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-white">{section.title}</h2>
      <div className="grid gap-4">
        {section.items.map((item) => (
          <Card key={item.id} className="flex overflow-hidden">
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => addToOrder(item)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => setSelectedItem(item)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {selectedItem && (
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{selectedItem.name}</DialogTitle>
                          <DialogDescription>{selectedItem.description}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <Image
                            src={selectedItem.image || "/placeholder.svg"}
                            alt={selectedItem.name}
                            width={377}
                            height={200}
                            className="h-[200px] w-full rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="mb-2 font-semibold">Ingrediente:</h3>
                            <ScrollArea className="h-[80px] rounded-md border p-4">
                              <ul className="list-inside list-disc space-y-1">
                                {selectedItem.ingredients.map((ingredient) => (
                                  <li key={ingredient} className="text-sm">
                                    {ingredient}
                                  </li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </div>
                          <Button className="w-full" onClick={() => addToOrder(selectedItem)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adaugă la comandă ({selectedItem.price} lei)
                          </Button>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

