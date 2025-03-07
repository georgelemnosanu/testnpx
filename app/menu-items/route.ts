import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // 1) Obținem formData de la client
    const formData = await request.formData()

    // 2) Trimitem direct la backend-ul Spring
    //    Atenție la: 
    //       - path: http://localhost:8080/submitCreateMenuItem
    //       - FĂRĂ: headers: {"Content-Type": "application/json"}
    //         pentru că e multipart/form-data
    const res = await fetch("http://lmndev.com/menuItem/submitCreateMenuItem", {
      method: "POST",
      body: formData, 
      // fetch va pune automat Content-Type: multipart/form-data
    })

    if (!res.ok) {
      // Poți citi și eroarea de la server
      const errorText = await res.text()
      throw new Error(`Server error: ${errorText}`)
    }

    // Citim răspunsul ca text (sau JSON dacă serverul ar trimite JSON)
    const message = await res.text()

    // 3) Returnăm un JSON la Next
    return NextResponse.json({ success: true, message })
  } catch (error: any) {
    console.error("Error sending data to Spring:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}