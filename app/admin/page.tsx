"use client"

import { useState } from "react"
import { useWallet } from "@/components/wallet-provider"

export default function AdminPage() {
  const { connected, publicKey, signMessage } = useWallet()
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const initializeTickets = async () => {
    if (!connected || !publicKey || !signMessage) {
      setError("Please connect your admin wallet first")
      return
    }

    try {
      setIsInitializing(true)
      setError(null)
      setErrorDetails(null)
      setResult(null)

      // Sign a message to authenticate as admin
      const message = `Initialize tickets ${Date.now()}`
      const authToken = await signMessage(message)

      if (!authToken) {
        throw new Error("Failed to sign authentication message")
      }

      // Call the initialize endpoint
      const response = await fetch("/api/admin/initialize-tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize tickets")
      }

      setResult(data.message || "Tickets initialized successfully")
    } catch (err: any) {
      console.error("Error initializing tickets:", err)
      setError(err.message || "An error occurred")

      // Try to extract more details if available
      if (err.details) {
        setErrorDetails(err.details)
      }
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {!connected ? (
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <p className="mb-4">Please connect your admin wallet to continue.</p>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Initialize Ticket Numbers</h2>
          <p className="text-gray-400 mb-4">
            This will create all 10,000 possible ticket numbers (0000-9999) in the database. This operation only needs
            to be done once.
          </p>

          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Important Notes:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li>This operation will create 10,000 documents in your Firestore database</li>
              <li>The process may take a few minutes to complete</li>
              <li>Your admin wallet does not need SOL for this operation</li>
              <li>Make sure your Firebase and Redis credentials are properly configured</li>
            </ul>
          </div>

          <button
            onClick={initializeTickets}
            disabled={isInitializing}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isInitializing ? "Initializing..." : "Initialize Tickets"}
          </button>

          {result && <div className="mt-4 p-3 bg-green-900 text-green-300 rounded">{result}</div>}

          {error && (
            <div className="mt-4 p-3 bg-red-900 text-red-300 rounded">
              <p className="font-semibold">Error: {error}</p>
              {errorDetails && <p className="mt-2 text-sm">{errorDetails}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
