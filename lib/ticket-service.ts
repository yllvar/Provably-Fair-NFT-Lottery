import { db } from "@/lib/firebase"
import { redis } from "@/lib/redis"

// Define the structure of our ticket metadata
interface TicketMetadata {
  number: string
  tier: string
  used: boolean
}

/**
 * Reserve a ticket number for purchase
 * @param tier The ticket tier (BASIC, PREMIUM, VIP)
 * @returns The reserved ticket number and metadata
 */
export async function reserveTicketNumber(tier: string): Promise<{ number: string; metadata: TicketMetadata }> {
  try {
    // First, try to get an available number from Redis cache
    let ticketNumber: string | null = null

    try {
      // Pop an available number from the appropriate Redis set
      ticketNumber = await redis.spop(`available_tickets:${tier.toLowerCase()}`)
    } catch (error) {
      console.warn("Redis error:", error)
    }

    // If we couldn't get a number from Redis, fall back to Firestore
    if (!ticketNumber) {
      // Get an unused ticket number from Firestore
      const ticketsSnapshot = await db
        .collection("ticket_numbers")
        .where("tier", "==", tier)
        .where("used", "==", false)
        .limit(1)
        .get()

      if (ticketsSnapshot.empty) {
        throw new Error(`No available ${tier} tickets`)
      }

      const ticketDoc = ticketsSnapshot.docs[0]
      ticketNumber = ticketDoc.data().number

      // Mark the ticket as used in Firestore
      await ticketDoc.ref.update({
        used: true,
        reservedAt: new Date().toISOString(),
        reservationExpires: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      })
    }

    // Create metadata for the ticket
    const metadata: TicketMetadata = {
      number: ticketNumber,
      tier,
      used: false,
    }

    return { number: ticketNumber, metadata }
  } catch (error) {
    console.error("Error reserving ticket number:", error)
    throw new Error("Failed to reserve ticket number")
  }
}

/**
 * Release a reserved ticket number if payment fails
 * @param ticketNumber The ticket number to release
 */
export async function releaseTicketNumber(ticketNumber: string): Promise<void> {
  try {
    // Get the ticket document
    const ticketsSnapshot = await db.collection("ticket_numbers").where("number", "==", ticketNumber).limit(1).get()

    if (!ticketsSnapshot.empty) {
      const ticketDoc = ticketsSnapshot.docs[0]
      const tier = ticketDoc.data().tier

      // Mark the ticket as unused in Firestore
      await ticketDoc.ref.update({
        used: false,
        reservedAt: null,
        reservationExpires: null,
      })

      // Add the number back to the Redis set
      try {
        await redis.sadd(`available_tickets:${tier.toLowerCase()}`, ticketNumber)
      } catch (error) {
        console.warn("Redis error:", error)
      }
    }
  } catch (error) {
    console.error("Error releasing ticket number:", error)
  }
}

/**
 * Mark a ticket number as used after successful payment and minting
 * @param ticketNumber The ticket number to mark as used
 */
