const testimonials = [
  {
    name: 'Riya S.',
    role: 'NEET Aspirant',
    image: '/img/girl.jpg',
    text: '"I never thought studying from home could be this productive. The 24/7 virtual library and mentorship sessions kept me consistent."',
  },
  {
    name: 'Rohit',
    role: 'UPSC Aspirant',
    image: '/img/girl.jpg',
    text: '"Joining this virtual study space was a game-changer. The study partner groups and daily Forest rankings kept me accountable."',
  },
  {
    name: 'Ananya R.',
    role: 'Banking Aspirant',
    image: '/img/a.jpg',
    text: '"Find Study Buddy helped me pair with someone studying the same syllabus — now I actually enjoy my preparation."',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-14 bg-[#fff7ef]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <h3 className="text-4xl md:text-5xl text-gray-900 text-center">
            What Our Students Say
          </h3>
          <p className="mt-2 text-slate-600">
            Real feedback from students who used our virtual study space.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-slate-100">
                  <img src={testimonial.image} alt={testimonial.name} />
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-xs text-slate-500">{testimonial.role}</div>
                </div>
              </div>
              <p className="mt-4 text-slate-700">{testimonial.text}</p>
              <div className="mt-4 text-yellow-400">★★★★★</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

