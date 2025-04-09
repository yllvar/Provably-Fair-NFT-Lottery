"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import bs58 from "bs58"

interface WalletContextType {
  connected: boolean
  publicKey: string | null
  balance: number | null
  connect: () => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<string | null>
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  balance: null,
  connect: async () => {},
  disconnect: () => {},
  signMessage: async () => null,
})

export function useWallet() {
  return useContext(WalletContext)
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  // Check if wallet is already connected
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== "undefined" && window.solana) {
        try {
          // Check if wallet is already connected
          const response = await window.solana.connect({ onlyIfTrusted: true })
          handleConnection(response)
        } catch (error) {
          // Wallet not connected, do nothing
        }
      }
    }

    checkWallet()
  }, [])

  // Update balance when connected
  useEffect(() => {
    const updateBalance = async () => {
      if (connected && publicKey) {
        try {
          const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "", "confirmed")
          const pk = new PublicKey(publicKey)
          const bal = await connection.getBalance(pk)
          setBalance(bal / 1_000_000_000) // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error)
        }
      }
    }

    if (connected) {
      updateBalance()
      // Set up interval to update balance
      const interval = setInterval(updateBalance, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [connected, publicKey])

  const handleConnection = (response: any) => {
    setConnected(true)
    setPublicKey(response.publicKey.toString())
  }

  const connect = async () => {
    if (typeof window !== "undefined" && window.solana) {
      try {
        const response = await window.solana.connect()
        handleConnection(response)
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    } else {
      alert("Solana wallet not found! Please install a Solana wallet extension.")
    }
  }

  const disconnect = () => {
    if (typeof window !== "undefined" && window.solana) {
      window.solana.disconnect()
      setConnected(false)
      setPublicKey(null)
      setBalance(null)
    }
  }

  const signMessage = async (message: string): Promise<string | null> => {
    if (!connected || !publicKey || typeof window === "undefined" || !window.solana) {
      return null
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await window.solana.signMessage(encodedMessage, "utf8")

      const signature = bs58.encode(signedMessage.signature)
      return `${signature}.${message}.${publicKey}`
    } catch (error) {
      console.error("Error signing message:", error)
      return null
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        balance,
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