export async function markTicketNumberAsUsed(ticketNumber: string): Promise<void> {
  try {
    // Get the ticket document
    const ticketsSnapshot = await db.collection("ticket_numbers").where("number", "==", ticketNumber).limit(1).get()

    if (!ticketsSnapshot.empty) {
      const ticketDoc = ticketsSnapshot.docs[0]

      // Mark the ticket as permanently used
      await ticketDoc.ref.update({
        used: true,
        reservedAt: null,
        reservationExpires: null,
        mintedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error marking ticket as used:", error)
  }
}

/**
 * Initialize the ticket numbers in the database
 * This should be run once to populate the database with all possible ticket numbers
 */
export async function initializeTicketNumbers(): Promise<void> {
  try {
    // Check if we already have ticket numbers
    const existingTickets = await db.collection("ticket_numbers").limit(1).get()
    if (!existingTickets.empty) {
      console.log("Ticket numbers already initialized")
      return
    }

    // For Firebase batch operations
    let batch = db.batch()
    let count = 0
    let batchCount = 0

    console.log("Starting ticket number initialization...")

    // Create all 10,000 possible 4-digit numbers (0000-9999)
    for (let i = 0; i < 10000; i++) {
      const number = i.toString().padStart(4, "0")

      // Determine tier based on number patterns or random distribution
      // This is a simple example - you might want a more sophisticated distribution
      let tier = "BASIC"
      if (i % 10 === 0) tier = "PREMIUM" // 10% are PREMIUM
      if (i % 20 === 0) tier = "VIP" // 5% are VIP

      const docRef = db.collection("ticket_numbers").doc(number)
      batch.set(docRef, {
        number,
        tier,
        used: false,
        createdAt: new Date().toISOString(),
      })

      count++

      // Firestore batches are limited to 500 operations
      if (count % 500 === 0) {
        try {
          await batch.commit()
          batchCount++
          console.log(`Committed batch ${batchCount} (${count} tickets)`)
          // Create a new batch for the next set
          batch = db.batch()
        } catch (error) {
          console.error(`Error committing batch ${batchCount}:`, error)
          throw new Error(`Failed to commit batch ${batchCount}: ${error.message}`)
        }
      }
    }

    // Commit any remaining operations
    if (count % 500 !== 0) {
      try {
        await batch.commit()
        batchCount++
        console.log(`Committed final batch ${batchCount} (${count} tickets total)`)
      } catch (error) {
        console.error(`Error committing final batch:`, error)
        throw new Error(`Failed to commit final batch: ${error.message}`)
      }
    }

    console.log(`Initialized ${count} ticket numbers in ${batchCount} batches`)

    // Also populate Redis sets for faster access
    try {
      console.log("Populating Redis sets...")

      // Create sets for each tier
      const basicNumbers = []
      const premiumNumbers = []
      const vipNumbers = []

      for (let i = 0; i < 10000; i++) {
        const number = i.toString().padStart(4, "0")

        if (i % 20 === 0) {
          vipNumbers.push(number)
        } else if (i % 10 === 0) {
          premiumNumbers.push(number)
        } else {
          basicNumbers.push(number)
        }
      }

      // Add numbers to Redis sets in smaller chunks to avoid memory issues
      const chunkSize = 1000

      // Add BASIC tickets
      for (let i = 0; i < basicNumbers.length; i += chunkSize) {
        const chunk = basicNumbers.slice(i, i + chunkSize)
        if (chunk.length > 0) {
          await redis.sadd("available_tickets:basic", ...chunk)
          console.log(`Added ${chunk.length} BASIC tickets to Redis (${i + chunk.length}/${basicNumbers.length})`)
        }
      }

      // Add PREMIUM tickets
      for (let i = 0; i < premiumNumbers.length; i += chunkSize) {
        const chunk = premiumNumbers.slice(i, i + chunkSize)
        if (chunk.length > 0) {
          await redis.sadd("available_tickets:premium", ...chunk)
          console.log(`Added ${chunk.length} PREMIUM tickets to Redis (${i + chunk.length}/${premiumNumbers.length})`)
        }
      }

      // Add VIP tickets
      for (let i = 0; i < vipNumbers.length; i += chunkSize) {
        const chunk = vipNumbers.slice(i, i + chunkSize)
        if (chunk.length > 0) {
          await redis.sadd("available_tickets:vip", ...chunk)
          console.log(`Added ${chunk.length} VIP tickets to Redis (${i + chunk.length}/${vipNumbers.length})`)
        }
      }

      console.log("Populated Redis sets with ticket numbers")
    } catch (error) {
      console.warn("Redis error:", error)
      console.log("Continuing without Redis population - will fall back to Firestore")
    }
  } catch (error) {
    console.error("Error initializing ticket numbers:", error)
    throw error
  }
}
