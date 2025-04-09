"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@/components/wallet-provider"

interface SolanaPayModalProps {
  onSuccess?: (ticketId: string) => void
}

export default function SolanaPayModal({ onSuccess }: SolanaPayModalProps) {
  const { connected, publicKey } = useWallet()
  const [isPaying, setIsPaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<{
    reference: string
    amount: number
    url: string
    qrCode: string
    tier: string
    ticketNumber: string
  } | null>(null)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const modal = document.getElementById("solana-pay-modal")
    const closeBtn = document.getElementById("close-modal")

    const closeModal = () => {
      if (modal) {
        modal.classList.add("hidden")
        setIsPaying(false)
        setPaymentData(null)
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
        }
      }
    }

    // Close modal when clicking the close button
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal)
    }

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal()
        }
      })
    }

    return () => {
      if (closeBtn) {
        closeBtn.removeEventListener("click", closeModal)
      }
      if (modal) {
        modal.removeEventListener("click", closeModal)
      }
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [statusCheckInterval])

  const createPaymentRequest = async (tier: string) => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first!")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/solana-pay/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier,
          walletAddress: publicKey,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentData({
          reference: data.reference,
          amount: data.amount,
          url: data.url,
          qrCode: data.qrCode,
          tier,
          ticketNumber: data.ticketNumber,
        })

        // Start checking payment status
        const interval = setInterval(() => checkPaymentStatus(data.reference), 3000)
        setStatusCheckInterval(interval)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Failed to create payment request"}`)
      }
    } catch (error) {
      console.error("Error creating payment request:", error)
      alert("Error creating payment request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async (reference: string) => {
    try {
      const response = await fetch(`/api/solana-pay/status?reference=${reference}`)
      const data = await response.json()

      if (data.success && data.status === "confirmed") {
        // Payment confirmed, mint the ticket
        await mintTicket(reference)
      } else if (data.status === "expired") {
        alert("Payment request expired. Please try again.")
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
    }
  }

  const mintTicket = async (reference: string) => {
    if (!paymentData || !publicKey) return

    try {
      setIsPaying(true)

      const response = await fetch("/api/tickets/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          tier: paymentData.tier,
          paymentReference: reference,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(
          `Successfully purchased a ${paymentData.tier} ticket with number ${paymentData.ticketNumber}! Ticket ID: ${data.ticketId}`,
        )

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(data.ticketId)
        }

        // Close the modal
        const modal = document.getElementById("solana-pay-modal")
        if (modal) {
          modal.classList.add("hidden")
        }

        // Clear the interval
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
        }
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Failed to mint ticket"}`)
      }
    } catch (error) {
      console.error("Error minting ticket:", error)
      alert("Error minting ticket. Please try again.")
    } finally {
      setIsPaying(false)
    }
  }

  // This function is called from the ticket tiers component
  useEffect(() => {
    // Only expose this function on the client side
    if (typeof window !== "undefined") {
      window.createSolanaPayRequest = createPaymentRequest
    }

    return () => {
      // Clean up when component unmounts
      if (typeof window !== "undefined") {
        // @ts-ignore
        window.createSolanaPayRequest = undefined
      }
    }
  }, [])

  return (
    <div
      id="solana-pay-modal"
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 hidden"
    >
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Complete Purchase</h3>
          <button id="close-modal" className="text-gray-400 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Creating payment request...</p>
          </div>
        ) : paymentData ? (
          <div className="text-center mb-6">
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              {/* Display QR code */}
              <div dangerouslySetInnerHTML={{ __html: paymentData.qrCode }} />
            </div>
            <p className="text-gray-400 mb-2">Scan with your Solana wallet</p>
            <p className="text-sm text-gray-500 mb-4">Or open wallet app to approve</p>

            <a
              href={paymentData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition"
            >
              Open in Wallet
            </a>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>Please select a ticket tier to purchase</p>
          </div>
        )}

        {paymentData && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">You pay:</span>
              <span className="font-bold">{paymentData.amount} SOL</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">For:</span>
              <span className="text-purple-400">{paymentData.tier} NFT Ticket</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Ticket Number:</span>
              <span className="font-mono text-yellow-300">{paymentData.ticketNumber}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Reference:</span>
                <span className="font-mono text-xs truncate max-w-[200px]">
                  {paymentData.reference.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        )}

        {isPaying && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p>Processing your purchase...</p>
          </div>
        )}
      </div>
    </div>
  )
}
