import { NextResponse } from "next/server"

/**
 * Listează categoriile (specialitățile) din backend
 */
export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/speciality/allSpeciality`, {
      method: "GET",
    })

    if (!res.ok) {
      throw new Error(`Spring responded with ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching categories from Spring:", error)
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    )
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/speciality/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), 
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Spring error: ${errorText}`)
    }

    const createdCategory = await res.json()
    return NextResponse.json(createdCategory)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Error creating category" },
      { status: 500 }
    )
  }
}