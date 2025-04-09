"use client"

import { useState, useEffect } from "react"

export default function VrfDrawModal() {
  const [status, setStatus] = useState("Pending")
  const [statusClass, setStatusClass] = useState("text-yellow-300")

  // This function would be called when the VRF draw is triggered
  const triggerVrfDraw = () => {
    const modal = document.getElementById("vrf-modal")
    if (modal) {
      modal.classList.remove("hidden")
    }

    // Simulate VRF process
    setTimeout(() => {
      setStatus("Processing...")
      setStatusClass("text-blue-400")
    }, 1500)

    setTimeout(() => {
      setStatus("Completed")
      setStatusClass("text-green-400")

      // Close modal after delay
      setTimeout(() => {
        if (modal) {
          modal.classList.add("hidden")
        }
        alert("VRF Draw Complete! Winner: 7xbn...k9w2 (VIP Ticket)")
      }, 2000)
    }, 3500)
  }

  // This would be called from the parent component when needed
  useEffect(() => {
    // For demo purposes, we'll expose this function globally
    // In a real app, you'd use proper state management
    ;(window as any).triggerVrfDraw = triggerVrfDraw
  }, [])

  return (
    <div id="vrf-modal" className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 hidden">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">VRF Draw in Progress</h3>
          <div className="flex items-center space-x-2">
            <img src="/placeholder.svg?height=24&width=24" alt="Switchboard" className="w-6 h-6" />
            <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full">VRF</span>
          </div>
        </div>
        <div className="text-center mb-6">
          <div className="animate-pulse mb-6">
            <i className="fas fa-random text-5xl text-purple-500"></i>
          </div>
          <p className="text-gray-400 mb-4">Requesting verifiable randomness from Switchboard...</p>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">VRF Request ID:</span>
              <span className="font-mono text-sm">7xbn...k9w2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={statusClass} id="vrf-status">
                {status}
              </span>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500">
          <p>This typically takes 1-2 Solana slots to complete.</p>
          <p>You can verify the result on-chain when finished.</p>
        </div>
      </div>
    </div>
  )
}
