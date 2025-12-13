import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function Layout({ children, title, description }: LayoutProps) {
  const defaultTitle = "Virtual Study Space — Home"
  const defaultDescription = "India's First Virtual Study Space — Join virtual library, 24/7 Google Meet rooms, exam-specific WhatsApp & Telegram groups."

  return (
    <>
      <Head>
        <title>{title || defaultTitle}</title>
        <meta name="description" content={description || defaultDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="text-slate-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  )
}

