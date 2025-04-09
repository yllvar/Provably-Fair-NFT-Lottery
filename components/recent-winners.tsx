export default function RecentWinners() {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">Recent Winners</h2>
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl mx-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-4">Date</th>
                <th className="pb-4">Winner</th>
                <th className="pb-4">Prize</th>
                <th className="pb-4">Ticket Tier</th>
                <th className="pb-4">Proof</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="py-4">Today</td>
                <td className="py-4 text-purple-400">7xbn...k9w2</td>
                <td className="py-4 font-bold">18.75 SOL</td>
                <td className="py-4">
                  <span className="bg-purple-900 text-purple-300 px-2 py-1 rounded-full text-xs">VIP</span>
                </td>
                <td className="py-4">
                  <a href="#" className="text-blue-400 hover:underline">
                    View
                  </a>
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-4">Yesterday</td>
                <td className="py-4 text-blue-400">3mdf...p4q1</td>
                <td className="py-4 font-bold">12.40 SOL</td>
                <td className="py-4">
                  <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-full text-xs">Premium</span>
                </td>
                <td className="py-4">
                  <a href="#" className="text-blue-400 hover:underline">
                    View
                  </a>
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="py-4">2 days ago</td>
                <td className="py-4 text-green-400">9kjs...m2n3</td>
                <td className="py-4 font-bold">8.20 SOL</td>
                <td className="py-4">
                  <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs">Basic</span>
                </td>
                <td className="py-4">
                  <a href="#" className="text-blue-400 hover:underline">
                    View
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
