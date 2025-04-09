import { Connection } from "@solana/web3.js"
import { createHash } from "crypto"

/**
 * Generate randomness using Solana block hash and other entropy sources
 * @returns A promise that resolves to a random number
 */
export async function generateRandomness(): Promise<number> {
  try {
    // Connect to Solana
    const connection = new Connection(process.env.SOLANA_RPC_URL || "", "confirmed")

    // Get the latest block hash
    const { blockhash } = await connection.getLatestBlockhash()

    // Get recent block hashes for additional entropy
    const recentBlockhashes = await connection.getRecentBlockhash("finalized")

    // Get recent performance samples for more entropy
    const perfSamples = await connection.getRecentPerformanceSamples(5)
    const sampleValues = perfSamples.map((sample) => sample.numSlots + sample.numTransactions).join("")

    // Get current timestamp
    const timestamp = Date.now().toString()

    // Combine all sources of entropy
    const entropySource = blockhash + recentBlockhashes.blockhash + sampleValues + timestamp

    // Create a SHA-256 hash of the entropy
    const hash = createHash("sha256").update(entropySource).digest("hex")

    // Convert the first 8 bytes of the hash to a number
    const randomValue = Number.parseInt(hash.substring(0, 16), 16)

    return randomValue
  } catch (error) {
    console.error("Error generating randomness:", error)
    throw new Error("Failed to generate randomness")
  }
}

/**
 * Request randomness for a raffle round
 * @param roundId The ID of the raffle round
 * @returns The request ID and random value
 */
export async function requestRandomness(roundId: string): Promise<{ requestId: string; randomValue: number }> {
  try {
    // Generate a request ID
    const requestId = createHash("sha256")
      .update(roundId + Date.now().toString())
      .digest("hex")

    // Generate randomness
    const randomValue = await generateRandomness()

    return { requestId, randomValue }
  } catch (error) {
    console.error("Error requesting randomness:", error)
    throw new Error("Failed to request randomness")
  }
}

/**
 * Get randomness result
 * @param requestId The ID of the randomness request
 * @returns A random number
 */
export async function getRandomnessResult(requestId: string): Promise<number> {
  try {
    // Generate randomness
    const randomValue = await generateRandomness()
    return randomValue
  } catch (error) {
    console.error("Error getting randomness result:", error)
    throw new Error("Failed to get randomness result")
  }
}

/**
 * Verify randomness result
 * @param randomValue The random value to verify
 * @param requestId The request ID
 * @returns Whether the randomness result is valid
 */
export async function verifyRandomnessResult(randomValue: any, requestId: string): Promise<boolean> {
  try {
    // In a real implementation, you would verify the random value against the request ID
    // This is a simplified version for demonstration purposes
    return true
  } catch (error) {
    console.error("Error verifying randomness result:", error)
    return false
  }
}
