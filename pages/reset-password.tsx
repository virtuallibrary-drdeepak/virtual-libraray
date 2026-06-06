import { type FormEvent, useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PaymentApiError, resetPassword } from '@/lib/payment-client'

const invalidLinkMessage = 'This password reset link is invalid. Request a new link to continue.'
const expiredLinkMessage = 'This password reset link has expired or has already been used. Request a new link to continue.'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [tokenRead, setTokenRead] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [expiredOrInvalid, setExpiredOrInvalid] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!router.isReady || tokenRead) {
      return
    }

    const value = router.query.token
    const nextToken = Array.isArray(value) ? value[0] : value

    if (nextToken) {
      const { token: _token, ...remainingQuery } = router.query

      setToken(nextToken)
      router.replace(
        {
          pathname: router.pathname,
          query: remainingQuery,
        },
        undefined,
        { shallow: true }
      )
    }

    setTokenRead(true)
  }, [router, router.isReady, router.query, tokenRead])

  const tokenMissing = tokenRead && !token
  const showPasswordForm = tokenRead && !tokenMissing && !expiredOrInvalid

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setExpiredOrInvalid(false)

    if (!token) {
      setError(invalidLinkMessage)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, newPassword)
      setNewPassword('')
      setConfirmPassword('')
      await router.push('/login?reset=success')
    } catch (err) {
      if (err instanceof PaymentApiError && err.message === 'Invalid or expired reset token') {
        setNewPassword('')
        setConfirmPassword('')
        setExpiredOrInvalid(true)
        return
      }

      setError(err instanceof PaymentApiError ? err.message : 'Unable to reset your password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password - Virtual Library</title>
        <meta name="description" content="Set a new password for your Virtual Library account." />
      </Head>

      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-950 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
          <Link href="/" className="mb-8 inline-flex items-center" aria-label="Virtual Library home">
            <img src="/img/logo.svg" alt="Virtual Library" className="h-9 w-auto" />
          </Link>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div>
              <p className="text-sm font-bold text-[#6d35df]">Account recovery</p>
              <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">Reset password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Choose a new password for your Virtual Library account.
              </p>
            </div>

            {!tokenRead && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700" role="status">
                Checking reset link...
              </div>
            )}

            {tokenMissing && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-800" role="alert">
                {invalidLinkMessage}
                <div className="mt-2">
                  <Link href="/forgot-password" className="font-bold text-amber-900 underline-offset-4 transition hover:underline">
                    Request a new link
                  </Link>
                </div>
              </div>
            )}

            {expiredOrInvalid && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-800" role="alert">
                {expiredLinkMessage}
                <div className="mt-2">
                  <Link href="/forgot-password" className="font-bold text-amber-900 underline-offset-4 transition hover:underline">
                    Request a new link
                  </Link>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700" role="alert">
                {error}
              </div>
            )}

            {showPasswordForm && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-bold text-slate-800">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="mt-2 block h-12 w-full rounded-lg border border-slate-300 px-4 text-base text-slate-950 placeholder:text-slate-400 focus:border-[#6d35df] focus:outline-none focus:ring-2 focus:ring-[#ede9fe] disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-800">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="mt-2 block h-12 w-full rounded-lg border border-slate-300 px-4 text-base text-slate-950 placeholder:text-slate-400 focus:border-[#6d35df] focus:outline-none focus:ring-2 focus:ring-[#ede9fe] disabled:cursor-not-allowed disabled:bg-slate-100"
                    placeholder="Re-enter new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#111827] px-5 text-sm font-bold text-white transition hover:bg-[#273142] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Resetting password...' : 'Reset password'}
                </button>
              </form>
            )}

            <div className="mt-6 flex flex-col items-center gap-3 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
              <Link href="/forgot-password" className="font-bold text-[#6d35df] transition hover:text-[#5528b5]">
                Request a new link
              </Link>
              <Link href="/login" className="font-bold text-slate-700 transition hover:text-slate-950">
                Back to login
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
