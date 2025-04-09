"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/wallet-provider"
import TicketImage from "@/components/ticket-image"

interface Ticket {
  ticketId: string
  tier: string
  number: string
  metadataUrl: string
  mintTimestamp: string
}

export default function TicketDisplay() {
  const { connected, publicKey } = useWallet()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserTickets()
    } else {
      setTickets([])
    }
  }, [connected, publicKey])

  const fetchUserTickets = async () => {
    if (!publicKey) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tickets/user?wallet=${publicKey}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-xl">
        <p>Connect your wallet to view your tickets</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4">Loading your tickets...</p>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-xl">
        <p>You don't have any tickets yet. Purchase a ticket to participate in the lottery!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => (
        <div
          key={ticket.ticketId}
          className={`p-6 rounded-xl border-2 ${
            ticket.tier === "BASIC"
              ? "border-green-500 bg-gray-800"
              : ticket.tier === "PREMIUM"
                ? "border-blue-500 bg-gray-800"
                : "border-purple-500 bg-gray-800"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3
              className={`text-xl font-bold ${
                ticket.tier === "BASIC"
                  ? "text-green-400"
                  : ticket.tier === "PREMIUM"
                    ? "text-blue-400"
                    : "text-purple-400"
              }`}
            >
              {ticket.tier} Ticket
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                ticket.tier === "BASIC"
                  ? "bg-green-900 text-green-300"
                  : ticket.tier === "PREMIUM"
                    ? "bg-blue-900 text-blue-300"
                    : "bg-purple-900 text-purple-300"
              }`}
            >
              {ticket.tier === "BASIC" ? "1x" : ticket.tier === "PREMIUM" ? "3x" : "5x"} Entry
            </span>
          </div>

          <div className="mb-4">
            <TicketImage metadataUrl={ticket.metadataUrl} ticketNumber={ticket.number} tier={ticket.tier} />
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm mb-2">Your Lucky Number:</p>
            <div className="inline-block">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                  ticket.tier === "BASIC"
                    ? "bg-green-900 text-green-300"
                    : ticket.tier === "PREMIUM"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-purple-900 text-purple-300"
                }`}
              >
                {ticket.number}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>Purchased: {new Date(ticket.mintTimestamp).toLocaleDateString()}</p>
            <p className="mt-1">Ticket ID: {ticket.ticketId.substring(0, 8)}...</p>
          </div>
        </div>
      ))}
    </div>
  )
}
