export default function RandomnessExplanation() {
  return (
    <section className="mb-16 bg-gray-800 rounded-xl p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Provably Fair Randomness</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <img
              src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnc0aW53cW01dmJ4eHp0Njl3MWg1bmczejFtdmRxNmFhdjk4cmpoOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H3SpUfkTQZXupCpdfv/giphy.gif"
              alt="Randomness Animation"
              className="rounded-lg w-full"
            />
          </div>
          <div className="flex-1">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-purple-600 rounded-full p-2 mr-4">
                  <i className="fas fa-lock text-white"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Transparent Randomness</h3>
                  <p className="text-gray-400">
                    Our randomness generation uses Solana block hashes and multiple entropy sources for fairness.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 rounded-full p-2 mr-4">
                  <i className="fas fa-eye text-white"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Verifiable Process</h3>
                  <p className="text-gray-400">
                    Every random draw is recorded on-chain with all entropy sources for public verification.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-green-600 rounded-full p-2 mr-4">
                  <i className="fas fa-bolt text-white"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Fast & Efficient</h3>
                  <p className="text-gray-400">
                    Results are delivered in seconds with minimal Solana fees, ensuring quick prize distribution.
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-6 bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Current Status:</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <a href="#" className="text-purple-400 hover:underline text-sm">
                View recent draw proofs on Solana Explorer
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
