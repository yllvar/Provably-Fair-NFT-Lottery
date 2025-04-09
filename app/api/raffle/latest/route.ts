import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    // Get the latest completed raffle
    const rafflesSnapshot = await db
      .collection("raffles")
      .where("completedAt", "!=", null)
      .orderBy("completedAt", "desc")
      .limit(1)
      .get()

    if (rafflesSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: "No completed raffles found",
      })
    }

    const raffleData = rafflesSnapshot.docs[0].data()

    return NextResponse.json({
      success: true,
      roundId: raffleData.roundId,
      winningNumber: raffleData.winningNumber,
      winner: raffleData.winner,
      winnerTier: raffleData.winnerTier,
      prizePool: raffleData.prizePool,
      completedAt: raffleData.completedAt,
      matchedNumber: raffleData.matchedNumber,
    })
  } catch (error) {
    console.error("Error fetching latest raffle:", error)
    return NextResponse.json({ error: "Failed to fetch latest raffle" }, { status: 500 })
  }
}
