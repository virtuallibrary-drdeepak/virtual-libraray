export default function Footer() {
  return (
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
            <a href="/#whatyouget" className="hover:text-indigo-600">
              What You Get
            </a>
            <a href="/#meet" className="hover:text-indigo-600">
              24/7 Meet
            </a>
            <a href="/#Community" className="hover:text-indigo-600">
              Community &amp; Safety
            </a>
            <a href="/#whyjoin" className="hover:text-indigo-600">
              Why Join This
            </a>
            <a href="/#Courses" className="hover:text-indigo-600">
              Courses
            </a>
            <a href="/#testimonials" className="hover:text-indigo-600">
              Testimonials
            </a>
          </div>

          <hr className="w-full border-slate-200 mb-6" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full text-sm text-slate-500">
            <p>© 2025 Virtual Library. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-3 md:mt-0">
              <a href="/about" className="hover:text-indigo-600">
                About Me
              </a>
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
  )
}

