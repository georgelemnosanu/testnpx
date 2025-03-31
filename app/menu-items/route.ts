import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

   
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menuItem/submitCreateMenuItem`, {
      method: "POST",
      body: formData, 
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Server error: ${errorText}`)
    }

    const message = await res.text()

    return NextResponse.json({ success: true, message })
  } catch (error: any) {
    console.error("Error sending data to Spring:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}