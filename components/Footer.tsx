import { useState } from 'react'

export default function Footer() {
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

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
            <div className="flex gap-6 mt-3 md:mt-0">
              <button
                onClick={() => setShowAboutModal(true)}
                className="hover:text-indigo-600"
              >
                About Me
              </button>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-indigo-600"
              >
                Privacy Policy
              </button>
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

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Privacy policy
            </h2>

            <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
              <div>
                <h3 className="font-semibold mb-1">Data Collection</h3>
                <p>
                  We collect basic details (name, email, phone number) only for
                  registration and communication purposes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Data Usage</h3>
                <p>
                  Your information will be used strictly to provide services,
                  updates, and reminders related to Virtual Library. We do not sell
                  or share your personal data with third parties.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Data Protection</h3>
                <p>
                  Groups are monitored to maintain a safe and respectful
                  environment. Sensitive information shared in groups is
                  community-based and voluntary.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Communication</h3>
                <p>
                  By registering, you agree to receive service-related messages via
                  WhatsApp, Telegram, or email.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Opt-Out</h3>
                <p>
                  You may leave groups or unsubscribe from communication at any time
                  by notifying us.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

