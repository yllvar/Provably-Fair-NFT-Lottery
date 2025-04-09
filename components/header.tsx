"use client"

import { useWallet } from "@/components/wallet-provider"

export default function Header() {
  const { connected, publicKey, balance, connect, disconnect } = useWallet()

  return (
    <header className="py-6 px-4 shadow-lg bg-gradient-to-r from-purple-600 to-green-400">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-coins text-2xl text-yellow-300"></i>
          <h1 className="text-2xl font-bold">Solana Fortune Wheel</h1>
          <span className="text-xs px-2 py-1 rounded-full ml-2 bg-gradient-to-r from-purple-600 to-green-400">
            Switchboard VRF
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {!connected ? (
            <button
              onClick={connect}
              className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                {publicKey ? `${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}` : ""}
              </span>
              <span className="text-sm bg-gray-800 px-3 py-1 rounded-full">
                {balance !== null ? `${balance.toFixed(2)} SOL` : "Loading..."}
              </span>
              <button
                onClick={disconnect}
                className="text-sm bg-red-900 hover:bg-red-800 text-white px-3 py-1 rounded-full transition"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
