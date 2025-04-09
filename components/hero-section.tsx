"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/wallet-provider"

export default function HeroSection() {
  const { connected } = useWallet()
  const [countdown, setCountdown] = useState("23:59:59")
  const [isSpinning, setIsSpinning] = useState(false)
  const [poolData, setPoolData] = useState({
    prizePool: 25.8,
    basePool: "20.0",
    boostAmount: "5.8",
    nextDraw: "",
    countdown: "23:59:59",
  })

  // Fetch pool status
  useEffect(() => {
    const fetchPoolStatus = async () => {
      try {
        const response = await fetch("/api/pool/status")
        if (response.ok) {
          const data = await response.json()
          setPoolData(data)
          setCountdown(data.countdown)
        }
      } catch (error) {
        console.error("Error fetching pool status:", error)
      }
    }

    fetchPoolStatus()
    const interval = setInterval(fetchPoolStatus, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (countdown === "00:00:00") {
        clearInterval(timer)
        setCountdown("Draw Starting...")
        // Here you would trigger the draw
        return
      }

      // Decrement the countdown
      const [hours, minutes, seconds] = countdown.split(":").map(Number)
      let newSeconds = seconds - 1
      let newMinutes = minutes
      let newHours = hours

      if (newSeconds < 0) {
        newSeconds = 59
        newMinutes -= 1
      }

      if (newMinutes < 0) {
        newMinutes = 59
        newHours -= 1
      }

      if (newHours < 0) {
        newHours = 0
        newMinutes = 0
        newSeconds = 0
      }

      const formattedTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
        .toString()
        .padStart(2, "0")}:${newSeconds.toString().padStart(2, "0")}`

      setCountdown(formattedTime)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleSpin = () => {
    if (!connected) {
      alert("Please connect your wallet first!")
      return
    }

    setIsSpinning(true)
    setTimeout(() => {
      setIsSpinning(false)
      // In a real app, this would trigger the draw
      alert("Congratulations! You won the raffle! (This is a simulation)")
    }, 3000)
  }

  return (
    <section className="text-center mb-16">
      <h2 className="text-4xl font-bold mb-4">Provably Fair NFT Lottery</h2>
      <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
        Powered by transparent randomness for guaranteed fairness. Buy NFT tickets with Solana Pay and win big!
      </p>

      {/* Prize Pool Display */}
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto mb-8 border border-purple-500 shadow-[0_0_15px_rgba(148,245,128,0.7)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Current Prize Pool</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">Verified</span>
          </div>
        </div>
        <div className="flex justify-center items-baseline mb-2">
          <span className="text-5xl font-bold text-purple-400">{poolData.prizePool.toFixed(1)}</span>
          <span className="text-2xl ml-2">SOL</span>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Base Pool: {poolData.basePool} SOL</span>
            <span>VIP Boosts: +{poolData.boostAmount} SOL</span>
          </div>
          <div className="h-2 w-full rounded-md bg-gradient-to-r from-green-400 to-purple-600"></div>
        </div>
        <p className="text-gray-400">
          Next draw in: <span className="font-mono text-yellow-300">{countdown}</span>
        </p>
        <p className="text-sm text-gray-400 mt-2">Draw will trigger automatically at the scheduled time</p>
      </div>

      {/* Wheel Visualization */}
      <div className="relative w-64 h-64 mx-auto mb-12">
        <div
          className={`w-full h-full rounded-full border-8 border-purple-500 relative overflow-hidden ${
            isSpinning ? "animate-spin" : ""
          }`}
        >
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              transform: "rotate(0deg)",
              backgroundColor: "#14F195",
            }}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              transform: "rotate(120deg)",
              backgroundColor: "#9945FF",
            }}
          ></div>
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              transform: "rotate(240deg)",
              backgroundColor: "#FFD700",
            }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gray-900 border-4 border-white flex items-center justify-center">
            <i className="fas fa-random text-2xl text-yellow-300"></i>
          </div>
        </div>
        <button
          onClick={handleSpin}
          disabled={isSpinning || !connected}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-gray-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {isSpinning ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-play"></i>}
        </button>
      </div>
    </section>
  )
}
