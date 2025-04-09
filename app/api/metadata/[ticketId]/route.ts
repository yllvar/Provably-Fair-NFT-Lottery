import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export async function GET(request: Request, { params }: { params: { ticketId: string } }) {
  try {
    const ticketId = params.ticketId

    // Get ticket metadata from Firestore
    const metadataDoc = await db.collection("ticket_metadata").doc(ticketId).get()

    if (!metadataDoc.exists) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 })
    }

    // Return the metadata
    return NextResponse.json(metadataDoc.data())
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}
