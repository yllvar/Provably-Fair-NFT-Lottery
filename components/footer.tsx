export default function Footer() {
  return (
    <footer className="bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <i className="fas fa-coins text-2xl text-yellow-300"></i>
              <span className="text-xl font-bold">Solana Fortune Wheel</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-600 to-green-400">
                Switchboard VRF
              </span>
            </div>
            <p className="text-gray-400 mt-2">Provably fair NFT lottery on Solana</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="fab fa-discord"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="fab fa-telegram"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2023 Solana Fortune Wheel. All rights reserved.</p>
          <p className="mt-2 text-sm">This is a demo interface. Not affiliated with Solana, Anza, or Switchboard.</p>
        </div>
      </div>
    </footer>
  )
}
