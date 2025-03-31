"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "./context/cart-context"
import { toast } from "sonner"

export default function HomePage() {
  const router = useRouter()
  const { dispatch, state } = useCart()
  const [loading, setLoading] = useState(true)
  const [hasTableId, setHasTableId] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const tableId = params.get("tableId")

    if (tableId) {
      sessionStorage.setItem("tableId", tableId)
      setHasTableId(true)

      dispatch({ type: "SET_TABLE_ID", payload: tableId })

      toast.success("Masa a fost configurată", {
        description: `Ești conectat la masa ${tableId}`,
      })

      router.replace("/menu")
    } else {
      const storedTableId = sessionStorage.getItem("tableId")

      if (!storedTableId) {
        setHasTableId(false)
        toast.error("Nu ești conectat la o masă", {
          description: "Te rugăm să scanezi codul QR de pe masă",
          duration: 5000,
        })
      } else {
        setHasTableId(true)
        dispatch({ type: "SET_TABLE_ID", payload: storedTableId })

        checkTableStatus(storedTableId)

        router.replace("/menu")
      }
    }

    setLoading(false)
  }, [router, dispatch])

  const checkTableStatus = async (tableId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/command/table/${tableId}`)

      if (!response.ok) {
        throw new Error("Eroare la verificarea stării mesei")
      }

      const data = await response.json()

      if (data.billRequested || !data.isActive) {
        dispatch({ type: "RESET_TABLE" })
        toast.info("Masa a fost resetată", {
          description: "Comenzile anterioare au fost finalizate",
        })
      }
    } catch (error) {
      console.error("Eroare la verificarea stării mesei:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-900/20 to-black/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Restaurant LMN</h1>

        {!hasTableId && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8 max-w-md text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Nu ești conectat la o masă</h2>
            <p className="text-white mb-4">Pentru a comanda, te rugăm să scanezi codul QR de pe masă.</p>
            <div className="flex justify-center">
              <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm2 2v2h2v-2zm10-2h6v6h-6zm2 2v2h2v-2zM5 5v2h2V5zm12 0v2h2V5zM5 17v2h2v-2zm12 0v2h2v-2z" />
              </svg>
            </div>
            <p className="text-white mt-4">Deschide camera telefonului și scanează codul QR de pe masă.</p>
          </div>
        )}

      </div>

      {/* Bottom gradient line */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
    </div>
  )
}

