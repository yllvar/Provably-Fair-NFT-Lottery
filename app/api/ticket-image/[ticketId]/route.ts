import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { createCanvas } from "canvas"

export async function GET(request: Request, { params }: { params: { ticketId: string } }) {
  try {
    const ticketId = params.ticketId

    // Get ticket data from Firestore
    const ticketDoc = await db.collection("tickets").doc(ticketId).get()

    if (!ticketDoc.exists) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const ticketData = ticketDoc.data()
    const { tier, numbers } = ticketData

    // Generate a simple ticket image
    const canvas = createCanvas(800, 400)
    const ctx = canvas.getContext("2d")

    // Background color based on tier
    let bgColor = "#4CAF50" // Basic (green)
    if (tier === "PREMIUM") {
      bgColor = "#2196F3" // Premium (blue)
    } else if (tier === "VIP") {
      bgColor = "#9C27B0" // VIP (purple)
    }

    // Fill background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, 800, 400)

    // Add border
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 10
    ctx.strokeRect(10, 10, 780, 380)

    // Add title
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 40px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Solana Fortune Wheel", 400, 60)

    // Add tier
    ctx.font = "bold 30px Arial"
    ctx.fillText(`${tier} TICKET`, 400, 100)

    // Add ticket ID
    ctx.font = "16px Arial"
    ctx.fillText(`Ticket ID: ${ticketId}`, 400, 130)

    // Add numbers
    ctx.font = "bold 36px Arial"
    ctx.fillText("Your Lucky Numbers:", 400, 180)

    const numbersPerRow = Math.min(numbers.length, 5)
    const spacing = 600 / numbersPerRow
    const startX = 400 - (spacing * (numbersPerRow - 1)) / 2

    for (let i = 0; i < numbers.length; i++) {
      const x = startX + (i % numbersPerRow) * spacing
      const y = 240 + Math.floor(i / numbersPerRow) * 60

      // Draw number circle
      ctx.beginPath()
      ctx.arc(x, y, 30, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.fill()

      // Draw number text
      ctx.fillStyle = bgColor
      ctx.font = "bold 24px Arial"
      ctx.fillText(numbers[i], x, y + 8)
    }

    // Add footer
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "16px Arial"
    ctx.fillText("Provably fair lottery on Solana", 400, 350)
    ctx.fillText(`Draw date: ${new Date().toLocaleDateString()}`, 400, 375)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png")

    // Return the image
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error generating ticket image:", error)
    return NextResponse.json({ error: "Failed to generate ticket image" }, { status: 500 })
  }
}
