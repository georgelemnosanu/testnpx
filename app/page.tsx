"use client"

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Preia query string-ul din URL
    const params = new URLSearchParams(window.location.search);
    const tableId = params.get("tableId");

    // Dacă există un tableId, salvează-l în sessionStorage
    if (tableId) {
      sessionStorage.setItem("tableId", tableId);
      // Poți face și o redirecționare dacă este necesar:
       router.replace("/menu");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-900/20 to-black/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-sm">
            <QrCode className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-sm border-white/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Scanați codul QR
                </h1>
                <p className="text-zinc-400 text-sm">
                  Poziționați camera către codul QR de pe masă
                </p>
              </div>

              {/* Scanner container with styled border */}
              <div className="relative rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 animate-pulse" />
                <div id="qr-reader" className="relative z-10" />
                
                {/* Animated scan line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <ScanLine className="w-6 h-6 text-yellow-500 animate-bounce opacity-75" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-zinc-500">
                  Scanner-ul va porni automat camera dispozitivului
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom gradient line */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
    </div>
  )
}