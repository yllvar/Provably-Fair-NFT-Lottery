import type { Connection } from "@solana/web3.js"

/**
 * Generate random 4-digit numbers for a lottery ticket
 * @param connection Solana connection
 * @param tier Ticket tier (BASIC, PREMIUM, VIP)
 * @returns Array of 4-digit numbers
 */
export async function generateTicketNumbers(connection: Connection, tier: string): Promise<string[]> {
  // Get the latest blockhash for randomness
  const { blockhash } = await connection.getLatestBlockhash()

  // Convert blockhash to a number (using first 8 characters of the hex string)
  const seed = Number.parseInt(blockhash.substring(0, 8), 16)

  // Determine how many numbers to generate based on tier
  const numbersCount = tier === "BASIC" ? 1 : tier === "PREMIUM" ? 3 : 5

  // Generate the required number of 4-digit numbers
  const numbers: string[] = []
  let currentSeed = seed

  for (let i = 0; i < numbersCount; i++) {
    // Use a different part of the seed for each number
    const randomNum = (currentSeed + i * 1234) % 10000
    // Format as 4-digit number with leading zeros
    const formattedNum = randomNum.toString().padStart(4, "0")
    numbers.push(formattedNum)

    // Update seed for next number
    currentSeed = (currentSeed * 31 + i) % 1000000
  }

  return numbers
}

/**
 * Generate metadata for a lottery ticket
 * @param ticketId Unique ticket ID
 * @param tier Ticket tier (BASIC, PREMIUM, VIP)
 * @param numbers Array of 4-digit numbers
 * @param ownerAddress Owner's wallet address
 * @returns Ticket metadata
 */
export function generateTicketMetadata(ticketId: string, tier: string, numbers: string[], ownerAddress: string) {
  // Generate tier-specific prefix
  const prefix = tier === "BASIC" ? "Lucky" : tier === "PREMIUM" ? "LuckyPlus" : "LuckyVIP"

  // Create name with numbers
  const name = `${prefix}-${numbers.join("-")}`

  // Generate description based on tier
  let description = `Solana Fortune Wheel NFT Lottery Ticket (${tier})\n`
  description += `Lucky Numbers: ${numbers.join(", ")}\n`

  if (tier === "PREMIUM") {
    description += "Includes 10% prize pool boost and 3x entry chance."
  } else if (tier === "VIP") {
    description += "Includes 25% prize pool boost and 5x entry chance."
  }

  // Create attributes for the NFT metadata
  const attributes = [
    {
      trait_type: "Tier",
      value: tier,
    },
    {
      trait_type: "Numbers Count",
      value: numbers.length.toString(),
    },
    {
      trait_type: "Prize Boost",
      value: tier === "BASIC" ? "0%" : tier === "PREMIUM" ? "10%" : "25%",
    },
  ]

  // Add each number as an attribute
  numbers.forEach((num, index) => {
    attributes.push({
      trait_type: `Lucky Number ${index + 1}`,
      value: num,
    })
  })

  return {
    name,
    description,
    image: `https://api.solanafortunewheel.com/ticket-image/${ticketId}`, // This would be a dynamic image generation endpoint
    external_url: `https://solanafortunewheel.com/tickets/${ticketId}`,
    attributes,
    properties: {
      tier,
      ticketId,
      owner: ownerAddress,
      numbers,
      files: [
        {
          uri: `https://api.solanafortunewheel.com/ticket-image/${ticketId}`,
          type: "image/png",
        },
      ],
      category: "image",
    },
  }
}
