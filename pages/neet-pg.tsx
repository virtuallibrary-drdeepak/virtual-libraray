import { useState } from 'react'
import Layout from '@/components/Layout'
import HeroSection from '@/components/sections/HeroSection'
import WhatYouGetSection from '@/components/sections/WhatYouGetSection'
import MeetSection from '@/components/sections/MeetSection'
import CommunitySection from '@/components/sections/CommunitySection'
import WhyJoinSection from '@/components/sections/WhyJoinSection'
import VoiceSection from '@/components/sections/VoiceSection'
import FAQSection from '@/components/sections/FAQSection'
import PaymentForm from '@/components/PaymentForm'
import { RefundModal, PrivacyModal } from '@/components/modals/PolicyModals'
import { examFeatures } from '@/data/features'
import { neetPGFaqs } from '@/data/faqs'

export default function NEETPGPage() {
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  return (
    <Layout
      title="Medical Exam Access - Virtual Library"
      description="Virtual Study Space for NEET-PG and Other Medical Exams"
    >
      <HeroSection
        title="Virtual Study Space for"
        subtitle="NEET-PG and Other Medical Exams"
        description="24/7 Virtual Library With Expert-Led Mental Health & Mentorship Sessions And Forest Groups To Keep You Consistent While Studying From Your Home."
        showForm
      >
        <PaymentForm
          onPrivacyClick={() => setShowPrivacyModal(true)}
          onRefundClick={() => setShowRefundModal(true)}
        />
      </HeroSection>

      <WhatYouGetSection
        title="What You Get in One-Time Payment"
        subtitle="Access valid till NEET-PG 2026."
        features={examFeatures}
      />

      <MeetSection />

      <CommunitySection />

      <WhyJoinSection />

      <VoiceSection />

      {/* Explore Communities */}
      <section
        className="py-20 pb-0 bg-[#0e0e0e] text-center text-white"
        id="communities"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <a
              href="#"
              className="inline-block px-6 py-2 border border-gray-400 text-sm font-medium rounded-full hover:bg-gray-800 transition"
            >
              Explore Communities
            </a>
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold leading-snug mb-14 text-white">
            You&apos;ll get access to all these groups
            <br className="hidden md:block" /> after joining.
          </h2>

          <div className="w-full overflow-hidden rounded-2xl border border-gray-800 shadow-lg">
            <img
              src="/img/Explore-Communities.jpg"
              alt="Virtual Library WhatsApp Communities"
              className="w-full object-cover h-auto"
            />
          </div>
        </div>
      </section>

      {/* Video Gallery */}
      <section className="py-20 bg-white" id="videos">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#f7f7fb] rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
                Video Gallery
              </h2>

              <a
                href="https://www.youtube.com/@Virtuallibrary.neetpg26/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 md:mt-0 inline-block bg-[#a78bfa] hover:bg-[#8b5cf6] text-white text-sm font-medium px-8 py-3 rounded-xl transition"
              >
                View all videos
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  id: 'xTXBDBIIkoM',
                  title:
                    'How Dr. Alka Secured Rank 14 in NEET-PG 2025| Full Strategy, Study Plan & Revision Techniques',
                },
                {
                  id: 'VLnU6O--OWA',
                  title:
                    'Radiology as a Branch | NEET-PG 2025 Counselling | Everything You Need to Know',
                },
                {
                  id: 'PDCdmHrYgT0',
                  title:
                    'How Dr. Sumit Yeole Secured AIR 139 in NEET-PG 2025 | Full Strategy | Must Watch',
                },
                {
                  id: '6-tLEdNfgX8',
                  title: "Dr Vedant's NEETPG Strategy – Rank 1416 NEETPG 2025",
                },
              ].map((video) => (
                <div key={video.id}>
                  <div className="relative rounded-xl overflow-hidden shadow-md aspect-video">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-800 leading-snug">
                    {video.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQSection faqs={neetPGFaqs} />

      {/* Mobile Payment Bar */}
      <a
        href="#paymentForm"
        className="fixed bottom-0 left-0 w-full bg-black text-white py-4 px-5 flex items-center justify-between md:hidden z-50 rounded-t-2xl shadow-lg"
      >
        <span className="text-lg font-semibold">Make Payment</span>
        <span className="text-2xl">→</span>
      </a>

      {/* Modals */}
      <RefundModal isOpen={showRefundModal} onClose={() => setShowRefundModal(false)} />
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </Layout>
  )
}
