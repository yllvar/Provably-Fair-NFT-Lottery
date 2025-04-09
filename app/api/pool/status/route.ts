import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Try to get cached data first
    let cachedData
    try {
      cachedData = await redis.get("pool-status")
    } catch (error) {
      console.warn("Redis error:", error)
    }

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData))
    }

    // Get current round ID
    const roundId = getCurrentRoundId()

    // Mock data in case Firebase is not available
    let prizePool = 25.8
    let startedAt = new Date().toISOString()
    let recentWinners = []
    let ticketCounts = {
      BASIC: 10,
      PREMIUM: 5,
      VIP: 2,
      total: 17,
    }

    try {
      const raffleRef = db.collection("raffles").doc(roundId)
      const raffleDoc = await raffleRef.get()

      if (raffleDoc.exists) {
        prizePool = raffleDoc.data()?.prizePool || prizePool
        startedAt = raffleDoc.data()?.startedAt || startedAt
      }

      // Get recent winners (last 5)
      const winnersSnapshot = await db
        .collection("raffles")
        .where("winner", "!=", null)
        .orderBy("winner")
        .orderBy("completedAt", "desc")
        .limit(5)
        .get()

      if (!winnersSnapshot.empty) {
        recentWinners = []
        winnersSnapshot.forEach((doc) => {
          const data = doc.data()
          recentWinners.push({
            date: formatDate(data.completedAt),
            winner: formatWalletAddress(data.winner),
            prize: `${data.prizePool.toFixed(2)} SOL`,
            tier: data.winnerTier || "UNKNOWN",
            vrfProof: data.randomnessProof || null,
          })
        })
      }

      // Get ticket counts by tier
      const ticketsSnapshot = await db
        .collection("tickets")
        .where("roundId", "==", roundId)
        .where("isBurned", "==", false)
        .get()

      if (!ticketsSnapshot.empty) {
        ticketCounts = {
          BASIC: 0,
          PREMIUM: 0,
          VIP: 0,
          total: 0,
        }

        ticketsSnapshot.forEach((doc) => {
          const tier = doc.data().tier
          ticketCounts[tier]++
          ticketCounts.total++
        })
      }
    } catch (error) {
      console.warn("Firebase error:", error)
      // Continue with mock data if Firebase fails
    }

    // Calculate next draw time (end of day)
    const nextDraw = getEndOfDay()

    // Calculate base pool and boosts
    const basePool = prizePool / (1 + 0.1 * ticketCounts.PREMIUM + 0.25 * ticketCounts.VIP)
    const boostAmount = prizePool - basePool

    const response = {
      prizePool,
      basePool: basePool.toFixed(2),
      boostAmount: boostAmount.toFixed(2),
      nextDraw,
      countdown: getCountdown(nextDraw),
      recentWinners,
      ticketCounts,
    }

    // Cache the response for 1 minute
    try {
      await redis.set("pool-status", JSON.stringify(response), "EX", 60)
    } catch (error) {
      console.warn("Redis caching error:", error)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error getting pool status:", error)

    // Return fallback data if everything fails
    const fallbackResponse = {
      prizePool: 25.8,
      basePool: "20.0",
      boostAmount: "5.8",
      nextDraw: getEndOfDay(),
      countdown: getCountdown(getEndOfDay()),
      recentWinners: [],
      ticketCounts: {
        BASIC: 10,
        PREMIUM: 5,
        VIP: 2,
        total: 17,
      },
    }

    return NextResponse.json(fallbackResponse)
  }
}

// Helper function to get current round ID
function getCurrentRoundId() {
  const today = new Date()
  return `round-${today.toISOString().split("T")[0]}`
}

// Helper function to get end of day
function getEndOfDay() {
  const date = new Date()
  date.setHours(23, 59, 59, 999)
  return date.toISOString()
}

// Helper function to format date
function formatDate(isoDate: string) {
  const date = new Date(isoDate)
  const today = new Date()

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  return `${daysAgo} days ago`
}

// Helper function to format wallet address
function formatWalletAddress(address: string) {
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
}

// Helper function to get countdown
function getCountdown(endTime: string) {
  const end = new Date(endTime).getTime()
  const now = new Date().getTime()
  const diff = end - now

  if (diff <= 0) {
    return "00:00:00"
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}
