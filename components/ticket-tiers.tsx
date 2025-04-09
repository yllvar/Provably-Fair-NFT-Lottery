"use client"

import { useCallback } from "react"
import { useWallet } from "@/components/wallet-provider"

export default function TicketTiers() {
  const { connected } = useWallet()

  const buyTicket = useCallback(
    async (tier: string, price: string) => {
      if (!connected) {
        alert("Please connect your wallet first!")
        return
      }

      // Show the Solana Pay modal
      const modal = document.getElementById("solana-pay-modal")
      if (modal) {
        modal.classList.remove("hidden")

        // Call the createSolanaPayRequest function from the modal
        if (typeof window !== "undefined" && window.createSolanaPayRequest) {
          window.createSolanaPayRequest(tier)
        }
      }
    },
    [connected],
  )

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">Choose Your Ticket Tier</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Tier 1 - Basic */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-green-400">Basic</h3>
            <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm">1x Entry</span>
          </div>
          <div className="mb-6">
            <div className="text-4xl font-bold mb-2">0.5 SOL</div>
            <div className="text-gray-400">Standard chance to win</div>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-400 mr-2"></i>
              <span>1 lottery entry</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-400 mr-2"></i>
              <span>No prize boost</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-400 mr-2"></i>
              <span>Resellable NFT</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-400 mr-2"></i>
              <span>Provably fair randomness</span>
            </li>
          </ul>
          <button
            onClick={() => buyTicket("BASIC", "0.5 SOL")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Buy with Solana Pay
          </button>
        </div>

        {/* Tier 2 - Premium */}
        <div className="bg-gray-800 rounded-xl p-6 border border-blue-500 hover:border-blue-400 transform scale-105 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-blue-400">Premium</h3>
            <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm">2x Entry</span>
          </div>
          <div className="mb-6">
            <div className="text-4xl font-bold mb-2">1.5 SOL</div>
            <div className="text-gray-400">Better odds + prize boost</div>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <i className="fas fa-check-circle text-blue-400 mr-2"></i>
              <span>2 lottery entries</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-blue-400 mr-2"></i>
              <span>10% prize pool boost</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-blue-400 mr-2"></i>
              <span>Resellable NFT</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-blue-400 mr-2"></i>
              <span>Daily streak rewards</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-blue-400 mr-2"></i>
              <span>Provably fair randomness</span>
            </li>
          </ul>
          <button
            onClick={() => buyTicket("PREMIUM", "1.5 SOL")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Buy with Solana Pay
          </button>
        </div>

        {/* Tier 3 - VIP */}
        <div className="bg-gray-800 rounded-xl p-6 border border-purple-500 hover:border-purple-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-purple-400">VIP</h3>
            <span className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-sm">3x Entry</span>
          </div>
          <div className="mb-6">
            <div className="text-4xl font-bold mb-2">3 SOL</div>
            <div className="text-gray-400">Best odds + max boost</div>
          </div>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <i className="fas fa-check-circle text-purple-400 mr-2"></i>
              <span>3 lottery entries</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-purple-400 mr-2"></i>
              <span>25% prize pool boost</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-purple-400 mr-2"></i>
              <span>Resellable NFT</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-purple-400 mr-2"></i>
              <span>Daily streak rewards</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-purple-400 mr-2"></i>
              <span>Exclusive winner badge</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-purple-400 mr-2"></i>
              <span>Provably fair randomness</span>
            </li>
          </ul>
          <button
            onClick={() => buyTicket("VIP", "3 SOL")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Buy with Solana Pay
          </button>
        </div>
      </div>
    </section>
  )
}
