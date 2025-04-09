import { NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/auth"
import { initializeTicketNumbers } from "@/lib/ticket-service"

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize ticket numbers
    await initializeTicketNumbers()

    return NextResponse.json({
      success: true,
      message: "Ticket numbers initialized successfully",
    })
  } catch (error: any) {
    console.error("Error initializing ticket numbers:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize ticket numbers",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
