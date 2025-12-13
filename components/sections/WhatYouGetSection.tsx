interface FeatureCard {
  emoji: string
  title: string
  description: string
  bgColor: string
}

interface WhatYouGetSectionProps {
  badge?: string
  title: string
  subtitle?: string
  features: FeatureCard[]
}

export default function WhatYouGetSection({
  badge = "It's not just a Virtual Library",
  title,
  subtitle,
  features,
}: WhatYouGetSectionProps) {
  return (
    <section className="py-20 bg-white text-center" id="whatyouget">
      <div className="max-w-6xl mx-auto px-6">
        <div className="inline-block px-6 py-2 rounded-full border border-purple-300 text-purple-600 font-medium text-sm mb-8">
          {badge}
        </div>

        <h2 className="text-4xl md:text-5xl text-gray-900 font-medium leading-tight mb-12">
          {title}
          {subtitle && (
            <>
              <br />
              <span className="font-normal text-gray-700">{subtitle}</span>
            </>
          )}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl ${feature.bgColor} border border-slate-100 shadow-sm hover:shadow-md transition`}
            >
              {feature.emoji && <div className="text-3xl mb-3">{feature.emoji}</div>}
              <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
              <p className="mt-3 text-sm text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

