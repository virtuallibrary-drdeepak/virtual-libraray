const reasons = [
  'Feeling alone while preparing for your exam from home?',
  'Struggling to stay consistent with your studies?',
  "Don't have a study partner to keep you accountable?",
  'Feeling low on motivation or overwhelmed?',
  'Want expert guidance and support while you study?',
]

export default function WhyJoinSection() {
  return (
    <section className="bg-[#fffde7] py-20" id="whyjoin">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl text-gray-900 text-center mb-14">
          Why Join This Virtual Space.
        </h2>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Reason Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reasons.slice(0, 4).map((reason, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl border border-yellow-200 text-gray-800 shadow-sm"
              >
                {reason}
              </div>
            ))}
            <div className="p-6 bg-white rounded-2xl border border-yellow-200 text-gray-800 shadow-sm sm:col-span-2">
              {reasons[4]}
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-[#fff9c4] border border-yellow-300 rounded-2xl p-10 flex items-center justify-center text-center shadow-sm h-full">
            <p className="text-2xl font-medium text-gray-900 leading-relaxed">
              Join us and transform your home study into a productive, focused, and
              motivating experience!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

