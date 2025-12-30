import { useEffect } from 'react'
import Layout from '@/components/Layout'
import HeroSection from '@/components/sections/HeroSection'
import WhatYouGetSection from '@/components/sections/WhatYouGetSection'
import MeetSection from '@/components/sections/MeetSection'
import CommunitySection from '@/components/sections/CommunitySection'
import WhyJoinSection from '@/components/sections/WhyJoinSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import ExamCarousel from '@/components/ExamCarousel'
import UserDashboard from '@/components/UserDashboard'
import { useAuth } from '@/contexts/AuthContext'
import { homeFeatures } from '@/data/features'

export default function Home() {
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        const targetId = target.getAttribute('href')?.substring(1)
        const targetElement = document.getElementById(targetId || '')
        if (targetElement) {
          e.preventDefault()
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return (
    <Layout>
      {/* Show Dashboard for logged in users, Hero for visitors */}
      {isAuthenticated ? (
        <UserDashboard />
      ) : (
        <HeroSection
          title="India's First Virtual Study Space."
          description="24/7 Virtual Library With Expert-Led Mental Health Sessions And Forest Groups For Consistent Study."
        />
      )}

      <WhatYouGetSection
        title="What You Get in One-Time Payment"
        features={homeFeatures}
      />

      <MeetSection />

      <CommunitySection />

      <WhyJoinSection />

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
            {['UPSC', 'RAILWAY', 'BANKING SECTOR', 'STATE PSC', 'Any Indian Exam'].map(
              (exam) => (
                <button
                  key={exam}
                  className="px-5 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200"
                >
                  {exam}
                </button>
              )
            )}
          </div>

          <div className="mt-12">
            <ExamCarousel />
          </div>
        </div>
      </section>

      <TestimonialsSection />
    </Layout>
  )
}
