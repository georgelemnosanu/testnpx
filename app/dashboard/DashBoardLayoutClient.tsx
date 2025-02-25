"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Coffee,
  Users,
  Settings,
  LogOut,
  Menu,
  Receipt,
  Clock,
  ChevronRight,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Comenzi Active",
    href: "/dashboard/orders",
    icon: Receipt,
  },
  {
    title: "Istoric Comenzi",
    href: "/dashboard/orders/history",
    icon: Clock,
  },
  {
    title: "Meniu",
    href: "/dashboard/menu",
    icon: UtensilsCrossed,
    children: [
      {
        title: "Produse",
        href: "/dashboard/menu/products",
        icon: ChevronRight,
      },
      {
        title: "Categorii",
        href: "/dashboard/menu/categories",
        icon: ChevronRight,
      },
    ],
  },
  {
    title: "Specialități",
    href: "/dashboard/specialties",
    icon: Coffee,
  },
  {
    title: "Utilizatori",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Setări",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

function NavLink({
  href,
  icon: Icon,
  title,
  children,
}: {
  href: string
  icon: any
  title: string
  children?: any[]
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  const hasChildren = children && children.length > 0

  return (
    <div>
      <Link href={href}>
        <Button variant="ghost" className={cn("w-full justify-start", isActive && "bg-muted")}>
          <Icon className="mr-2 h-4 w-4" />
          {title}
        </Button>
      </Link>
      {hasChildren && (
        <div className="ml-4 mt-1 space-y-1">
          {children.map((child) => (
            <Link key={child.href} href={child.href}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start text-sm", pathname === child.href && "bg-muted")}
              >
                <child.icon className="mr-2 h-3 w-3" />
                {child.title}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100/40">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed left-4 top-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold">Dashboard</h2>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  children={item.children}
                />
              ))}
            </nav>
            <div className="border-t p-4">
              <Button variant="ghost" className="w-full justify-start text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Deconectare
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-background lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">Dashboard</h2>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} icon={item.icon} title={item.title} children={item.children} />
            ))}
          </nav>
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Deconectare
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}

