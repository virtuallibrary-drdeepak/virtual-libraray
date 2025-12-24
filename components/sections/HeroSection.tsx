import Link from 'next/link'

interface HeroSectionProps {
  title: string
  subtitle?: string
  description: string
  showForm?: boolean
  children?: React.ReactNode
  currentPage?: 'home' | 'neet-pg' | 'other-exams'
}

export default function HeroSection({
  title,
  subtitle,
  description,
  showForm = false,
  children,
  currentPage = 'home',
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#6b21a8] pt-[20px]"
      style={{
        backgroundImage: "url('/img/banner-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#6b21a8]/95 via-[#6b21a8]/90 to-[#6b21a8]/80"></div>

      <div className="relative z-10 max-w-7xl w-full mx-auto px-5 py-10 flex flex-col md:flex-row items-start justify-between gap-10 text-white">
        <div className="flex-1">
          <h1 className="text-4xl leading-tight md:text-8xl md:leading-[1.1] font-semibold pt-12">
            {title}
            {subtitle && (
              <>
                <br />
                <span className="text-[#d3b8ff]">{subtitle}</span>
              </>
            )}
          </h1>

          <p className="mt-3 text-slate-200 text-base md:text-lg max-w-xl">
            {description}
          </p>

          {/* Stats */}
          <div className="mt-8 md:mt-10">
            <p className="uppercase text-xs tracking-wide text-slate-300 mb-2">
              Our Numbers Tell More About Us
            </p>

            <div className="grid grid-cols-3 gap-5 max-w-xs md:max-w-md">
              <div>
                <div className="text-3xl md:text-5xl font-semibold">2.5K+</div>
                <div className="text-xs md:text-sm text-slate-300 mt-1">Members</div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-semibold">70%</div>
                <div className="text-xs md:text-sm text-slate-300 mt-1">
                  Female Members
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-semibold">2+</div>
                <div className="text-xs md:text-sm text-slate-300 mt-1">Years</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 md:mt-10 flex gap-3 flex-wrap">
            {/* Show NEET-PG button on home and other-exams pages */}
            {currentPage !== 'neet-pg' && (
              <Link
                href="/neet-pg"
                className="px-5 py-2.5 md:px-6 md:py-3 bg-white text-purple-800 border border-white rounded-full text-sm md:text-base hover:bg-gray-50 transition"
              >
                NEET-PG →
              </Link>
            )}

            {/* Show Other Exams button on home and neet-pg pages */}
            {currentPage !== 'other-exams' && (
              <Link
                href="/other-exams"
                className="px-5 py-2.5 md:px-6 md:py-3 bg-white text-purple-800 border border-white rounded-full text-sm md:text-base hover:bg-gray-50 transition"
              >
                Other Exams →
              </Link>
            )}
          </div>
        </div>

        {/* Optional children (like payment form) */}
        {showForm && children}
      </div>
    </section>
  )
}

