"use client"

import { useState } from "react"

interface FaqItem {
  question: string
  answer: string
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqItems: FaqItem[] = [
    {
      question: "How does the randomness system ensure fairness?",
      answer:
        "Our randomness system uses Solana block hashes and multiple entropy sources to generate unpredictable 4-digit numbers. Each draw is recorded on-chain with all entropy sources for public verification, ensuring transparency and fairness.",
    },
    {
      question: "What happens if no ticket matches the winning number?",
      answer:
        "If no ticket has the winning 4-digit number, we select a winner randomly from all tickets, with higher tier tickets having more chances to win. This ensures there's always a winner for each draw.",
    },
    {
      question: "How do tier boosts affect my odds?",
      answer:
        'Higher tier tickets give you more "entries" in the raffle: Basic = 1 entry, Premium = 2 entries, VIP = 3 entries. The random draw selects from all entries, so VIP buyers have 3x better odds than Basic buyers. The prize boost (10% for Premium, 25% for VIP) is added to the pool immediately when you purchase your ticket.',
    },
    {
      question: "Can I verify the draw results myself?",
      answer:
        "Yes! Every draw and result is recorded on-chain. You can view the complete history of draws on Solana explorers by searching for our program ID. We also provide a verification tool on our website that allows you to check the fairness of any past draw.",
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-gray-700 pb-4">
              <button onClick={() => toggleFaq(index)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-xl font-semibold">{item.question}</h3>
                <i
                  className={`fas fa-chevron-down transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                ></i>
              </button>
              <div className={`mt-2 ${openIndex === index ? "block" : "hidden"}`}>
                <p className="text-gray-400">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
