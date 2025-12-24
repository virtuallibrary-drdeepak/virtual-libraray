import Layout from '@/components/Layout'

export default function TermsAndConditionsPage() {
  return (
    <Layout
      title="Terms & Conditions - Virtual Library"
      description="Terms & Conditions for Virtual Library - Read our terms of service and user agreement."
    >
      <div className="bg-gradient-to-b from-[#f7f7fb] to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-slate-600 text-lg">
              Last updated: December 24, 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By registering, accessing, or using Virtual Library's services, you agree to
                be bound by these Terms & Conditions. If you do not agree with any part of
                these terms, you must not use our services. These terms constitute a legally
                binding agreement between you and Virtual Library.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Service Description
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Virtual Library provides the following services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>24/7 Virtual Study Space:</strong> Access to dedicated Google Meet
                    rooms for focused studying
                  </li>
                  <li>
                    <strong>Exam-Specific Groups:</strong> WhatsApp and Telegram communities
                    for NEET-PG, UPSC, Banking, and other Indian exams
                  </li>
                  <li>
                    <strong>Mental Health Sessions:</strong> Expert-led sessions for stress
                    management, motivation, and well-being
                  </li>
                  <li>
                    <strong>Mentorship:</strong> Guidance from experienced professionals and
                    successful exam candidates
                  </li>
                  <li>
                    <strong>Forest Groups:</strong> Accountability groups to maintain
                    consistency and focus
                  </li>
                  <li>
                    <strong>Study Resources:</strong> Shared materials, notes, and tips
                    provided by community members
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  Note: Services may be updated, modified, or expanded without prior notice to
                  improve user experience.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Registration & Account
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>To use our services, you must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, complete, and current registration information</li>
                  <li>Complete the one-time payment for your chosen exam category</li>
                  <li>
                    Maintain the confidentiality of your account and not share access with
                    others
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your account or security
                    breach
                  </li>
                </ul>
                <p className="mt-4 font-semibold text-gray-900">
                  You are responsible for all activities that occur under your account.
                  Sharing your access with others is strictly prohibited and may result in
                  account termination without refund.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Payment & Access Period
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-[#f7f7fb] rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">One-Time Payment</h3>
                  <p>
                    Virtual Library operates on a one-time payment system. Once you complete
                    the payment, you will receive access to all our services and resources.
                  </p>
                </div>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All payments are processed through secure payment gateways</li>
                  <li>
                    Payment confirms your agreement to these Terms & Conditions and our Refund
                    Policy
                  </li>
                  <li>No recurring charges or hidden fees</li>
                  <li>
                    Access duration and validity will be communicated at the time of
                    registration
                  </li>
                  <li>Extensions or renewals (if offered) will be communicated separately</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Code of Conduct
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>All users must adhere to the following rules:</p>

                <div className="bg-[#f7f7fb] rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Respectful Behavior</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Treat all members with respect and courtesy</li>
                    <li>No harassment, bullying, hate speech, or discriminatory language</li>
                    <li>No personal attacks or offensive content</li>
                  </ul>
                </div>

                <div className="bg-[#f7f7fb] rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Prohibited Content & Activities
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>No spam, promotional content, or external links without permission</li>
                    <li>
                      No sharing of pirated content, copyrighted materials, or illegal
                      resources
                    </li>
                    <li>
                      No religious, political, or controversial discussions unrelated to
                      studying
                    </li>
                    <li>No sharing of offensive images, videos, or inappropriate content</li>
                    <li>No voice notes or calls in groups without prior permission</li>
                  </ul>
                </div>

                <div className="bg-[#f7f7fb] rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Study Environment</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Maintain a focused and productive environment in Google Meet sessions
                    </li>
                    <li>Keep cameras on during study sessions (if required)</li>
                    <li>Mute microphones to avoid disruptions</li>
                    <li>Use chat features responsibly and only for study-related queries</li>
                  </ul>
                </div>

                <p className="font-semibold text-gray-900 mt-4">
                  Violation of these rules may result in warnings, temporary suspension, or
                  permanent removal from the platform without refund.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                User Responsibilities
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>As a user, you are responsible for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ensuring you have a stable internet connection and compatible device</li>
                  <li>Regularly checking group messages and announcements</li>
                  <li>
                    Attending mental health sessions, mentorship calls, and study sessions (as
                    desired)
                  </li>
                  <li>
                    Reporting any technical issues, bugs, or inappropriate behavior to
                    administrators
                  </li>
                  <li>Keeping your contact information up to date</li>
                  <li>
                    Not recording, screenshotting, or sharing content from sessions without
                    permission
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Intellectual Property
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  All content provided by Virtual Library, including but not limited to text,
                  graphics, logos, videos, session recordings, and study materials, is the
                  property of Virtual Library or its licensors and is protected by copyright
                  and intellectual property laws.
                </p>
                <p className="font-semibold text-gray-900 mt-3">You may NOT:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Copy, reproduce, distribute, or sell any content without written permission
                  </li>
                  <li>Record or screenshot video sessions without prior authorization</li>
                  <li>
                    Use Virtual Library's name, logo, or branding for personal or commercial
                    purposes
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Disclaimers & Limitations
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <div className="bg-[#fff3cd] border-l-4 border-[#ffc107] rounded-r-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Guarantee of Results
                  </h3>
                  <p>
                    Virtual Library provides study resources and a supportive environment but
                    does <strong>NOT</strong> guarantee exam success, rank improvement, or
                    specific outcomes. Your performance depends on your effort, dedication, and
                    preparation.
                  </p>
                </div>

                <div className="bg-[#f7f7fb] rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Availability</h3>
                  <p>
                    While we strive for 24/7 availability, we do not guarantee uninterrupted
                    access. Services may be temporarily unavailable due to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li>Maintenance or technical upgrades</li>
                    <li>Third-party platform issues (Google Meet, WhatsApp, Telegram)</li>
                    <li>Internet outages or server issues</li>
                  </ul>
                  <p className="mt-3">
                    We will notify users of planned maintenance whenever possible.
                  </p>
                </div>

                <div className="bg-[#f7f7fb] rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Third-Party Content</h3>
                  <p>
                    Study materials, notes, and resources shared by community members are not
                    verified by Virtual Library. We are not responsible for the accuracy,
                    legality, or quality of user-generated content.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, Virtual Library, its founders, team
                members, and affiliates shall not be liable for any direct, indirect,
                incidental, special, consequential, or punitive damages arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700 mt-3">
                <li>Use or inability to use our services</li>
                <li>Exam failure or unsatisfactory results</li>
                <li>Loss of data or study materials</li>
                <li>Unauthorized access to your account</li>
                <li>Technical errors or service interruptions</li>
                <li>Content shared by other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Termination
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>We reserve the right to terminate or suspend your access immediately if:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You violate these Terms & Conditions or Code of Conduct</li>
                  <li>You engage in fraudulent or illegal activity</li>
                  <li>You share your account access with others</li>
                  <li>You harm the community or other users</li>
                </ul>
                <p className="font-semibold text-gray-900 mt-4">
                  Termination for violations will result in no refund.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Privacy & Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of Virtual Library is also governed by our{' '}
                <a
                  href="/privacy-policy"
                  className="text-[#a78bfa] hover:text-[#8b5cf6] font-semibold"
                >
                  Privacy Policy
                </a>
                . By using our services, you consent to the collection, use, and storage of
                your personal information as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Modifications to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to update or modify these Terms & Conditions at any time
                without prior notice. Changes will be effective immediately upon posting on
                our website. Your continued use of our services after such modifications
                constitutes acceptance of the updated terms. We recommend reviewing this page
                periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Governing Law & Dispute Resolution
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  These Terms & Conditions are governed by the laws of India. Any disputes
                  arising from these terms or your use of Virtual Library shall be subject to
                  the exclusive jurisdiction of the courts in [Your City/State, India].
                </p>
                <p className="mt-3">
                  Before initiating legal proceedings, both parties agree to attempt
                  resolution through good-faith negotiation and mediation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Severability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms & Conditions is found to be invalid or
                unenforceable, the remaining provisions shall continue in full force and
                effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Entire Agreement
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms & Conditions, together with our Privacy Policy and Refund Policy,
                constitute the entire agreement between you and Virtual Library regarding
                your use of our services.
              </p>
            </section>

            <section className="bg-[#f7f7fb] rounded-xl p-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about these Terms & Conditions, please
                contact us:
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

            <section className="bg-[#e3f2fd] border-l-4 border-[#2196f3] rounded-r-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thank You for Joining Virtual Library!
              </h3>
              <p className="text-gray-800 leading-relaxed">
                We're excited to have you as part of our community. By following these terms,
                you help create a positive, focused, and supportive environment for everyone.
                Let's study together and achieve our goals! 🎯
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}

