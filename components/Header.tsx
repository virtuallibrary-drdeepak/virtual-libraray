import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="w-full border-b border-slate-100 bg-white fixed top-0 left-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-semibold text-lg">
            <img
              src="https://virtual-library-web.netlify.app/img/logo.svg"
              className="h-12"
              alt="Virtual Library Logo"
            />
          </span>
        </Link>

        {/* Navigation moved to right */}
        <nav className="hidden md:flex items-center gap-6 text-sm ml-auto">
          <a href="#whatyouget" className="hover:text-indigo-600">
            What You Get
          </a>
          <a href="#meet" className="hover:text-indigo-600">
            24/7 Meet
          </a>
          <a href="#Community" className="hover:text-indigo-600">
            Community & Safety
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
        </nav>

        {/* mobile menu icon */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-slate-100"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 8h16M4 16h16'}
            ></path>
          </svg>
        </button>
      </div>

      {/* mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100">
          <div className="px-4 pt-3 pb-6 space-y-2">
            <a href="#whatyouget" className="block py-2">
              What You Get
            </a>
            <a href="#meet" className="block py-2">
              24/7 Meet
            </a>
            <a href="#Community" className="block py-2">
              Community &amp; Safety
            </a>
            <a href="#whyjoin" className="block py-2">
              Why Join This
            </a>
            <a href="#Courses" className="block py-2">
              Courses
            </a>
            <a href="#testimonials" className="block py-2">
              Testimonials
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

