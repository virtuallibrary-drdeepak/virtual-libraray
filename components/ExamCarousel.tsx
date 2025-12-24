import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface ExamSlide {
  title: string
  description: string
  bgColor: string
  link: string
}

const examSlides: ExamSlide[] = [
  {
    title: 'NEET-UG/IIT JEE',
    description:
      'Prepare For NEET UG, INI-CET & FMGE With Thousands Of Aspirants Studying From Home Just Like You. 💪',
    bgColor: 'bg-[#ffece5]',
    link: '/other-exams',
  },
  {
    title: 'UPSC',
    description:
      'Prepare For UPSC With Others Through WhatsApp Groups For Discussions And Study Material.',
    bgColor: 'bg-[#f1edff]',
    link: '/other-exams',
  },
  {
    title: 'RAILWAY',
    description:
      'Prepare For Railway Exams With Group Discussions, Study Material, And Daily Motivation.',
    bgColor: 'bg-[#f2faff]',
    link: '/other-exams',
  },
  {
    title: 'BANKING',
    description:
      'Focused Telegram Groups, Practice Material, and Weekly Live Sessions To Help You Crack Banking Exams.',
    bgColor: 'bg-[#fff5e5]',
    link: '/other-exams',
  },
  {
    title: 'STATE PSC',
    description:
      'Join PSC-Specific Groups To Stay Updated With Notifications, Notes, and Daily Tests.',
    bgColor: 'bg-[#e9f9ef]',
    link: '/other-exams',
  },
  {
    title: 'DEFENCE',
    description:
      'Study With NDA, CDS, and AFCAT Aspirants — Stay Consistent With Peer Motivation.',
    bgColor: 'bg-[#f8f0ff]',
    link: '/other-exams',
  },
]

export default function ExamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slidesPerView, setSlidesPerView] = useState(1)
  const [isMounted, setIsMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.offsetWidth / slidesPerView
      scrollRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth',
      })
    }
    setCurrentIndex(index)
  }

  const next = () => {
    const maxIndex = examSlides.length - slidesPerView
    if (currentIndex < maxIndex) {
      scrollTo(currentIndex + 1)
    }
  }

  const prev = () => {
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1)
    }
  }

  const getSlidesPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3
      if (window.innerWidth >= 640) return 2
    }
    return 1
  }

  useEffect(() => {
    setIsMounted(true)
    setSlidesPerView(getSlidesPerView())

    const handleResize = () => {
      setSlidesPerView(getSlidesPerView())
      scrollTo(currentIndex)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentIndex])

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-6">
          {examSlides.map((slide, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
            >
              <div
                className={`p-8 ${slide.bgColor} rounded-3xl border border-slate-100 shadow-sm text-left h-full flex flex-col`}
              >
                <h3 className="text-3xl font-semibold text-gray-900">
                  {slide.title}
                </h3>
                <p className="mt-3 text-gray-700 leading-relaxed mb-6 flex-grow">
                  {slide.description}
                </p>
                <Link
                  href={slide.link}
                  className="inline-block px-5 py-2 border border-gray-800 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition"
                >
                  Join now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {isMounted && (
        <>
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="hidden sm:flex absolute left-[-60px] top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
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
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={next}
            disabled={currentIndex >= examSlides.length - slidesPerView}
            className="hidden sm:flex absolute right-[-60px] top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
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
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {isMounted && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(examSlides.length / slidesPerView) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? 'bg-purple-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}

