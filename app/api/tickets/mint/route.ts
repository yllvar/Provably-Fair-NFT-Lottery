import { NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token"
import { db } from "@/lib/firebase"
import { v4 as uuidv4 } from "uuid"
import { verifyPayment } from "@/lib/solana-pay"
import { getProgramKeypair } from "@/lib/solana-helpers"
import { markTicketNumberAsUsed } from "@/lib/ticket-service"
import { getMetadataUrl } from "@/lib/ipfs-helpers"

// Get the metadata CID from environment variables
const METADATA_CID = process.env.METADATA_CID || ""

export async function POST(request: Request) {
  try {
    const { walletAddress, tier, paymentReference } = await request.json()

    if (!walletAddress || !tier || !paymentReference) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Validate the tier
    if (!["BASIC", "PREMIUM", "VIP"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    // Verify payment
    let paymentVerified = false
    let ticketNumber = ""
    let metadataUrl = ""

    // Check if payment request exists and is confirmed
    const paymentRequestRef = db.collection("payment_requests").doc(paymentReference)
    const paymentRequestDoc = await paymentRequestRef.get()

    if (paymentRequestDoc.exists && paymentRequestDoc.data()?.status === "confirmed") {
      paymentVerified = true
      ticketNumber = paymentRequestDoc.data()?.ticketNumber || ""
      metadataUrl = paymentRequestDoc.data()?.metadataUrl || ""
    } else {
      // If payment reference is not confirmed, check traditional payment verification
      paymentVerified = await verifyPayment(walletAddress, tier)
    }

    if (!paymentVerified) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // If we don't have a ticket number from the payment request, something went wrong
    if (!ticketNumber) {
      return NextResponse.json({ error: "Ticket number not found" }, { status: 400 })
    }

    // If we don't have a metadata URL, generate it
    if (!metadataUrl) {
      metadataUrl = getMetadataUrl(METADATA_CID, ticketNumber)
    }

    // Connect to Solana
    const connection = new Connection(process.env.SOLANA_RPC_URL || "", "confirmed")
    const userWallet = new PublicKey(walletAddress)

    // Get program keypair using the helper function
    const programKeypair = getProgramKeypair()

    // Generate ticket ID
    const ticketId = uuidv4()
    const roundId = getCurrentRoundId()

    // Mint NFT ticket
    const mint = await createMint(
      connection,
      programKeypair,
      programKeypair.publicKey,
      programKeypair.publicKey,
      0, // 0 decimals for NFT
    )

    // Create token account for the user
    const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, programKeypair, mint, userWallet)

    // Mint 1 token to the user (NFT)
    await mintTo(
      connection,
      programKeypair,
      mint,
      tokenAccount.address,
      programKeypair.publicKey,
      1, // Amount: 1 for NFT
    )

    // Mark the ticket number as permanently used
    await markTicketNumberAsUsed(ticketNumber)

    // Store ticket metadata in Firestore
    await db.collection("tickets").doc(ticketId).set({
      ticketId,
      nftMint: mint.toBase58(),
      tier,
      owner: walletAddress,
      number: ticketNumber,
      metadataUrl,
      mintTimestamp: new Date().toISOString(),
      isBurned: false,
      roundId,
    })

    // Update user stats
    const userRef = db.collection("users").doc(walletAddress)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
      await userRef.update({
        ticketsPurchased: userDoc.data()?.ticketsPurchased + 1 || 1,
        lastPurchase: new Date().toISOString(),
      })
    } else {
      await userRef.set({
        wallet: walletAddress,
        ticketsPurchased: 1,
        wins: 0,
        lastPurchase: new Date().toISOString(),
      })
    }

    // Update prize pool based on tier
    const poolBoost = tier === "PREMIUM" ? 0.1 : tier === "VIP" ? 0.25 : 0
    await updatePrizePool(tier, poolBoost)

    return NextResponse.json({
      success: true,
      ticketId,
      nftMint: mint.toBase58(),
      tier,
      number: ticketNumber,
      metadataUrl,
    })
  } catch (error) {
    console.error("Error minting ticket:", error)
    return NextResponse.json({ error: "Failed to mint ticket" }, { status: 500 })
  }
}

// Helper function to get current round ID
function getCurrentRoundId() {
  const today = new Date()
  return `round-${today.toISOString().split("T")[0]}`
}

// Helper function to update prize pool
async function updatePrizePool(tier: string, boost: number) {
  const roundId = getCurrentRoundId()
  const raffleRef = db.collection("raffles").doc(roundId)
  const raffleDoc = await raffleRef.get()

  let baseAmount = 0
  switch (tier) {
    case "BASIC":
      baseAmount = 0.5
      break
    case "PREMIUM":
      baseAmount = 1.5
      break
    case "VIP":
      baseAmount = 3
      break
  }

  if (raffleDoc.exists) {
    const currentPool = raffleDoc.data()?.prizePool || 0
    const boostAmount = currentPool * boost
    await raffleRef.update({
      prizePool: currentPool + baseAmount + boostAmount,
    })
  } else {
    await raffleRef.set({
      roundId,
      prizePool: baseAmount,
      startedAt: new Date().toISOString(),
      completedAt: null,
      winner: null,
      randomnessRequestId: null,
      randomnessProof: null,
    })
  }
}
