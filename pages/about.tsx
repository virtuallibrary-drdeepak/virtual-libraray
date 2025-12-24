import Layout from '@/components/Layout'

export default function AboutPage() {
  return (
    <Layout
      title="About Dr. Deepak Aanjna - Virtual Library"
      description="Learn about Dr. Deepak Aanjna and why Virtual Library was created to help students succeed."
    >
      <div className="bg-gradient-to-b from-[#f7f7fb] to-white pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header Section */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#a78bfa] tracking-wide mb-4 uppercase">
              You'll Learn From
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dr Deepak Aanjna
            </h1>
            <p className="text-slate-600 text-lg">
              Founder & Creator of Virtual Library
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
            {/* Profile Section */}
            <div className="bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] p-8 md:p-12 text-center">
              <div className="inline-block mb-6">
                <img
                  src="/img/Dr.Deepak_Aanjna.jpeg"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-xl"
                  alt="Dr Deepak Aanjna"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Dr Deepak Aanjna
              </h2>
              <p className="text-purple-100 text-lg mb-6">Medical Officer</p>

              {/* Social Links */}
              <div className="flex justify-center gap-4">
                <a
                  href="https://www.instagram.com/dr.deepak_aanjna/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>

                <a
                  href="https://www.youtube.com/@Virtuallibrary.neetpg26"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </a>
              </div>
            </div>

            {/* Story Section */}
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Why I Started This?
              </h3>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  I am Dr. Deepak Aanjna, currently working as a Medical Officer. I
                  started this initiative to create a supportive virtual space for students
                  preparing for exams from home.
                </p>

                <p>
                  Studying alone can be challenging—staying consistent, focused, and
                  productive often feels impossible without guidance and accountability. I
                  wanted to build a platform where students could study together, track
                  their progress, and stay motivated.
                </p>

                <p>
                  Beyond academics, this platform also prioritizes mental well-being,
                  ensuring that students receive the support they need to remain calm,
                  confident, and resilient throughout their preparation journey.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#a78bfa] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Community</h4>
              <p className="text-gray-600 text-sm">
                Building a supportive community of students studying together
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#a78bfa] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Guidance</h4>
              <p className="text-gray-600 text-sm">
                Expert mentorship and mental health support throughout your journey
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#a78bfa] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Motivation</h4>
              <p className="text-gray-600 text-sm">
                Stay consistent and motivated with accountability groups
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6] rounded-3xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Join Virtual Library Today
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Be part of a community that supports your academic and mental well-being.
              Let's achieve your goals together!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/neet-pg"
                className="inline-block bg-white text-[#a78bfa] px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Join for NEET-PG
              </a>
              <a
                href="/other-exams"
                className="inline-block bg-white text-[#a78bfa] px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Join for Other Exams
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

