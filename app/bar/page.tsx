"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MenuSection } from "./menu-section"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Cart } from "@/app/components/cart"
import type { MenuItem, MenuSection as MenuSectionType } from "@/app/bar/types"

export default function BarMenu() {
  const [groupedItems, setGroupedItems] = useState<MenuSectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menuItem/viewMenuItemsBySpecialityClass/2`)
        if (!response.ok) {
          throw new Error("Eroare la încărcarea meniului de băuturi")
        }

        const data: MenuItem[] = await response.json()

        const normalizedData: MenuItem[] = data.map((item) => ({
          ...item,
          image: item.image || "/placeholder.svg",
          category: item.category || "Altele", 
          ingredients: item.ingredients || [], 
        }))

       
        const groups: { [key: string]: MenuItem[] } = {}
        normalizedData.forEach((item) => {
          if (!groups[item.category]) {
            groups[item.category] = []
          }
          groups[item.category].push(item)
        })

        const groupedArray: MenuSectionType[] = Object.keys(groups).map((category) => ({
          title: category,
          items: groups[category],
        }))

        groupedArray.sort((a, b) => a.title.localeCompare(b.title))

        setGroupedItems(groupedArray)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  return (
    <main className="min-h-[100dvh] bg-[#1a1a1a] pb-20">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/menu">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-yellow-500">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Meniu Bar</h1>
          </div>
          <Cart />
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 bg-gray-700" />
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-[120px] w-full bg-gray-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-white py-12">
            <div className="text-red-500 p-4 bg-red-500/10 rounded-lg border border-red-500/20 mx-auto max-w-md">
              <p className="font-semibold mb-2">Eroare la încărcarea meniului</p>
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4 border-red-500 text-red-500 hover:bg-red-500/10"
                onClick={() => window.location.reload()}
              >
                Reîncearcă
              </Button>
            </div>
          </div>
        ) : groupedItems.length > 0 ? (
          groupedItems.map((section) => <MenuSection key={section.title} section={section} />)
        ) : (
          <div className="text-center text-white py-12">
            <p>Nu există băuturi disponibile momentan.</p>
          </div>
        )}
      </div>
    </main>
  )
}

