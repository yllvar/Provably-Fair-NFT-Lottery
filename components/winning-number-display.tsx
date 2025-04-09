"use client"

import { useState, useEffect } from "react"

export default function WinningNumberDisplay() {
  const [winningNumber, setWinningNumber] = useState<string | null>(null)
  const [lastDrawDate, setLastDrawDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLatestDraw()
  }, [])

  const fetchLatestDraw = async () => {
    try {
      const response = await fetch("/api/raffle/latest")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.winningNumber) {
          setWinningNumber(data.winningNumber)
          setLastDrawDate(data.completedAt)
        }
      }
    } catch (error) {
      console.error("Error fetching latest draw:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <div className="animate-pulse">
          <h3 className="text-xl font-bold mb-2">Latest Winning Number</h3>
          <div className="h-12 bg-gray-700 rounded-lg w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!winningNumber) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold mb-2">Latest Winning Number</h3>
        <p className="text-gray-400">No draws have been completed yet</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-center">
      <h3 className="text-xl font-bold mb-4">Latest Winning Number</h3>
      <div className="flex justify-center mb-4">
        {winningNumber.split("").map((digit, index) => (
          <div
            key={index}
            className="w-16 h-16 rounded-full bg-purple-900 text-white flex items-center justify-center text-2xl font-bold mx-1"
          >
            {digit}
          </div>
        ))}
      </div>
      {lastDrawDate && (
        <p className="text-gray-400">
          Drawn on: {new Date(lastDrawDate).toLocaleDateString()} at {new Date(lastDrawDate).toLocaleTimeString()}
        </p>
      )}
      <p className="mt-4 text-sm text-gray-500">Check your tickets to see if you're a winner!</p>
    </div>
  )
}
