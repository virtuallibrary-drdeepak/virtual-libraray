import { useState } from 'react'

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20" id="faq">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <span className="inline-block px-5 py-1 text-sm font-medium border border-purple-400 text-purple-600 rounded-full mb-6">
          FAQ
        </span>

        <h2 className="text-4xl md:text-5xl font-semibold mb-4">
          All You Need to Know
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-12">
          Find Quick Answers To Common Questions Here. If You Don&apos;t See Yours,
          Reach Out — We&apos;re Happy To Help.
        </p>

        <div className="space-y-4 text-left">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="bg-purple-50 rounded-2xl p-6">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center gap-4"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl md:text-3xl font-semibold text-purple-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-base md:text-lg font-medium text-gray-800 text-left">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-700 flex-shrink-0">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div
                    className="mt-4 font-medium text-gray-700 leading-relaxed animate-fadeIn"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

