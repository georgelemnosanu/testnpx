"use client"

import { useState } from "react"
import { useCart } from "@/app/context/cart-context"
import { toast } from "sonner"

export function useSendOrder() {
  const { state, dispatch } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const sendOrder = async () => {
    if (state.items.length === 0) {
      toast.error("Nu poți trimite o comandă goală")
      return
    }

    setIsLoading(true)
    try {
      const tableId = state.tableId || sessionStorage.getItem("tableId")
      if (!tableId) {
        throw new Error("Nu s-a putut identifica masa")
      }

      const orderData = {
        tableId: Number.parseInt(tableId),
        menuItemsWithQuantities: state.items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          additionalNotes: item.notes || null,
        })),
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Eroare la trimiterea comenzii")
      }

      // Confirmăm comanda în starea locală
      dispatch({ type: "CONFIRM_ORDER" })

      toast.success("Comanda a fost trimisă cu succes!")

      // Resetăm confirmarea după 3 secunde
      setTimeout(() => {
        dispatch({ type: "RESET_ORDER_CONFIRMATION" })
      }, 3000)
    } catch (error) {
      console.error("Eroare la trimiterea comenzii:", error)
      toast.error("A apărut o eroare la trimiterea comenzii")
    } finally {
      setIsLoading(false)
    }
  }

  return { sendOrder, isLoading }
}

