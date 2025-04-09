import nacl from "tweetnacl"
import bs58 from "bs58"

/**
 * Verify admin authentication
 * @param request The request to verify
 * @returns Whether the request is from an admin
 */
export async function verifyAdminAuth(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false
    }

    const token = authHeader.substring(7)
    const [signature, message, publicKey] = token.split(".")

    // Check if the public key is in the admin list
    const adminPublicKeys = (process.env.ADMIN_PUBLIC_KEYS || "").split(",")
    if (!adminPublicKeys.includes(publicKey)) {
      return false
    }

    // Verify the signature
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = bs58.decode(signature)
    const publicKeyBytes = bs58.decode(publicKey)

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
  } catch (error) {
    console.error("Error verifying admin auth:", error)
    return false
  }
}

/**
 * Verify wallet authentication
 * @param request The request to verify
 * @returns The wallet address if authenticated, null otherwise
 */
export async function verifyWalletAuth(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const [signature, message, publicKey] = token.split(".")

    // Verify the signature
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = bs58.decode(signature)
    const publicKeyBytes = bs58.decode(publicKey)

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)

    return isValid ? publicKey : null
  } catch (error) {
    console.error("Error verifying wallet auth:", error)
    return null
  }
}
