import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { requestRandomness } from "@/lib/randomness"
import { verifyAdminAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdminAuth(request)
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current round ID
    const roundId = getCurrentRoundId()
    const raffleRef = db.collection("raffles").doc(roundId)
    const raffleDoc = await raffleRef.get()

    if (!raffleDoc.exists) {
      return NextResponse.json({ error: "No active raffle found" }, { status: 404 })
    }

    if (raffleDoc.data()?.completedAt) {
      return NextResponse.json({ error: "Raffle already completed" }, { status: 400 })
    }

    // Fetch all eligible tickets for this round
    const ticketsSnapshot = await db
      .collection("tickets")
      .where("roundId", "==", roundId)
      .where("isBurned", "==", false)
      .get()

    if (ticketsSnapshot.empty) {
      return NextResponse.json({ error: "No tickets found for this round" }, { status: 404 })
    }

    // Request randomness
    const { requestId, randomValue } = await requestRandomness(roundId)

    // Generate a winning 4-digit number from the randomness
    const winningNumber = (randomValue % 10000).toString().padStart(4, "0")

    // Find tickets with matching numbers
    const eligibleTickets = []
    const tickets = []

    ticketsSnapshot.forEach((doc) => {
      const ticket = doc.data()
      tickets.push(ticket)

      // Check if any of the ticket's numbers match the winning number
      if (ticket.numbers && ticket.numbers.includes(winningNumber)) {
        // Add ticket to eligible tickets based on tier weight
        const weight = ticket.tier === "BASIC" ? 1 : ticket.tier === "PREMIUM" ? 3 : 5
        for (let i = 0; i < weight; i++) {
          eligibleTickets.push(ticket)
        }
      }
    })

    // If no tickets match the winning number, select a random ticket
    if (eligibleTickets.length === 0) {
      console.log(`No tickets matched winning number ${winningNumber}. Selecting random ticket.`)

      // Create weighted ticket array based on tier
      const weightedTickets = []

      tickets.forEach((ticket) => {
        const weight = ticket.tier === "BASIC" ? 1 : ticket.tier === "PREMIUM" ? 3 : 5
        for (let i = 0; i < weight; i++) {
          weightedTickets.push(ticket)
        }
      })

      // Use random value to select winner
      const randomIndex = randomValue % weightedTickets.length
      const winningTicket = weightedTickets[randomIndex]

      // Get prize pool amount
      const prizePool = raffleDoc.data()?.prizePool || 0

      // Update raffle with winner info
      await raffleRef.update({
        winner: winningTicket.owner,
        winnerTier: winningTicket.tier,
        winningNumber,
        randomnessRequestId: requestId,
        randomnessValue: randomValue,
        randomnessProof: `Block hash used for randomness generation`,
        completedAt: new Date().toISOString(),
        matchedNumber: false,
      })

      // Update winner's stats
      await updateWinnerStats(winningTicket.owner, prizePool)

      return NextResponse.json({
        success: true,
        roundId,
        winner: winningTicket.owner,
        winnerTier: winningTicket.tier,
        prizeAmount: prizePool,
        winningNumber,
        matchedNumber: false,
      })
    }

    // If we have eligible tickets, select one randomly
    const winnerIndex = randomValue % eligibleTickets.length
    const winningTicket = eligibleTickets[winnerIndex]

    // Get prize pool amount
    const prizePool = raffleDoc.data()?.prizePool || 0

    // Update raffle with winner info
    await raffleRef.update({
      winner: winningTicket.owner,
      winnerTier: winningTicket.tier,
      winningNumber,
      randomnessRequestId: requestId,
      randomnessValue: randomValue,
      randomnessProof: `Block hash used for randomness generation`,
      completedAt: new Date().toISOString(),
      matchedNumber: true,
    })

    // Update winner's stats
    await updateWinnerStats(winningTicket.owner, prizePool)

    return NextResponse.json({
      success: true,
      roundId,
      winner: winningTicket.owner,
      winnerTier: winningTicket.tier,
      prizeAmount: prizePool,
      winningNumber,
      matchedNumber: true,
    })
  } catch (error) {
    console.error("Error triggering raffle:", error)
    return NextResponse.json({ error: "Failed to trigger raffle" }, { status: 500 })
  }
}

// Helper function to get current round ID
function getCurrentRoundId() {
  const today = new Date()
  return `round-${today.toISOString().split("T")[0]}`
}

// Helper function to update winner stats
async function updateWinnerStats(walletAddress: string, prizeAmount: number) {
  const userRef = db.collection("users").doc(walletAddress)
  const userDoc = await userRef.get()

  if (userDoc.exists) {
    await userRef.update({
      wins: userDoc.data()?.wins + 1 || 1,
      totalWinnings: (userDoc.data()?.totalWinnings || 0) + prizeAmount,
    })
  } else {
    await userRef.set({
      wallet: walletAddress,
      ticketsPurchased: 0,
      wins: 1,
      totalWinnings: prizeAmount,
    })
  }
}
