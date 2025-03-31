"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MenuSection } from "./menu-section"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MenuItem, MenuSection as MenuSectionType } from "@/app/mancare/types"

export default function MancareMenu() {
  const [groupedItems, setGroupedItems] = useState<MenuSectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menuItem/viewMenuItemsBySpecialityClass/1`)
        if (!response.ok) {
          throw new Error("Eroare la încărcarea meniului")
        }

        const data: MenuItem[] = await response.json()

        const normalizedData: MenuItem[] = data.map((item) => ({
          ...item,
          image: item.image || "/placeholder.svg",
          category: item.category || "Altele", 
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

        setGroupedItems(groupedArray)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  if (loading) {
    return <div className="text-white">Se încarcă...</div>
  }

  if (error) {
    return <div className="text-red-500">Eroare: {error}</div>
  }

  return (
    <main className="min-h-[100dvh] bg-[#1a1a1a] pb-20">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] p-4 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/menu">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-yellow-500">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Meniu Bucătărie</h1>
        </div>
      </header>

      <div className="p-4">
        {groupedItems.map((section) => (
          <MenuSection key={section.title} section={section} />
        ))}
      </div>
    </main>
  )
}

