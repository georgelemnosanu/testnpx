"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  notes?: string
}

interface Order {
  id?: number
  items: CartItem[]
  timestamp: number
  total: number
  tableId?: string
  userId?: string
}

interface CartState {
  items: CartItem[]
  total: number
  orderHistory: Order[]
  tableOrders: Order[]
  isOrderConfirmed: boolean
  isTableActive: boolean
  tableId: string | null
  userId: string | null
}

interface MenuItem {
  id: number
  name: string
  price: number
}

interface CommandMenuItem {
  id: number
  menuItem: MenuItem
  quantity: number
  additionalNotes?: string | null
}

interface Command {
  id: number
  table: {
    id: number
    tableName: string
  }
  menuItemsWithQuantities: CommandMenuItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { id: number; name: string; price: number; quantity: number; notes?: string } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "UPDATE_NOTES"; payload: { id: number; notes: string } }
  | { type: "CLEAR_CART" }
  | { type: "CONFIRM_ORDER" }
  | { type: "RESET_ORDER_CONFIRMATION" }
  | { type: "REQUEST_BILL" }
  | { type: "RESET_TABLE" }
  | { type: "SET_TABLE_ID"; payload: string }
  | { type: "SET_USER_ID"; payload: string }
  | { type: "SET_TABLE_ORDERS"; payload: Order[] }
  | { type: "SET_BILL_REQUESTED"; payload: boolean }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  fetchTableOrders: () => Promise<void>
} | null>(null)

const isBrowser = typeof window !== "undefined"

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState

  switch (action.type) {
    case "SET_TABLE_ID":
      newState = {
        ...state,
        tableId: action.payload,
      }
      break
    case "SET_USER_ID":
      newState = {
        ...state,
        userId: action.payload,
      }
      break
    case "SET_TABLE_ORDERS":
      newState = {
        ...state,
        tableOrders: action.payload,
      }
      break
    case "ADD_ITEM": {
      if (!state.isTableActive) {
        return state
      }
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: item.quantity + action.payload.quantity,
                notes: action.payload.notes || item.notes,
              }
            : item,
        )
        newState = {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }
      } else {
        const newItems = [...state.items, { ...action.payload }]
        newState = {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }
      }
      break
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      newState = {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
      break
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      newState = {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
      break
    }
    case "UPDATE_NOTES": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, notes: action.payload.notes } : item,
      )
      newState = {
        ...state,
        items: newItems,
      }
      break
    }
    case "CLEAR_CART":
      newState = {
        ...state,
        items: [],
        total: 0,
      }
      break
    case "CONFIRM_ORDER":
      if (state.items.length === 0) return state

      const newOrder = {
        items: state.items,
        timestamp: Date.now(),
        total: state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        tableId: state.tableId || undefined,
        userId: state.userId || undefined,
      }

      newState = {
        ...state,
        orderHistory: [...state.orderHistory, newOrder],
        items: [],
        total: 0,
        isOrderConfirmed: true,
      }
      break
    case "RESET_ORDER_CONFIRMATION":
      newState = {
        ...state,
        isOrderConfirmed: false,
      }
      break
    case "REQUEST_BILL":
      newState = {
        ...state,
        isTableActive: false,
      }
      break
    case "RESET_TABLE":
      newState = {
        items: [],
        total: 0,
        orderHistory: [],
        tableOrders: [],
        isOrderConfirmed: false,
        isTableActive: true,
        tableId: state.tableId,
        userId: state.userId,
      }
      break
    case "SET_BILL_REQUESTED":
      newState = {
        ...state,
        isTableActive: !action.payload,
      }
      break
    default:
      return state
  }

  if (isBrowser) {
    try {
      localStorage.setItem("cartState", JSON.stringify(newState))
    } catch (error) {
      console.warn("Nu s-a putut salva starea în localStorage:", error)
    }
  }

  return newState
}

