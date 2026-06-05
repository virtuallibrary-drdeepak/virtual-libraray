const HERO_LIVE_ROOM_IMAGE = '/img/v2/hero_asset/hero_section.png'

type VirtualStudyHeroProps = {
  eyebrowText?: string
  primaryHref?: string
  googlePlayHref: string
  appStoreHref: string
}

const PROOF_CARDS = [
  {
    icon: 'users',
    title: '150+ Students Live',
    description: 'Studying together right now',
  },
  {
    icon: 'clock',
    title: '24/7 Study Rooms',
    description: 'Join anytime, day or night',
  },
]

const HERO_STATS = [
  { value: '24/7', label: 'Active Study Rooms' },
  { value: '3,000+', label: 'Active Members' },
  { value: '60% +', label: 'Female Members' },
  { value: '8 Hrs +', label: 'Study Time' },
]

export default function VirtualStudyHero({
  eyebrowText = "India's first Virtual Library Space",
  primaryHref = '#plans',
  googlePlayHref,
  appStoreHref,
}: VirtualStudyHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(145deg,#f6f2ff_0%,#f2f8ff_46%,#fff7fb_100%)]">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-4 pb-7 pt-6 text-center sm:gap-6 sm:px-6 sm:py-8 lg:min-h-[calc(100svh-4.5rem)] lg:flex-row lg:justify-between lg:gap-9 lg:py-5 lg:text-left xl:gap-12">
        <div className="relative z-20 flex w-full max-w-xl flex-col items-center lg:max-w-3xl lg:items-start">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#e4dcff] bg-[#f1edff] px-4 py-2 text-[0.78rem] font-bold text-[#5b2ee5] shadow-[0_12px_28px_rgba(91,46,229,0.08)] sm:text-sm">
            <TrophyIcon className="h-4 w-4" />
            {eyebrowText}
          </p>

          <h1 className="mt-4 max-w-[25rem] text-[2.32rem] font-bold leading-[1.08] tracking-normal text-[#050509] min-[390px]:text-[2.48rem] sm:max-w-[40rem] sm:text-[3.45rem] lg:max-w-3xl lg:text-[3.48rem] xl:text-[3.86rem]">
            Struggling to stay{' '}
            <span className="bg-[linear-gradient(90deg,#265cff_0%,#7c3aed_52%,#8b22ff_100%)] bg-clip-text text-transparent">
              consistent
            </span>{' '}
            with studies at home?
          </h1>

          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-[#625b74] sm:text-lg sm:leading-8">
            Join 3000+ aspirants studying daily in a 24x7 Virtual Library built for focus, discipline, and accountability.
          </p>

          <div className="mt-4 grid w-full max-w-[22rem] grid-cols-2 gap-2 sm:mt-5 sm:max-w-md sm:gap-3 lg:max-w-[30rem]">
            {PROOF_CARDS.map((card) => (
              <ProofCard key={card.title} {...card} />
            ))}
          </div>

          <HeroActions
            appStoreHref={appStoreHref}
            className="mt-5 hidden w-full max-w-xl gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            googlePlayHref={googlePlayHref}
            primaryHref={primaryHref}
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[22rem] justify-center sm:max-w-[26rem] lg:mx-0 lg:max-w-[34rem] xl:max-w-[36rem]">
          <div className="relative h-[12.25rem] w-full sm:h-[19rem] lg:h-[35rem] xl:h-[39rem]">
            <div
              className="absolute -inset-x-8 -bottom-8 -top-5 overflow-hidden sm:-inset-x-12 sm:-bottom-10 sm:-top-8"
              style={{
                WebkitMaskImage: 'linear-gradient(180deg,#000 0%,#000 58%,rgba(0,0,0,0.68) 73%,rgba(0,0,0,0) 100%)',
                maskImage: 'linear-gradient(180deg,#000 0%,#000 58%,rgba(0,0,0,0.68) 73%,rgba(0,0,0,0) 100%)',
              }}
            >
              <img
                src={HERO_LIVE_ROOM_IMAGE}
                alt="Virtual Library app live study room with students studying together"
                className="pointer-events-none absolute left-1/2 top-3 h-[30rem] -translate-x-1/2 object-contain drop-shadow-[0_36px_96px_rgba(69,31,149,0.18)] sm:top-5 sm:h-[38rem] lg:h-[50rem] xl:h-[54rem]"
              />
            </div>
          </div>
        </div>

        <HeroActions
          appStoreHref={appStoreHref}
          className="relative z-20 grid w-full max-w-md gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:hidden"
          googlePlayHref={googlePlayHref}
          primaryHref={primaryHref}
        />
      </div>

      <div className="relative z-20 border-y border-[#ebe2ff] bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-2 text-center sm:grid-cols-4">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-[1.75rem] font-extrabold leading-none text-[#171322] sm:text-3xl">{stat.value}</p>
              <p className="mt-1.5 text-sm font-semibold leading-5 text-[#6a6278] sm:mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroActions({
  appStoreHref,
  className,
  googlePlayHref,
  primaryHref,
}: {
  appStoreHref: string
  className: string
  googlePlayHref: string
  primaryHref: string
}) {
  return (
    <div className={className}>
      <a
        href={primaryHref}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[#6d28d9] px-6 text-base font-bold text-white shadow-[0_18px_38px_rgba(109,40,217,0.24)] transition hover:bg-[#5b21b6] sm:text-lg"
      >
        Join Virtual Library Now
        <ArrowRightIcon className="h-5 w-5" />
      </a>
      <DownloadStoreButton googlePlayHref={googlePlayHref} appStoreHref={appStoreHref} />
    </div>
  )
}

function ProofCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[4.35rem] min-w-0 items-center gap-2 rounded-[14px] border border-[#ebe7f6] bg-white/95 px-2.5 py-2 text-left shadow-[0_10px_22px_rgba(48,31,90,0.05)] sm:min-h-[5rem] sm:gap-2.5 sm:rounded-[16px] sm:px-3 sm:py-2.5 lg:min-h-[4.75rem] lg:px-3 xl:min-h-[5rem] xl:gap-3 xl:px-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eee8ff] text-[#5b2ee5] sm:h-10 sm:w-10 lg:h-10 lg:w-10 xl:h-11 xl:w-11">
        {icon === 'clock' ? <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-[18px] lg:w-[18px] xl:h-5 xl:w-5" /> : <UsersIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-[18px] lg:w-[18px] xl:h-5 xl:w-5" />}
      </span>
      <span className="min-w-0">
        <span className="block whitespace-nowrap text-[0.66rem] font-bold leading-3 text-[#070711] min-[380px]:text-[0.69rem] sm:text-sm sm:leading-4 lg:text-[0.82rem] xl:text-[0.9rem] xl:leading-5">
          {title}
        </span>
        <span className="mt-1 block text-[0.58rem] font-medium leading-[0.85rem] text-[#625b74] min-[380px]:text-[0.61rem] sm:text-xs sm:leading-4 lg:text-xs lg:leading-4 xl:text-sm xl:leading-5">
          {description}
        </span>
        <span className="mt-1 block h-0.5 w-7 rounded-full bg-[#6d28d9] sm:mt-1.5 sm:w-8 lg:w-8 xl:mt-2 xl:w-9" aria-hidden="true" />
      </span>
    </div>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M8 4h8v3.5c0 3-1.8 5.5-4 5.5S8 10.5 8 7.5V4Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M8 6H5.5A1.5 1.5 0 0 0 4 7.5C4 10 5.6 12 8.2 12M16 6h2.5A1.5 1.5 0 0 1 20 7.5c0 2.5-1.6 4.5-4.2 4.5M12 13v4M9 20h6M10 17h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3.8 20c.8-3.2 3-5 5.7-5s4.9 1.8 5.7 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M16.2 11.4a3 3 0 1 0-.8-5.9M15.5 15.2c2.4.4 4.1 2 4.7 4.8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M18.5 19.5h2.7M21.2 19.5v-3.1M21.2 19.5l-3.1-3.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function DownloadStoreButton({
  googlePlayHref,
  appStoreHref,
}: {
  googlePlayHref: string
  appStoreHref: string
}) {
  return (
    <div className="flex h-14 w-full items-center justify-center gap-3 rounded-[18px] border border-[#e2ddea] bg-white px-6 text-base font-bold text-[#070711] shadow-[0_12px_26px_rgba(35,24,70,0.05)] sm:text-lg">
      <span>Download on</span>
      <a href={googlePlayHref} target="_blank" rel="noreferrer" aria-label="Download on Google Play">
        <PlayStoreIcon className="h-6 w-6" />
      </a>
      <span aria-hidden="true" className="h-6 w-px bg-[#d8d3df]" />
      <a href={appStoreHref} target="_blank" rel="noreferrer" aria-label="Download on App Store">
        <AppleIcon className="h-6 w-6 text-[#8b8b8b]" />
      </a>
    </div>
  )
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#00D4FF" d="M4.3 2.5c-.4.3-.6.8-.6 1.5v16c0 .7.2 1.2.6 1.5l.1.1 9-9.5v-.2l-9-9.5-.1.1Z" />
      <path fill="#00F076" d="m16.5 15.2-3.1-3.2v-.2l3.1-3.2.1.1 3.7 2.1c1 .6 1 1.5 0 2.1l-3.7 2.1-.1.2Z" />
      <path fill="#FFCE00" d="m16.6 15-3.2-3.3-9 9.5c.6.6 1.5.6 2.5.1L16.6 15Z" />
      <path fill="#FF3A44" d="m16.6 8.9-9.7-5.6c-1-.6-1.9-.5-2.5.1l9 9.5 3.2-3.3Z" />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.8 12.8c0-2.4 2-3.6 2.1-3.7-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.8-3.6.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.1 1.2 9.4.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3.1-.8s1.9.8 3.2.8 2.2-1.1 2.9-2.3c.9-1.3 1.3-2.6 1.3-2.7-.1-.1-2.7-1.1-2.7-4.6ZM14.5 5.8c.7-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  )
}
