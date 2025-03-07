"use client"
import { useCart } from "@/app/context/cart-context"
import { toast } from "sonner"

const API_URL = "https://lmndev.com/command/create" 

/**
 * Custom hook pentru trimiterea comenzilor la backend.
 * Îl apelezi într-o componentă React, și îți returnează o funcție
 * pe care o poți folosi pentru a trimite comanda.
 */
export function useSendOrder() {
  const { state, dispatch } = useCart()

  const sendOrder = async () => {
    if (state.items.length === 0) {
      toast.error("Coșul este gol. Adaugă produse înainte de a trimite comanda.")
      return
    }

    const orderData = {
        tableId: 1,

        items: state.items.map(item => ({
          menuItem: { id: item.id },
          quantity: item.quantity,
          additionalNotes:item.notes, 
        })),
      }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Eroare la trimiterea comenzii")
      }

      const responseData = await response.json()
      toast.success("Comanda a fost trimisă cu succes!")
      dispatch({ type: "CONFIRM_ORDER" })
    } catch (error) {
      toast.error("A apărut o eroare la trimiterea comenzii")
      console.error(error)
    }
  }

  // întorci funcția pe care o vei apela în componentă
  return { sendOrder }
}