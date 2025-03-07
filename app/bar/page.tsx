"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MenuSection } from "./menu-section"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MenuItem, MenuSection as MenuSectionType } from "@/app/bar/types"

export default function BarMenu() {
  const [groupedItems, setGroupedItems] = useState<MenuSectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        // Folosim endpoint-ul pentru băuturi (speciality class 2)
        const response = await fetch("https://lmndev.com/menuItem/viewMenuItemsBySpecialityClass/2")
        if (!response.ok) {
          throw new Error("Eroare la încărcarea meniului de băuturi")
        }

        // Obținem un array plat de MenuItem
        const data: MenuItem[] = await response.json()

        // Normalizează datele și asigură-te că avem toate proprietățile necesare
        const normalizedData: MenuItem[] = data.map((item) => ({
          ...item,
          image: item.image || "/placeholder.svg",
          category: item.category || "Altele", // Asigură-te că avem întotdeauna o categorie
        }))

        // Grupăm produsele după câmpul "category"
        const groups: { [key: string]: MenuItem[] } = {}
        normalizedData.forEach((item) => {
          if (!groups[item.category]) {
            groups[item.category] = []
          }
          groups[item.category].push(item)
        })

        // Convertim obiectul în array de MenuSection
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
    return (
      <div className="min-h-[100dvh] bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-red-500 p-4 bg-red-500/10 rounded-lg border border-red-500/20">Eroare: {error}</div>
      </div>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-[#1a1a1a] pb-20">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] p-4 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-yellow-500">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Meniu Bar</h1>
        </div>
      </header>

      <div className="p-4">
        {groupedItems.length > 0 ? (
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

