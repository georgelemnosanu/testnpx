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
      {/* Bottom gradient line */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/50 to-transparent" />
    </div>
  )
}