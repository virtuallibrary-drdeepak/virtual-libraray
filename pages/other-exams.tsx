import Layout from '@/components/Layout'
import HeroSection from '@/components/sections/HeroSection'
import WhatYouGetSection from '@/components/sections/WhatYouGetSection'
import MeetSection from '@/components/sections/MeetSection'
import CommunitySection from '@/components/sections/CommunitySection'
import WhyJoinSection from '@/components/sections/WhyJoinSection'
import VoiceSection from '@/components/sections/VoiceSection'
import FAQSection from '@/components/sections/FAQSection'
import PaymentForm from '@/components/PaymentForm'
import OtherExamsCarousel from '@/components/OtherExamsCarousel'
import { examFeatures } from '@/data/features'
import { otherExamsFaqs } from '@/data/faqs'

export default function OtherExamsPage() {
  return (
    <Layout
      title="Other Exams - Virtual Library"
      description="India's First Virtual Study Space for Other Exams"
    >
      <HeroSection
        title="India's First Virtual Study Space for"
        subtitle="Other Exams"
        description="24/7 Virtual Library With Expert-Led Mental Health & Mentorship Sessions And Forest Groups To Keep You Consistent While Studying From Your Home."
        showForm
        currentPage="other-exams"
      >
        <PaymentForm examType="other-exams" />
      </HeroSection>

      <WhatYouGetSection
        title="What's Included in Your Membership."
        features={examFeatures}
      />

      <MeetSection />

      <CommunitySection />

      <WhyJoinSection />

      <VoiceSection />

      {/* Courses Section */}
      <section className="py-20 bg-white text-center" id="Courses">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl text-gray-900">
            This virtual study space is designed
            <br />
            for all types of exams.
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            We Have Dedicated, Exam-Specific WhatsApp Groups For Discussions And Study
            Material.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              'UPSC',
              'RAILWAY',
              'BANKING SECTOR',
              'STATE PSC',
              'Any Indian Exam',
              'NEET-UG',
              'IIT JEE',
              'NURSING',
            ].map((exam) => (
              <button
                key={exam}
                className="px-5 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200"
              >
                {exam}
              </button>
            ))}
          </div>

          <div className="mt-12">
            <OtherExamsCarousel />
          </div>
        </div>
      </section>

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
              src="/img/other-exams.jpg"
              alt="Virtual Library WhatsApp Communities"
              className="w-full object-cover h-auto"
            />
          </div>
        </div>
      </section>

      <FAQSection faqs={otherExamsFaqs} />

      {/* Mobile Payment Bar */}
      <a
        href="#paymentForm"
        className="fixed bottom-0 left-0 w-full bg-black text-white py-4 px-5 flex items-center justify-between md:hidden z-50 rounded-t-2xl shadow-lg"
      >
        <span className="text-lg font-semibold">Join Virtual Library</span>
        <span className="text-2xl">→</span>
      </a>
    </Layout>
  )
}
