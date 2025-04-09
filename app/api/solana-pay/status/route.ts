import { NextResponse } from "next/server"
import { verifySolanaPayTransfer } from "@/lib/solana-pay"
import { db } from "@/lib/firebase"
import { releaseTicketNumber } from "@/lib/ticket-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Missing reference parameter" }, { status: 400 })
    }

    // Check if payment request exists
    const paymentRequestRef = db.collection("payment_requests").doc(reference)
    const paymentRequestDoc = await paymentRequestRef.get()

    if (!paymentRequestDoc.exists) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 })
    }

    const paymentRequest = paymentRequestDoc.data()

    // If payment is already confirmed, return the status
    if (paymentRequest?.status === "confirmed") {
      return NextResponse.json({
        success: true,
        status: "confirmed",
        signature: paymentRequest.signature,
        ticketNumber: paymentRequest.ticketNumber,
        tier: paymentRequest.tier,
      })
    }

    // Check if payment is expired
    const expiresAt = new Date(paymentRequest?.expiresAt)
    if (expiresAt < new Date()) {
      // Release the reserved ticket number
      if (paymentRequest?.ticketNumber) {
        await releaseTicketNumber(paymentRequest.ticketNumber)
      }

      await paymentRequestRef.update({ status: "expired" })
      return NextResponse.json({
        success: false,
        status: "expired",
      })
    }

    // Verify the payment
    const signature = await verifySolanaPayTransfer(reference, paymentRequest?.amount)

    if (signature) {
      // Update payment request status
      await paymentRequestRef.update({
        status: "confirmed",
        signature,
        confirmedAt: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        status: "confirmed",
        signature,
        ticketNumber: paymentRequest.ticketNumber,
        tier: paymentRequest.tier,
      })
    }

    return NextResponse.json({
      success: false,
      status: "pending",
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 })
  }
}
