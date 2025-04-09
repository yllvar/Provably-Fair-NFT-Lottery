"use client"

import { useState, useEffect } from "react"
import { ipfsToHttp } from "@/lib/ipfs-helpers"

interface TicketImageProps {
  metadataUrl: string
  ticketNumber: string
  tier: string
}

export default function TicketImage({ metadataUrl, ticketNumber, tier }: TicketImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(ipfsToHttp(metadataUrl))

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.status}`)
        }

        const metadata = await response.json()

        if (metadata.image) {
          setImageUrl(ipfsToHttp(metadata.image))
        } else {
          setError("No image found in metadata")
        }
      } catch (err) {
        console.error("Error fetching metadata:", err)
        setError("Failed to load ticket image")
      } finally {
        setIsLoading(false)
      }
    }

    if (metadataUrl) {
      fetchMetadata()
    }
  }, [metadataUrl])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg animate-pulse">
        <div className="w-8 h-8 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !imageUrl) {
    // Fallback to a generated ticket image
    return (
      <div
        className={`p-4 rounded-lg ${
          tier === "BASIC" ? "bg-green-900" : tier === "PREMIUM" ? "bg-blue-900" : "bg-purple-900"
        }`}
      >
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">{tier} Ticket</h3>
          <div className="bg-gray-800 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-2">
            <span className="text-2xl font-bold">{ticketNumber}</span>
          </div>
          <p className="text-sm text-gray-300">Solana Fortune Wheel</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden">
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={`${tier} Ticket #${ticketNumber}`}
        className="w-full h-auto"
        onError={() => setError("Failed to load image")}
      />
    </div>
  )
}