function generateUserId() {
  return `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
}

function sanitizeCartState(state: any): CartState {
  if (!state || typeof state !== "object") {
    return getDefaultCartState()
  }

  const sanitizedOrderHistory = Array.isArray(state.orderHistory)
    ? state.orderHistory.map((order: Partial<Order>) => ({
        ...order,
        timestamp: typeof order.timestamp === "number" ? order.timestamp : Date.now(),
        items: Array.isArray(order.items) ? order.items : [],
        total: typeof order.total === "number" ? order.total : 0,
      }))
    : []

  const sanitizedTableOrders = Array.isArray(state.tableOrders)
    ? state.tableOrders.map((order: Partial<Order>) => ({
        ...order,
        timestamp: typeof order.timestamp === "number" ? order.timestamp : Date.now(),
        items: Array.isArray(order.items) ? order.items : [],
        total: typeof order.total === "number" ? order.total : 0,
      }))
    : []

  return {
    items: Array.isArray(state.items) ? state.items : [],
    total: typeof state.total === "number" ? state.total : 0,
    orderHistory: sanitizedOrderHistory,
    tableOrders: sanitizedTableOrders,
    isOrderConfirmed: Boolean(state.isOrderConfirmed),
    isTableActive: state.isTableActive !== false,
    tableId: typeof state.tableId === "string" ? state.tableId : null,
    userId: typeof state.userId === "string" ? state.userId : null,
  }
}

function getDefaultCartState(): CartState {
  return {
    items: [],
    total: 0,
    orderHistory: [],
    tableOrders: [],
    isOrderConfirmed: false,
    isTableActive: true,
    tableId: null,
    userId: null,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const loadInitialState = (): CartState => {
    if (!isBrowser) {
      return getDefaultCartState()
    }

    try {
      const savedState = localStorage.getItem("cartState")
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        return sanitizeCartState(parsedState)
      }
    } catch (error) {
      console.warn("Nu s-a putut încărca starea din localStorage:", error)
    }

    return getDefaultCartState()
  }

  const [state, dispatch] = useReducer(cartReducer, loadInitialState())

  useEffect(() => {
    if (!state.userId && isBrowser) {
      let userId = localStorage.getItem("userId")
      if (!userId) {
        userId = generateUserId()
        localStorage.setItem("userId", userId)
      }
      dispatch({ type: "SET_USER_ID", payload: userId })
    }
  }, [state.userId])

  useEffect(() => {
    if (!state.tableId && isBrowser) {
      const tableSession = sessionStorage.getItem("table_session")
      if (tableSession) {
        try {
          const session = JSON.parse(tableSession)
          dispatch({ type: "SET_TABLE_ID", payload: session.tableId })
        } catch (error) {
          console.warn("Eroare la parsarea sesiunii mesei:", error)
        }
      }
    }
  }, [state.tableId])

  const fetchTableOrders = useCallback(async () => {
    if (!state.tableId) {
      console.log("Nu se poate face fetch la comenzi: tableId lipsește")
      return
    }

    try {
      console.log(`Fetching orders for table: ${state.tableId}`)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/command/table/${state.tableId}`)
      if (!response.ok) throw new Error("Eroare la preluarea comenzilor")

      const data = await response.json()

      if (data.billRequested && state.isTableActive) {
        dispatch({ type: "SET_BILL_REQUESTED", payload: true })
      }

      const orders: Command[] = data.orders || []

      const formattedOrders = orders.map((command) => ({
        id: command.id,
        tableId: String(command.table.id),
        timestamp: Date.now(),
        items: command.menuItemsWithQuantities.map((menuItem) => ({
          id: menuItem.menuItem.id,
          name: menuItem.menuItem.name,
          price: menuItem.menuItem.price,
          quantity: menuItem.quantity,
          notes: menuItem.additionalNotes || "",
        })),
        total: command.menuItemsWithQuantities.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
      }))

      dispatch({ type: "SET_TABLE_ORDERS", payload: formattedOrders })
      console.log("Comenzile mesei au fost încărcate:", formattedOrders)
    } catch (error) {
      console.error("Eroare la preluarea comenzilor mesei:", error)
    }
  }, [state.tableId, state.isTableActive, dispatch])

  useEffect(() => {
    if (state.tableId && isBrowser) {
      fetchTableOrders()
    }
  }, [state.tableId])

  return <CartContext.Provider value={{ state, dispatch, fetchTableOrders }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

