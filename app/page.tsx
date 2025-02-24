import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { UtensilsCrossed, Wine } from "lucide-react"
import { LuxuryBackground } from "./components/luxury-background"

export default function Home() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <LuxuryBackground />
      <div className="relative z-10">
        <div className="mx-auto max-w-md px-4 py-8 sm:py-20">
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">Restaurant Name</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto" />
          </div>
          <div className="grid gap-4 sm:gap-6">
            <Link href="/bar" className="block touch-manipulation">
              <Card className="group relative overflow-hidden border-0 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:bg-black/60 active:scale-98">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                  <div className="rounded-full border border-yellow-500/20 p-3">
                    <Wine className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Bar</h2>
                    <p className="text-xs sm:text-sm text-yellow-500/80">Băuturi și cocktailuri</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/mancare" className="block touch-manipulation">
              <Card className="group relative overflow-hidden border-0 bg-black/40 backdrop-blur-sm transition-all duration-500 hover:bg-black/60 active:scale-98">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                  <div className="rounded-full border border-yellow-500/20 p-3">
                    <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Mâncare</h2>
                    <p className="text-xs sm:text-sm text-yellow-500/80">Bucătărie tradițională</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

