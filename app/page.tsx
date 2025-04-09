import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import TicketTiers from "@/components/ticket-tiers"
import HowItWorks from "@/components/how-it-works"
import RandomnessExplanation from "@/components/vrf-explanation"
import RecentWinners from "@/components/recent-winners"
import Faq from "@/components/faq"
import Footer from "@/components/footer"
import SolanaPayModal from "@/components/solana-pay-modal"
import WinningNumberDisplay from "@/components/winning-number-display"
import TicketDisplay from "@/components/ticket-display"

export default function Home() {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <div className="mb-16">
          <WinningNumberDisplay />
        </div>
        <TicketTiers />
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Your Tickets</h2>
          <TicketDisplay />
        </div>
        <HowItWorks />
        <RandomnessExplanation />
        <RecentWinners />
        <Faq />
      </main>
      <Footer />
      {/* Modals rendered at the root level */}
      <SolanaPayModal />
    </div>
  )
}
