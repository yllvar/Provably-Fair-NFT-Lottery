export default function HowItWorks() {
  return (
    <section className="mb-16 bg-gray-800 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <div className="bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-wallet text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">1. Connect Wallet</h3>
          <p className="text-gray-400">Link your Solana wallet (Phantom, Backpack, etc.)</p>
        </div>
        <div className="text-center p-4">
          <div className="bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-ticket-alt text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">2. Buy NFT Ticket</h3>
          <p className="text-gray-400">Choose your tier and get your lucky numbers</p>
        </div>
        <div className="text-center p-4">
          <div className="bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-random text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">3. Daily Draw</h3>
          <p className="text-gray-400">A winning 4-digit number is drawn using Solana randomness</p>
        </div>
        <div className="text-center p-4">
          <div className="bg-yellow-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-trophy text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">4. Claim Prize</h3>
          <p className="text-gray-400">If your numbers match, you win the prize pool</p>
        </div>
      </div>
    </section>
  )
}
