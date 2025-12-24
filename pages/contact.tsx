import Layout from '@/components/Layout'

export default function ContactPage() {
  return (
    <Layout
      title="Contact Us - Virtual Library"
      description="Get in touch with Virtual Library - We're here to help you with any questions or concerns."
    >
      <div className="bg-gradient-to-b from-[#f7f7fb] to-white pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Have questions about Virtual Library? We're here to help! Reach out to us
              through any of the channels below.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* WhatsApp Card */}
            <a
              href="https://wa.me/917974425107"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    WhatsApp
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Send us a message on WhatsApp for quick responses
                  </p>
                  <p className="text-[#a78bfa] font-semibold text-lg">
                    +91 79744 25107
                  </p>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:virtuallibrary.help@gmail.com"
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#a78bfa] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Send us a detailed email and we'll get back to you
                  </p>
                  <p className="text-[#a78bfa] font-semibold break-all">
                    virtuallibrary.help@gmail.com
                  </p>
                </div>
              </div>
            </a>
          </div>

          {/* Social Media & Quick Links */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Connect With Us
            </h2>

            {/* Social Media Icons */}
            <div className="flex justify-center gap-4 mb-8">
              <a
                href="https://www.instagram.com/dr.deepak_aanjna/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@Virtuallibrary.neetpg26"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            {/* Quick Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-[#a78bfa] font-semibold mb-1">Response Time</div>
                  <div className="text-gray-700">Within 24 hours</div>
                </div>
                <div>
                  <div className="text-[#a78bfa] font-semibold mb-1">
                    Available Hours
                  </div>
                  <div className="text-gray-700">24/7 Support</div>
                </div>
                <div>
                  <div className="text-[#a78bfa] font-semibold mb-1">Preferred</div>
                  <div className="text-gray-700">WhatsApp</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Notice */}
          <div className="mt-12 bg-gradient-to-br from-[#f7f7fb] to-[#ede9fe] rounded-2xl p-8 text-center border border-[#a78bfa]/20">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Before You Contact Us
            </h3>
            <p className="text-gray-700 mb-4">
              Looking for quick answers? Check out our FAQ section or explore our website
              for more information about Virtual Library services.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/#faq"
                className="inline-block px-6 py-2.5 bg-white text-gray-800 font-medium rounded-lg hover:shadow-md transition-shadow"
              >
                View FAQs
              </a>
              <a
                href="/privacy-policy"
                className="inline-block px-6 py-2.5 bg-white text-gray-800 font-medium rounded-lg hover:shadow-md transition-shadow"
              >
                Privacy Policy
              </a>
              <a
                href="/terms-and-conditions"
                className="inline-block px-6 py-2.5 bg-white text-gray-800 font-medium rounded-lg hover:shadow-md transition-shadow"
              >
                Terms & Conditions
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              We typically respond within a few hours during business days. For urgent
              matters, please use WhatsApp for faster response.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

