export default function CommunitySection() {
  return (
    <section
      className="relative py-20 bg-white text-center overflow-visible"
      id="Community"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="inline-flex items-center justify-center px-5 py-2 border border-purple-300/70 rounded-full text-sm text-purple-600 font-medium mb-8">
          Community & Safety
        </div>

        <h2 className="text-4xl md:text-5xl text-gray-900">
          A Safe and Supportive Virtual Library
        </h2>

        <p className="mt-5 text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Our Virtual Library Provides A Secure And Welcoming Space For Everyone. With
          64% Of Our Members Being Female, We Emphasize Privacy And Ensure A Safe
          Environment For All Users.
        </p>

        <div className="relative mt-16 flex flex-col items-center justify-center overflow-visible">
          {/* Pie Chart */}
          <div className="relative w-[320px] h-[320px] overflow-visible">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-lg overflow-visible"
            >
              <path
                d="M100,100 L100,0 A100,100 0 1,1 18,145 Z"
                fill="#7C3AED"
              ></path>
              <path d="M100,100 L18,145 A100,100 0 0,1 100,0 Z" fill="#A78BFA"></path>
            </svg>

            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black/10 pointer-events-none"></div>

            <div className="absolute top-[45%] left-[65%] text-white font-semibold text-lg">
              64%
            </div>
            <div className="absolute top-[35%] left-[25%] text-white font-semibold text-lg">
              36%
            </div>
          </div>

          <div className="absolute top-[30%] left-[18%] flex flex-col items-end text-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <span>Male</span>
              <div className="w-40 h-px bg-gray-500"></div>
            </div>
          </div>

          <div className="absolute bottom-[38%] right-[18%] flex flex-col items-start text-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-40 h-px bg-gray-500"></div>
              <span>Female</span>
            </div>
          </div>

          <p className="mt-8 text-gray-900 font-medium text-sm md:text-base">
            Gender: 1028 responses
          </p>
        </div>
      </div>
    </section>
  )
}

