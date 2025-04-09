import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { db } from "./firebase"
import { getProgramPublicKey } from "./solana-helpers"
import { createQR, encodeURL, type TransferRequestURLFields, findReference, validateTransfer } from "@solana/pay"

// Initialize Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || "", "confirmed")

/**
 * Create a Solana Pay transfer request URL
 * @param amount The amount to transfer in SOL
 * @param reference A unique reference for this payment
 * @param label The label for the payment
 * @param message The message for the payment
 * @returns The Solana Pay URL
 */
export function createSolanaPayRequest(
  amount: number,
  reference: string,
  label = "Solana Fortune Wheel",
  message = "NFT Lottery Ticket Purchase",
): { url: string; qrCode: string } {
  try {
    // Get recipient public key
    const recipient = new PublicKey(getProgramPublicKey())

    // Create the Solana Pay transfer request URL
    const transferFields: TransferRequestURLFields = {
      recipient,
      amount: amount,
      reference: new PublicKey(reference),
      label,
      message,
    }

    // Encode the URL
    const url = encodeURL(transferFields)

    // Create QR code
    const qrCode = createQR(url).toString()

    return { url: url.toString(), qrCode }
  } catch (error) {
    console.error("Error creating Solana Pay request:", error)
    throw new Error("Failed to create Solana Pay request")
  }
}

/**
 * Verify a payment for a ticket purchase
 * @param walletAddress The wallet address of the user
 * @param tier The tier of the ticket
 * @returns Whether the payment is verified
 */
export async function verifyPayment(walletAddress: string, tier: string): Promise<boolean> {
  try {
    // Get program public key
    const programPublicKey = new PublicKey(getProgramPublicKey())

    // Get expected payment amount based on tier
    const expectedAmount = getExpectedAmount(tier)

    // Get recent payments from this wallet to our program
    const signatures = await connection.getSignaturesForAddress(programPublicKey, { limit: 10 }, "confirmed")

    // Check if any of these signatures are already used
    const recentSignatures = signatures.map((sig) => sig.signature)
    const existingPayments = await db
      .collection("payments")
      .where("signature", "in", recentSignatures)
      .where("account", "==", walletAddress)
      .get()

    const usedSignatures = new Set()
    existingPayments.forEach((doc) => {
      usedSignatures.add(doc.data().signature)
    })

    // Check each signature to find a valid payment
    for (const sig of signatures) {
      // Skip if already used
      if (usedSignatures.has(sig.signature)) {
        continue
      }

      // Get transaction details
      const tx = await connection.getTransaction(sig.signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      })

      if (!tx) continue

      // Verify it's a payment to our program
      const isPayment = verifyTransactionIsPayment(tx, walletAddress, programPublicKey.toBase58())
      if (!isPayment) continue

      // Check amount
      const amount = getTransactionAmount(tx, programPublicKey.toBase58())
      if (amount >= expectedAmount * LAMPORTS_PER_SOL) {
        // Mark this signature as used
        await db.collection("payments").doc(sig.signature).set({
          signature: sig.signature,
          account: walletAddress,
          amount,
          tier,
          timestamp: new Date().toISOString(),
          status: "used",
        })

        return true
      }
    }

    return false
  } catch (error) {
    console.error("Error verifying payment:", error)
    return false
  }
}

/**
 * Verify a Solana Pay transfer using reference
 * @param reference The reference public key
 * @param expectedAmount The expected amount in SOL
 * @returns The transaction signature if verified, null otherwise
 */
export async function verifySolanaPayTransfer(reference: string, expectedAmount: number): Promise<string | null> {
  try {
    const referencePublicKey = new PublicKey(reference)
    const recipient = new PublicKey(getProgramPublicKey())

    // Find the transaction with this reference
    const signatureInfo = await findReference(connection, referencePublicKey, { finality: "confirmed" })

    // Validate that the transaction has the expected recipient and amount
    await validateTransfer(
      connection,
      signatureInfo.signature,
      {
        recipient,
        amount: expectedAmount,
        reference: referencePublicKey,
      },
      { commitment: "confirmed" },
    )

    return signatureInfo.signature
  } catch (error) {
    console.error("Error verifying Solana Pay transfer:", error)
    return null
  }
}

/**
 * Get the expected payment amount for a tier
 * @param tier The tier of the ticket
 * @returns The expected payment amount in SOL
 */
export function getExpectedAmount(tier: string): number {
  switch (tier) {
    case "BASIC":
      return 0.5
    case "PREMIUM":
      return 1.5
    case "VIP":
      return 3
    default:
      return 0
  }
}

/**
 * Verify that a transaction is a payment from a user to our program
 * @param transaction The transaction to verify
 * @param fromAddress The expected sender address
 * @param toAddress The expected recipient address
 * @returns Whether the transaction is a valid payment
 */
function verifyTransactionIsPayment(transaction: any, fromAddress: string, toAddress: string): boolean {
  if (!transaction.meta || !transaction.transaction) {
    return false
  }

  // Check if the transaction is a SOL transfer
  const instructions = transaction.transaction.message.instructions
  if (!instructions || instructions.length === 0) {
    return false
  }

  // Check if any instruction is a system program transfer
  const isTransfer = instructions.some((ix: any) => {
    return ix.programId === "11111111111111111111111111111111" // System program
  })

  // Check if the sender and recipient match our expectations
  const accountKeys = transaction.transaction.message.accountKeys
  const fromIndex = accountKeys.findIndex((key: string) => key === fromAddress)
  const toIndex = accountKeys.findIndex((key: string) => key === toAddress)

  if (fromIndex === -1 || toIndex === -1) {
    return false
  }

  // Check if the recipient's balance increased
  const preBalance = transaction.meta.preBalances[toIndex]
  const postBalance = transaction.meta.postBalances[toIndex]

  return isTransfer && postBalance > preBalance
}

/**
 * Get the amount transferred in a transaction
 * @param transaction The transaction to check
 * @param toAddress The recipient address
 * @returns The amount transferred in lamports
 */
function getTransactionAmount(transaction: any, toAddress: string): number {
  if (!transaction.meta || !transaction.transaction) {
    return 0
  }

  const accountKeys = transaction.transaction.message.accountKeys
  const toIndex = accountKeys.findIndex((key: string) => key === toAddress)

  if (toIndex === -1) {
    return 0
  }

  const preBalance = transaction.meta.preBalances[toIndex]
  const postBalance = transaction.meta.postBalances[toIndex]

  return postBalance - preBalance
}
