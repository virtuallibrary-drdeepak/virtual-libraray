import Layout from '@/components/Layout'

export default function RefundPolicyPage() {
  return (
    <Layout
      title="Refund Policy - Virtual Library"
      description="Refund Policy for Virtual Library - Learn about our refund terms and conditions."
    >
      <div className="bg-gradient-to-b from-[#f7f7fb] to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Refund Policy
            </h1>
            <p className="text-slate-600 text-lg">
              Last updated: December 24, 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <section className="bg-[#fff3cd] border-l-4 border-[#ffc107] rounded-r-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ⚠️ Important Notice
              </h3>
              <p className="text-gray-800 leading-relaxed text-lg">
                Virtual Library operates with a <strong>NO REFUND POLICY</strong>. All
                payments are final and non-refundable once processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Overview
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At Virtual Library, we are committed to providing exceptional value and
                high-quality services. However, please understand that all sales are final.
                We do not offer refunds, cancellations, or exchanges once payment has been
                completed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Why No Refunds?
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Once you join Virtual Library, you immediately gain access to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>24/7 virtual study rooms (Google Meet sessions)</li>
                  <li>Exam-specific WhatsApp and Telegram groups</li>
                  <li>Study materials, resources, and community support</li>
                  <li>Mental health sessions and mentorship programs</li>
                </ul>
                <p className="mt-4">
                  Since these services are delivered instantly and cannot be "returned," we
                  maintain a strict no-refund policy.
                </p>
              </div>
            </section>

            <section className="bg-[#e3f2fd] border-l-4 border-[#2196f3] rounded-r-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#2196f3] mr-3 rounded"></span>
                Please Review Before Payment
              </h2>
              <div className="space-y-4 text-gray-800 leading-relaxed">
                <p className="text-lg font-semibold">
                  We strongly encourage you to carefully review the following before making a
                  payment:
                </p>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">✓ Review Our Website</h3>
                    <p className="text-gray-700">
                      Explore all sections of our website to understand what services and
                      features are included in your membership.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      ✓ Check the Services Offered
                    </h3>
                    <p className="text-gray-700">
                      Ensure that the virtual study space, group access, and other features
                      meet your requirements and expectations.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      ✓ Read Terms & Conditions
                    </h3>
                    <p className="text-gray-700">
                      Thoroughly read our{' '}
                      <a
                        href="/terms-and-conditions"
                        className="text-[#a78bfa] hover:text-[#8b5cf6] font-semibold"
                      >
                        Terms & Conditions
                      </a>{' '}
                      to understand your rights, responsibilities, and code of conduct.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      ✓ Review Privacy Policy
                    </h3>
                    <p className="text-gray-700">
                      Understand how we collect, use, and protect your personal information by
                      reading our{' '}
                      <a
                        href="/privacy-policy"
                        className="text-[#a78bfa] hover:text-[#8b5cf6] font-semibold"
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">✓ Contact Us First</h3>
                    <p className="text-gray-700">
                      If you have any questions, doubts, or concerns, please contact us via
                      WhatsApp or email before making a payment. We're happy to help!
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  By proceeding with payment, you acknowledge that you have reviewed all
                  information and agree to our no-refund policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Exception: Duplicate Payments Only
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  The <strong>only exception</strong> to our no-refund policy is in the case
                  of accidental duplicate payments:
                </p>
                <div className="bg-[#f7f7fb] rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Duplicate Payment</h3>
                  <p>
                    If you accidentally made multiple payments for the same service
                    (e.g., charged twice due to a technical error), the duplicate amount will
                    be refunded within 7-10 business days upon verification.
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    <strong>Important:</strong> You must contact us immediately with your
                    transaction details and proof of duplicate payment.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                No Refunds For
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>We do <strong>NOT</strong> provide refunds for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Change of mind after payment</li>
                  <li>Personal circumstances or inability to use the service</li>
                  <li>Failure to attend Google Meet sessions or participate in groups</li>
                  <li>Voluntarily leaving WhatsApp or Telegram groups</li>
                  <li>
                    Removal from groups due to violation of Terms & Conditions or Code of
                    Conduct
                  </li>
                  <li>Exam performance or results not meeting your expectations</li>
                  <li>Internet connectivity or device compatibility issues on your end</li>
                  <li>Not utilizing the services or resources provided</li>
                  <li>Deciding to use alternative study methods or platforms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Disputes & Chargebacks
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  Initiating a chargeback or payment dispute without contacting us first is
                  considered a violation of our terms. If you file a chargeback:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your access to all services will be immediately suspended</li>
                  <li>You will be removed from all WhatsApp and Telegram groups</li>
                  <li>You will be permanently banned from rejoining Virtual Library</li>
                  <li>We may take appropriate legal action if necessary</li>
                </ul>
                <p className="mt-4 font-semibold text-gray-900">
                  If you have any payment concerns or issues, please contact us directly first.
                  We're here to help resolve any genuine problems.
                </p>
              </div>
            </section>

            <section className="bg-[#f7f7fb] rounded-xl p-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:virtuallibrary.help@gmail.com"
                    className="text-[#a78bfa] hover:text-[#8b5cf6]"
                  >
                    virtuallibrary.help@gmail.com
                  </a>
                </p>
                <p>
                  <strong>WhatsApp:</strong>{' '}
                  <a
                    href="https://wa.me/917974425107"
                    className="text-[#a78bfa] hover:text-[#8b5cf6]"
                  >
                    +91 79744 25107
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Amendments to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or update this Refund Policy at any time
                without prior notice. Any changes will be effective immediately upon posting
                on our website. It is your responsibility to review this policy periodically.
                Your continued use of our services after changes are posted constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section className="bg-[#e8f5e9] border-l-4 border-[#4caf50] rounded-r-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                💚 Our Commitment to You
              </h3>
              <p className="text-gray-800 leading-relaxed">
                While we maintain a no-refund policy, we are fully committed to providing
                exceptional value and support. Our goal is to create a productive, focused,
                and supportive virtual study environment for all members. If you have any
                questions, concerns, or technical difficulties, please don't hesitate to reach
                out to us. We're here to ensure you have the best possible experience! 🎯
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}

