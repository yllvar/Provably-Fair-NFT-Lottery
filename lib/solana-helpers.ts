import { Keypair } from "@solana/web3.js"

/**
 * Safely get the program keypair from environment variables
 * @returns The program keypair or a new keypair if the environment variable is not set
 */
export function getProgramKeypair(): Keypair {
  try {
    const privateKeyString = process.env.PROGRAM_PRIVATE_KEY

    // If the private key is not set, return a new keypair
    if (!privateKeyString) {
      console.warn("PROGRAM_PRIVATE_KEY not set, using a temporary keypair")
      return Keypair.generate()
    }

    // Try to parse the private key as a JSON array
    let privateKeyArray: number[]
    try {
      // Handle different possible formats of the private key
      if (privateKeyString.startsWith("[") && privateKeyString.endsWith("]")) {
        // It's already in array format
        privateKeyArray = JSON.parse(privateKeyString)
      } else {
        // It might be a base64 string or other format
        // For base64, we would convert it to a Uint8Array
        // This is a simplified approach - adjust based on your actual key format
        privateKeyArray = Array.from(Buffer.from(privateKeyString, "base64"))
      }
    } catch (parseError) {
      console.error("Error parsing PROGRAM_PRIVATE_KEY:", parseError)
      return Keypair.generate()
    }

    // Create keypair from the private key
    return Keypair.fromSecretKey(Buffer.from(privateKeyArray))
  } catch (error) {
    console.error("Error getting program keypair:", error)
    return Keypair.generate()
  }
}

/**
 * Get the program public key as a string
 * @returns The program public key as a string
 */
export function getProgramPublicKey(): string {
  return process.env.PROGRAM_PUBLIC_KEY || getProgramKeypair().publicKey.toString()
}
