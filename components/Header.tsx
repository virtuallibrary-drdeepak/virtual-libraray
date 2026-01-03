import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();

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
          <a href="/rankings" className="hover:text-indigo-600 font-semibold">
            🏆 Daily Rankings
          </a>
          <a href="/#whyjoin" className="hover:text-indigo-600">
            Why Join This
          </a>
          <a href="/#testimonials" className="hover:text-indigo-600">
            Testimonials
          </a>

          <a href="/about" className="hover:text-indigo-600">
            About
          </a>
          <a href="/contact" className="hover:text-indigo-600">
            Contact
          </a>

          {/* User Authentication */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 ml-2">
              <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
                <div className={`w-8 h-8 rounded-full ${
                  user?.role === 'admin' 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                    : 'bg-gradient-to-br from-purple-500 to-purple-700'
                } flex items-center justify-center text-white font-semibold text-sm`}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    {user?.name}
                  </span>
                  {user?.role === 'admin' ? (
                    <span className="text-xs text-indigo-600 font-medium">🛡️ Admin</span>
                  ) : user?.isPremium ? (
                    <span className="text-xs text-purple-600 font-medium">⭐ Premium</span>
                  ) : null}
                </div>
              </a>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition shadow-md hover:shadow-lg"
            >
              Login
            </button>
          )}
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
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"}
            ></path>
          </svg>
        </button>
      </div>

      {/* mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {/* Admin Link - mobile */}
            {isAuthenticated && user?.role === 'admin' && (
              <a href="/admin/rankings" className="block py-2 font-semibold text-indigo-600">
                🛡️ Admin Dashboard
              </a>
            )}
            
            <a href="/#whatyouget" className="block py-2">
              What You Get
            </a>
            <a href="/#meet" className="block py-2">
              24/7 Meet
            </a>
            <a href="/#Community" className="block py-2">
              Community &amp; Safety
            </a>
            <a href="/#whyjoin" className="block py-2">
              Why Join This
            </a>
            <a href="/#Courses" className="block py-2">
              Courses
            </a>
            <a href="/#testimonials" className="block py-2">
              Testimonials
            </a>
            <a href="/rankings" className="block py-2 font-semibold">
              🏆 Rankings
            </a>
            <a href="/about" className="block py-2">
              About
            </a>
            <a href="/contact" className="block py-2">
              Contact
            </a>

            {/* Mobile Login/User Info */}
            <div className="pt-4 border-t border-slate-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <a href="/dashboard" className="flex items-center gap-2 py-2 hover:opacity-80 transition">
                    <div className={`w-10 h-10 rounded-full ${
                      user?.role === 'admin'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-purple-500 to-purple-700'
                    } flex items-center justify-center text-white font-semibold`}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{user?.name}</span>
                      {user?.role === 'admin' ? (
                        <span className="text-xs text-indigo-600 font-medium">🛡️ Admin</span>
                      ) : user?.isPremium ? (
                        <span className="text-xs text-purple-600 font-medium">⭐ Premium</span>
                      ) : null}
                    </div>
                  </a>
                  <button
                    onClick={logout}
                    className="w-full text-left py-2 text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
