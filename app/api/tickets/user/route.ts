import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet parameter" }, { status: 400 })
    }

    // Optional: Verify wallet authentication
    // const isAuthenticated = await verifyWalletAuth(request)
    // if (!isAuthenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Get current round ID
    const roundId = getCurrentRoundId()

    // Fetch user's tickets for the current round
    const ticketsSnapshot = await db
      .collection("tickets")
      .where("owner", "==", wallet)
      .where("roundId", "==", roundId)
      .where("isBurned", "==", false)
      .get()

    const tickets = []
    ticketsSnapshot.forEach((doc) => {
      const data = doc.data()
      tickets.push({
        ticketId: data.ticketId,
        tier: data.tier,
        number: data.number || "",
        metadataUrl: data.metadataUrl || "",
        mintTimestamp: data.mintTimestamp,
      })
    })

    return NextResponse.json({
      success: true,
      tickets,
    })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json({ error: "Failed to fetch user tickets" }, { status: 500 })
  }
}

// Helper function to get current round ID
function getCurrentRoundId() {
  const today = new Date()
  return `round-${today.toISOString().split("T")[0]}`
}
