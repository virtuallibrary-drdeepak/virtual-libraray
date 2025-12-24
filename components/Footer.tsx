import { useState } from 'react'

export default function Footer() {
  const [showAboutModal, setShowAboutModal] = useState(false)

  return (
    <>
      <footer className="bg-[#f9f9fb] border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img
              src="https://virtual-library-web.netlify.app/img/logo.svg"
              className="h-10"
              alt="Virtual Library Logo"
            />
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-5 mb-8">
            <a
              href="https://www.instagram.com/dr.deepak_aanjna/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"
                className="w-4 h-4"
                alt="Instagram"
              />
            </a>

            <a
              href="https://www.youtube.com/@Virtuallibrary.neetpg26"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
            >
              <img
                src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg"
                className="w-4 h-4"
                alt="YouTube"
              />
            </a>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-800 font-medium mb-8">
            <a href="#whatyouget" className="hover:text-indigo-600">
              What You Get
            </a>
            <a href="#meet" className="hover:text-indigo-600">
              24/7 Meet
            </a>
            <a href="#Community" className="hover:text-indigo-600">
              Community &amp; Safety
            </a>
            <a href="#whyjoin" className="hover:text-indigo-600">
              Why Join This
            </a>
            <a href="#Courses" className="hover:text-indigo-600">
              Courses
            </a>
            <a href="#testimonials" className="hover:text-indigo-600">
              Testimonials
            </a>
          </div>

          <hr className="w-full border-slate-200 mb-6" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full text-sm text-slate-500">
            <p>© 2025 Virtual Library. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-3 md:mt-0">
              <button
                onClick={() => setShowAboutModal(true)}
                className="hover:text-indigo-600"
              >
                About Me
              </button>
              <a href="/contact" className="hover:text-indigo-600">
                Contact Us
              </a>
              <a href="/privacy-policy" className="hover:text-indigo-600">
                Privacy Policy
              </a>
              <a href="/refund-policy" className="hover:text-indigo-600">
                Refund Policy
              </a>
              <a href="/terms-and-conditions" className="hover:text-indigo-600">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAboutModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-xl relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>

            <p className="text-xs font-semibold text-gray-500 tracking-wide mb-4">
              YOU&apos;LL LEARN FROM
            </p>

            <div className="flex items-center gap-4">
              <img
                src="/img/Dr.Deepak_Aanjna.jpeg"
                className="w-20 h-20 rounded-xl object-cover border"
                alt="Dr Deepak Aanjna"
              />

              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Dr Deepak Aanjna
                </h2>
                <p className="text-sm text-gray-600">Why I Started This?</p>

                <a
                  href="https://www.instagram.com/dr.deepak_aanjna/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2"
                >
                  <img src="/img/instagram.png" className="w-6 h-6" alt="Instagram" />
                </a>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-gray-700 leading-relaxed text-sm md:text-base">
              <p>
                I am Dr. Deepak Aanjna, currently working as a Medical Officer. I
                started this initiative to create a supportive virtual space for
                students preparing for exams from home.
              </p>

              <p>
                Studying alone can be challenging—staying consistent, focused, and
                productive often feels impossible without guidance and
                accountability. I wanted to build a platform where students could
                study together, track their progress, and stay motivated.
              </p>

              <p>
                Beyond academics, this platform also prioritizes mental well-being,
                ensuring that students receive the support they need to remain calm,
                confident, and resilient throughout their preparation journey.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

