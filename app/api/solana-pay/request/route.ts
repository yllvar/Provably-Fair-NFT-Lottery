import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { createSolanaPayRequest, getExpectedAmount } from "@/lib/solana-pay"
import { db } from "@/lib/firebase"
import { reserveTicketNumber } from "@/lib/ticket-service"
import { getMetadataUrl } from "@/lib/ipfs-helpers"

// Get the metadata CID from environment variables
const METADATA_CID = process.env.METADATA_CID || ""

export async function POST(request: Request) {
  try {
    const { tier, walletAddress } = await request.json()

    if (!tier || !walletAddress) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Validate the tier
    if (!["BASIC", "PREMIUM", "VIP"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    // Reserve a ticket number
    const { number: ticketNumber, metadata: ticketMetadata } = await reserveTicketNumber(tier)

    // Get the amount for this tier
    const amount = getExpectedAmount(tier)

    // Generate a unique reference for this payment
    const reference = uuidv4()

    // Get the metadata URL for this ticket
    const metadataUrl = getMetadataUrl(METADATA_CID, ticketNumber)

    // Create a Solana Pay request
    const { url, qrCode } = createSolanaPayRequest(
      amount,
      reference,
      `Solana Fortune Wheel - ${tier} Ticket #${ticketNumber}`,
      `Purchase a ${tier} NFT lottery ticket with number ${ticketNumber}`,
    )

    // Store the payment request in the database
    await db
      .collection("payment_requests")
      .doc(reference)
      .set({
        reference,
        tier,
        amount,
        walletAddress,
        ticketNumber,
        metadataUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes expiry
      })

    return NextResponse.json({
      success: true,
      reference,
      amount,
      url,
      qrCode,
      ticketNumber,
      tier,
    })
  } catch (error) {
    console.error("Error creating Solana Pay request:", error)
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 })
  }
}
