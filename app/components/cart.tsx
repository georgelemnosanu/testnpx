"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useEffect, useState } from "react"
import { useCart } from "@/app/context/cart-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Trash2, Receipt, Clock, ChevronDown, CreditCard, Wallet } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ro } from "date-fns/locale"

export function Cart() {
  const { state, dispatch } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [billRequestTime, setBillRequestTime] = useState<number | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: id })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: newQuantity } })
    }
  }

  const handleConfirmOrder = () => {
    dispatch({ type: "CONFIRM_ORDER" })
    toast.success("Comanda a fost trimisă cu succes!")
    setTimeout(() => {
      dispatch({ type: "RESET_ORDER_CONFIRMATION" })
    }, 3000)
  }

  const handleRequestBill = () => {
    setShowPaymentDialog(true)
  }

  const confirmBillRequest = () => {
    dispatch({ type: "REQUEST_BILL" })
    setBillRequestTime(Date.now())
    setIsOpen(false)
    setShowPaymentDialog(false)
    toast.success(`Nota de plată a fost cerută - Plată cu ${paymentMethod === "cash" ? "numerar" : "card"}`)
    toast.message("Masa va fi resetată în 5 minute", {
      icon: <Clock className="h-4 w-4" />,
    })
  }

  const getTotalForAllOrders = () => {
    const currentTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const historyTotal = state.orderHistory.reduce((sum, order) => sum + order.total, 0)
    return currentTotal + historyTotal
  }

  useEffect(() => {
    if (billRequestTime) {
      const timer = setTimeout(() => {
        dispatch({ type: "RESET_TABLE" })
        setBillRequestTime(null)
        toast.success("Masa a fost resetată")
      }, 300000) // 5 minutes
      return () => clearTimeout(timer)
    }
  }, [billRequestTime, dispatch])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-12 w-12 rounded-full shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M21 5H3" />
            <path d="M21 12H3" />
            <path d="M21 19H3" />
            <path d="M3 5h2l2 12h10l2-12h2" />
          </svg>
          {state.items.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {state.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-lg">{state.isOrderConfirmed ? "Comanda trimisă" : "Comanda mea"}</SheetTitle>
        </SheetHeader>

        {/* Order History Section */}
        {state.orderHistory.length > 0 && (
          <div className="mb-4 space-y-2 border-b pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Istoric comenzi</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isHistoryOpen ? "rotate-180 transform" : ""}`}
                />
              </Button>
            </div>
            {isHistoryOpen && (
              <div className="space-y-3">
                {state.orderHistory.map((order, orderIndex) => (
                  <div key={orderIndex} className="rounded-lg border bg-muted/50 p-4 text-sm">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Comanda {orderIndex + 1} -{" "}
                        {formatDistanceToNow(order.timestamp, {
                          addSuffix: true,
                          locale: ro,
                        })}
                      </span>
                    </div>
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between py-1">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-medium">{item.price * item.quantity} lei</span>
                      </div>
                    ))}
                    <div className="mt-2 border-t pt-2 text-right font-medium">Total comandă: {order.total} lei</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Order Section */}
        {state.items.length === 0 && !state.isOrderConfirmed && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Coșul tău este gol</p>
          </div>
        )}
        {state.isOrderConfirmed && state.items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-green-500/10 p-3">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium">Comanda a fost trimisă cu succes!</p>
            <p className="text-sm text-muted-foreground">Poți continua să adaugi produse pentru o nouă comandă</p>
          </div>
        )}
        {state.items.length > 0 && (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.price} lei x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total comandă curentă:</span>
                <span>{state.total} lei</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Total general:</span>
                <span>{getTotalForAllOrders()} lei</span>
              </div>
              <div className="mt-4 space-y-3">
                <Button className="w-full h-12 text-lg" onClick={handleConfirmOrder}>
                  Trimite comanda
                </Button>
              </div>
            </div>
          </>
        )}
        <SheetFooter className="mt-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-2"
                disabled={!state.isTableActive || (state.orderHistory.length === 0 && state.items.length === 0)}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Cere nota ({getTotalForAllOrders()} lei)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Alege metoda de plată</AlertDialogTitle>
                <AlertDialogDescription>
                  Selectează metoda de plată preferată pentru nota de {getTotalForAllOrders()} lei
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <RadioGroup
                  defaultValue="cash"
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "cash" | "card")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                    <Label
                      htmlFor="cash"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Wallet className="mb-3 h-6 w-6" />
                      Numerar
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="card" id="card" className="peer sr-only" />
                    <Label
                      htmlFor="card"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      Card
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Anulează</AlertDialogCancel>
                <AlertDialogAction onClick={confirmBillRequest}>
                  Confirmă plata cu {paymentMethod === "cash" ? "numerar" : "card"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

