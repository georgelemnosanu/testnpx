"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, Check, Coffee, UtensilsCrossed, Bell, BellOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ro } from "date-fns/locale"
import { toast } from "sonner"

// Interfețe pentru datele primite de la API
interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  speciality: {
    specialityClass: {
      id: number
      name: string // "Mancare" sau "Bauturi"
    }
  }
  category: string
}

interface MenuItemWithQuantity {
  id: number
  menuItem: MenuItem
  quantity: number
  additionalNotes: string | null
}

interface ApiOrder {
  id: number
  table: {
    id: number
    tableName: string
  }
  menuItemsWithQuantities: MenuItemWithQuantity[]
  status: "PENDING" | "IN_PROGRESS" | "CLOSED"
}

// Interfețe pentru datele folosite în componenta noastră
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
  status: "PENDING" | "IN_PROGRESS" | "CLOSED"
  type: "Mancare" | "Bauturi"
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch orders from the API
  const fetchOrders = async () => {
    try {
      const response = await fetch("https://lmndev.com/command/viewAllCommand")
      if (!response.ok) throw new Error("Eroare la preluarea comenzilor")

      const apiOrders: ApiOrder[] = await response.json()

      // Transformăm datele din formatul API în formatul necesar componentei
      const transformedOrders: Order[] = apiOrders
        .filter((order) => order.status !== "CLOSED") // Filtrăm doar comenzile active
        .map((apiOrder) => {
          // Determinăm tipul comenzii (Mancare sau Bauturi) bazat pe primul produs
          // Dacă comanda are produse de ambele tipuri, o vom clasifica după primul produs
          const orderType =
            apiOrder.menuItemsWithQuantities.length > 0
              ? (apiOrder.menuItemsWithQuantities[0].menuItem.speciality.specialityClass.name as "Mancare" | "Bauturi")
              : "Mancare" // Default în caz că nu există produse

          // Transformăm produsele
          const items: OrderItem[] = apiOrder.menuItemsWithQuantities.map((item) => ({
            id: item.id,
            name: item.menuItem.name,
            quantity: item.quantity,
            notes: item.additionalNotes || undefined,
            price: item.menuItem.price,
          }))

          return {
            id: apiOrder.id,
            tableId: apiOrder.table.tableName,
            items: items,
            timestamp: Date.now() - Math.floor(Math.random() * 1000 * 60 * 10), // Simulăm un timestamp
            status: apiOrder.status,
            type: orderType,
          }
        })

      // Verificăm dacă au apărut comenzi noi pentru a reda sunetul
      if (orders.length > 0 && transformedOrders.length > orders.length) {
        playNotificationSound()
      }

      setOrders(transformedOrders)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Nu s-au putut încărca comenzile")
      setLoading(false)
    }
  }

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Set up polling for new orders
  useEffect(() => {
    fetchOrders()

    pollingIntervalRef.current = setInterval(() => {
      fetchOrders()
    }, 10000) // Poll every 10 seconds

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, []) // Removed fetchOrders from dependencies

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing notification sound:", err)
      })
    }
  }

  // Toggle sound notifications
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    toast.success(soundEnabled ? "Notificări sonore dezactivate" : "Notificări sonore activate")
  }

  // Update order status via API PATCH
  const updateOrderStatus = async (orderId: number, status: "PENDING" | "IN_PROGRESS" | "CLOSED") => {
    try {
      const response = await fetch(`https://lmndev.com/command/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Eroare la actualizarea statusului comenzii")
      }

      // Actualizăm starea locală
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)))

      toast.success(`Comanda #${orderId} a fost actualizată la ${status}`)

      // Dacă statusul este CLOSED, reîmprospătăm lista pentru a o elimina
      if (status === "CLOSED") {
        setTimeout(() => {
          fetchOrders()
        }, 1000)
      }
    } catch (err) {
      console.error("Error updating order status:", err)
      toast.error("Nu s-a putut actualiza statusul comenzii")
    }
  }

  // Filter orders by type and status
  const getFilteredOrders = (type: "Mancare" | "Bauturi", status?: "PENDING" | "IN_PROGRESS" | "CLOSED") => {
    return orders.filter((order) => order.type === type && (status ? order.status === status : true))
  }

  // Get status badge component
  const getStatusBadge = (status: "PENDING" | "IN_PROGRESS" | "CLOSED") => {
    switch (status) {
      case "PENDING":
        return <Badge variant="destructive">În așteptare</Badge>
      case "IN_PROGRESS":
        return (
          <Badge variant="warning" className="bg-yellow-500">
            În preparare
          </Badge>
        )
      case "CLOSED":
        return (
          <Badge variant="success" className="bg-green-500">
            Finalizat
          </Badge>
        )
    }
  }

  // Calculează totalul unei comenzi
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
        <h1 className="text-2xl font-bold">Comenzi active</h1>
        <Button variant="outline" size="icon" onClick={toggleSound}>
          {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
      </div>

      <Tabs defaultValue="kitchen" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kitchen" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Bucătărie
            {getFilteredOrders("Mancare", "PENDING").length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {getFilteredOrders("Mancare", "PENDING").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bar" className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Bar
            {getFilteredOrders("Bauturi", "PENDING").length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {getFilteredOrders("Bauturi", "PENDING").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Kitchen Orders */}
        <TabsContent value="kitchen" className="mt-6">
          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Comenzi în așteptare</h2>
              {getFilteredOrders("Mancare", "PENDING").length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">Nu există comenzi în așteptare</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getFilteredOrders("Mancare", "PENDING").map((order) => (
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
                          {formatDistanceToNow(order.timestamp, { addSuffix: true, locale: ro })}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-3">
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
                        <div className="mt-3 pt-2 border-t flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">{calculateOrderTotal(order.items)} lei</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}>
                          Începe prepararea
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Comenzi în preparare</h2>
              {getFilteredOrders("Mancare", "IN_PROGRESS").length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">Nu există comenzi în preparare</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getFilteredOrders("Mancare", "IN_PROGRESS").map((order) => (
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
                          {formatDistanceToNow(order.timestamp, { addSuffix: true, locale: ro })}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-3">
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
                        <div className="mt-3 pt-2 border-t flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">{calculateOrderTotal(order.items)} lei</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button variant="default" size="sm" onClick={() => updateOrderStatus(order.id, "CLOSED")}>
                          <Check className="h-4 w-4 mr-2" />
                          Finalizează
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Bar Orders */}
        <TabsContent value="bar" className="mt-6">
          <div className="grid gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Comenzi în așteptare</h2>
              {getFilteredOrders("Bauturi", "PENDING").length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">Nu există comenzi în așteptare</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getFilteredOrders("Bauturi", "PENDING").map((order) => (
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
                          {formatDistanceToNow(order.timestamp, { addSuffix: true, locale: ro })}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-3">
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
                        <div className="mt-3 pt-2 border-t flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">{calculateOrderTotal(order.items)} lei</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}>
                          Începe prepararea
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Comenzi în preparare</h2>
              {getFilteredOrders("Bauturi", "IN_PROGRESS").length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">Nu există comenzi în preparare</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {getFilteredOrders("Bauturi", "IN_PROGRESS").map((order) => (
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
                          {formatDistanceToNow(order.timestamp, { addSuffix: true, locale: ro })}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-3">
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
                        <div className="mt-3 pt-2 border-t flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">{calculateOrderTotal(order.items)} lei</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button variant="default" size="sm" onClick={() => updateOrderStatus(order.id, "CLOSED")}>
                          <Check className="h-4 w-4 mr-2" />
                          Finalizează
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

