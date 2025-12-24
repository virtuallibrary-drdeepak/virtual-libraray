import Layout from '@/components/Layout'

export default function PrivacyPolicyPage() {
  return (
    <Layout
      title="Privacy Policy - Virtual Library"
      description="Privacy Policy for Virtual Library - Learn how we collect, use, and protect your personal information."
    >
      <div className="bg-gradient-to-b from-[#f7f7fb] to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
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
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At Virtual Library, we are committed to protecting your privacy and ensuring
                the security of your personal information. This Privacy Policy explains how
                we collect, use, disclose, and safeguard your data when you use our virtual
                study space platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Data Collection
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We collect basic details necessary for registration and service delivery,
                  including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Exam category (e.g., NEET-PG, UPSC, Banking, etc.)</li>
                  <li>Payment information (processed securely through our payment gateway)</li>
                </ul>
                <p>
                  We do not collect sensitive personal data such as medical records, financial
                  details beyond payment processing, or any unnecessary information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Data Usage
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Your information is used strictly for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Providing access to our virtual study space and related services</li>
                  <li>
                    Sending service-related updates, reminders, and important announcements
                  </li>
                  <li>Adding you to exam-specific WhatsApp and Telegram groups</li>
                  <li>Providing customer support and responding to your inquiries</li>
                  <li>Improving our services based on user feedback and behavior</li>
                  <li>Ensuring compliance with our Terms & Conditions</li>
                </ul>
                <p className="font-semibold text-gray-900">
                  We do not sell, rent, or share your personal data with third parties for
                  marketing purposes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Data Protection & Security
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We implement industry-standard security measures to protect your data from
                  unauthorized access, alteration, or disclosure:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Secure payment processing through trusted payment gateways</li>
                  <li>Encrypted data transmission</li>
                  <li>
                    Monitored WhatsApp and Telegram groups to maintain a safe and respectful
                    environment
                  </li>
                  <li>Limited access to personal data by authorized personnel only</li>
                </ul>
                <p>
                  Please note that information shared voluntarily in community groups is
                  visible to other group members. We encourage you to exercise caution and
                  avoid sharing sensitive personal information in public group settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Communication
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By registering with Virtual Library, you consent to receive service-related
                communications via:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                <li>WhatsApp messages and group invitations</li>
                <li>Telegram messages and group notifications</li>
                <li>Email updates and newsletters</li>
                <li>SMS notifications for important updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as your account is active or
                as needed to provide you services. After your access period expires or upon
                your request, we will delete or anonymize your personal data within a
                reasonable timeframe, unless required by law to retain it longer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Your Rights
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal data we hold about you</li>
                  <li>Request correction of inaccurate or incomplete information</li>
                  <li>Request deletion of your personal data (subject to legal obligations)</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Leave WhatsApp or Telegram groups at any time</li>
                  <li>Withdraw consent for data processing where applicable</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us at the email or phone
                  number provided on our website.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use third-party services such as payment gateways (Razorpay, PhonePe,
                etc.), Google Meet, WhatsApp, and Telegram to provide our services. These
                services have their own privacy policies, and we encourage you to review them.
                We are not responsible for the privacy practices of these third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Cookies & Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may use cookies and similar tracking technologies to enhance user
                experience, analyze site traffic, and understand user preferences. You can
                control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a minor or under the age of majority in your jurisdiction, please
                obtain parental or guardian consent before registering. We encourage parents
                and guardians to monitor their children's use of our services and ensure they
                understand our Terms & Conditions and Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our
                practices or legal requirements. We will notify you of significant changes via
                email or through prominent notices on our website. Your continued use of our
                services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="bg-[#f7f7fb] rounded-xl p-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-8 bg-[#a78bfa] mr-3 rounded"></span>
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy
                Policy or your personal data, please contact us:
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
          </div>
        </div>
      </div>
    </Layout>
  )
}

