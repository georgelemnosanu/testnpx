import { NextResponse } from "next/server"

/**
 * Listează categoriile (specialitățile) din backend
 */
export async function GET() {
  try {
    // Apelezi backend-ul Spring
    const res = await fetch("https://lmndev.com/speciality/allSpeciality", {
      method: "GET",
      // Poți adăuga HEADERS dacă e nevoie, ex. Authorization
    })

    if (!res.ok) {
      throw new Error(`Spring responded with ${res.status}`)
    }

    const data = await res.json()
    // data va fi un array de Speciality
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching categories from Spring:", error)
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    )
  }
}

/**
 * Creează o categorie nouă (specialitate)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Trimite direct la backend-ul Spring
    const res = await fetch("https://lmndev.com/speciality/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body), // asumi că Spring așteaptă un JSON cu { name, description, ... }
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Spring error: ${errorText}`)
    }

    const createdCategory = await res.json()
    // Returnezi JSON-ul creat
    return NextResponse.json(createdCategory)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Error creating category" },
      { status: 500 }
    )
  }
}