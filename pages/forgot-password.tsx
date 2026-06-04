import { type FormEvent, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PaymentApiError, requestPasswordReset } from '@/lib/payment-client'

const successMessage = 'If an account exists for that email, we sent a password reset link.'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()

    setError('')
    setSent(false)

    if (!trimmedEmail) {
      setError('Enter your email address.')
      return
    }

    setLoading(true)

    try {
      await requestPasswordReset(trimmedEmail)
      setSent(true)
    } catch (err) {
      setError(err instanceof PaymentApiError ? err.message : 'Unable to request a reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password - Virtual Library</title>
        <meta name="description" content="Request a Virtual Library password reset link." />
      </Head>

      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-950 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
          <Link href="/" className="mb-8 inline-flex items-center" aria-label="Virtual Library home">
            <img src="/img/logo.svg" alt="Virtual Library" className="h-9 w-auto" />
          </Link>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div>
              <p className="text-sm font-bold text-[#6d35df]">Account recovery</p>
              <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">Forgot password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Enter the email linked to your Virtual Library account and we will send a reset link if the account exists.
              </p>
            </div>

            {sent && (
              <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium leading-6 text-emerald-800" role="status">
                {successMessage}
                <div className="mt-2">
                  <Link href="/login" className="font-bold text-emerald-900 underline-offset-4 transition hover:underline">
                    Back to login
                  </Link>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-800">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 block h-12 w-full rounded-lg border border-slate-300 px-4 text-base text-slate-950 placeholder:text-slate-400 focus:border-[#6d35df] focus:outline-none focus:ring-2 focus:ring-[#ede9fe]"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#111827] px-5 text-sm font-bold text-white transition hover:bg-[#273142] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Sending reset link...' : sent ? 'Send another link' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm font-bold text-[#6d35df] transition hover:text-[#5528b5]">
                Back to login
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
