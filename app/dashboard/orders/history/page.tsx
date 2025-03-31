"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, ChevronDown, ChevronUp, Search, Filter } from "lucide-react"
import { format } from "date-fns"
import { ro } from "date-fns/locale"

interface OrderItem {
  id: number
  name: string
  quantity: number
  notes?: string
  price: number
}

interface Order {
  id: number
  tableId: string
  items: OrderItem[]
  timestamp: number
  status: "completed" | "cancelled"
  type: "food" | "drinks" | "mixed"
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "cancelled">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "food" | "drinks" | "mixed">("all")

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
       
        const mockOrders: Order[] = [
          {
            id: 1,
            tableId: "12",
            items: [
              { id: 101, name: "Pizza Margherita", quantity: 2, price: 35, notes: "Fără ceapă" },
              { id: 102, name: "Paste Carbonara", quantity: 1, price: 32 },
            ],
            timestamp: Date.now() - 1000 * 60 * 60 * 2, 
            status: "completed",
            type: "food",
          },
          {
            id: 2,
            tableId: "8",
            items: [
              { id: 201, name: "Mojito", quantity: 3, price: 25 },
              { id: 202, name: "Aperol Spritz", quantity: 2, price: 28 },
            ],
            timestamp: Date.now() - 1000 * 60 * 60 * 3, 
            status: "completed",
            type: "drinks",
          },
          {
            id: 3,
            tableId: "5",
            items: [
              { id: 301, name: "Burger de vită", quantity: 1, price: 38 },
              { id: 302, name: "Cola", quantity: 1, price: 8 },
            ],
            timestamp: Date.now() - 1000 * 60 * 60 * 5, 
            status: "cancelled",
            type: "mixed",
          },
        ]

        setOrders(mockOrders)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching order history:", err)
        setError("Nu s-a putut încărca istoricul comenzilor")
        setLoading(false)
      }
    }

    fetchOrderHistory()
  }, [])

  const toggleOrderExpanded = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false
    }

    if (typeFilter !== "all" && order.type !== typeFilter) {
      return false
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()

      if (order.id.toString().includes(query) || order.tableId.toLowerCase().includes(query)) {
        return true
      }

      return order.items.some(
        (item) => item.name.toLowerCase().includes(query) || (item.notes && item.notes.toLowerCase().includes(query)),
      )
    }

    return true
  })

  const getStatusBadge = (status: "completed" | "cancelled") => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="bg-green-500">
            Finalizat
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Anulat</Badge>
    }
  }

  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Istoric comenzi</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Caută comenzi..."
              className="w-[200px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="completed">Finalizate</SelectItem>
              <SelectItem value="cancelled">Anulate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="food">Mâncare</SelectItem>
              <SelectItem value="drinks">Băuturi</SelectItem>
              <SelectItem value="mixed">Mixte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">Nu s-au găsit comenzi care să corespundă criteriilor de căutare</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    Comanda #{order.id} - Masa {order.tableId}
                  </CardTitle>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(order.timestamp, "dd MMM yyyy, HH:mm", { locale: ro })}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.items.length} produse</p>
                    <p className="text-sm text-muted-foreground">Total: {calculateOrderTotal(order.items)} lei</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleOrderExpanded(order.id)}
                  >
                    {expandedOrders[order.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {expandedOrders[order.id] && (
                  <div className="mt-4 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-1 border-b last:border-0">
                        <div>
                          <p className="font-medium">
                            {item.name} x{item.quantity}
                          </p>
                          {item.notes && <p className="text-xs text-muted-foreground mt-1">Note: {item.notes}</p>}
                        </div>
                        <p className="font-medium">{item.price * item.quantity} lei</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

