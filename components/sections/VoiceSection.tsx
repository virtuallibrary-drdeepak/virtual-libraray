const reviews = [
  { image: '/img/review-1.jpg', alt: 'Student Review 1' },
  { image: '/img/review-2.jpg', alt: 'Student Review 2' },
  { image: '/img/review-3.jpg', alt: 'Student Review 3' },
]

export default function VoiceSection() {
  return (
    <section
      className="py-20 bg-gradient-to-b from-[#fff7f3] via-[#fffdfb] to-[#ffffff]"
      id="voice"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-14">
          Voice Behind The Success
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {reviews.map((review, index) => (
            <div key={index} className="space-y-6">
              <div className="rounded-xl overflow-hidden shadow-md border border-gray-100">
                <img src={review.image} alt={review.alt} className="w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

