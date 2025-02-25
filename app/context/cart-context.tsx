"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface Order {
  items: CartItem[]
  timestamp: number
  total: number
}

interface CartState {
  items: CartItem[]
  total: number
  orderHistory: Order[]
  isOrderConfirmed: boolean
  isTableActive: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { id: number; name: string; price: number; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "CONFIRM_ORDER" }
  | { type: "RESET_ORDER_CONFIRMATION" }
  | { type: "REQUEST_BILL" }
  | { type: "RESET_TABLE" }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      if (!state.isTableActive) {
        return state
      }
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }
      }

      const newItems = [...state.items, { ...action.payload }]
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      )
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
      }
    case "CONFIRM_ORDER":
      if (state.items.length === 0) return state
      return {
        ...state,
        orderHistory: [
          ...state.orderHistory,
          {
            items: state.items,
            timestamp: Date.now(),
            total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          },
        ],
        items: [],
        total: 0,
        isOrderConfirmed: true,
      }
    case "RESET_ORDER_CONFIRMATION":
      return {
        ...state,
        isOrderConfirmed: false,
      }
    case "REQUEST_BILL":
      return {
        ...state,
        isTableActive: false,
      }
    case "RESET_TABLE":
      return {
        items: [],
        total: 0,
        orderHistory: [],
        isOrderConfirmed: false,
        isTableActive: true,
      }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    orderHistory: [],
    isOrderConfirmed: false,
    isTableActive: true,
  })

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}