import type React from "react"
import type { Metadata } from "next"
import DashboardLayoutClient from "./DashBoardLayoutClient"

export const metadata: Metadata = {
  title: "Dashboard - Restaurant",
  description: "Restaurant administration dashboard",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient children={children} />
}

