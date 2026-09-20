import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    const normalizedEmail =
      email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    try {
      const response = await api.post(
        '/auth/forgot-password',
        {
          email: normalizedEmail,
        },
      )

      setMessage(
        response?.data?.message ||
          'If an account exists for this email, a password reset link has been generated.',
      )
    } catch (requestError) {
      console.error(
        'Forgot password request failed:',
        requestError,
      )

      const detail =
        requestError?.response?.data?.detail

      if (typeof detail === 'string') {
        setError(detail)
      } else if (
        requestError?.request &&
        !requestError?.response
      ) {
        setError(
          'Unable to connect to the SymptomLens server. Please make sure the backend is running.',
        )
      } else {
        setError(
          'Unable to process your password reset request.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f7f4] px-6 py-10 sm:py-16">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full">
          <Link
            to="/login"
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
          >
            <ArrowLeft size={17} />
            Back to Login
          </Link>

          <div className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-xl sm:p-9">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#173d32] text-white">
                <Activity size={21} />
              </div>

              <div>
                <p className="heading text-lg font-bold text-[#173d32]">
                  Symptom
                  <span className="text-[#da7d43]">
                    Lens
                  </span>
                </p>

                <p className="text-xs text-[#82918b]">
                  Account recovery
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
                <Mail size={27} />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
                Account Recovery
              </p>

              <h1 className="heading mt-3 text-3xl font-bold text-[#173d32]">
                Forgot your password?
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#62756c]">
                Enter the email address associated with
                your SymptomLens account.
              </p>
            </div>

            {message && (
              <div className="mt-6 rounded-2xl border border-[#cfe5d7] bg-[#f1faf4] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-[#39735c]"
                  />

                  <p className="text-sm leading-6 text-[#285847]">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 rounded-2xl border border-[#f0d2d2] bg-[#fff4f4] p-4"
              >
                <p className="text-sm leading-6 text-[#8a4141]">
                  {error}
                </p>
              </div>
            )}

            {!message && (
              <form
                onSubmit={handleSubmit}
                className="mt-7"
                aria-busy={loading}
              >
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-[#173d32]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                  className="w-full rounded-2xl border border-[#dce8df] bg-[#fbfdfc] px-4 py-3.5 text-sm text-[#173d32] outline-none transition placeholder:text-[#98a8a0] focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#173d32] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#285847] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Requesting reset...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Request Password Reset
                    </>
                  )}
                </button>
              </form>
            )}

            {message && (
              <Link
                to="/login"
                className="mt-6 flex min-h-[50px] w-full items-center justify-center rounded-full bg-[#173d32] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#285847]"
              >
                Return to Login
              </Link>
            )}

            <p className="mt-6 text-center text-xs leading-5 text-[#7a8b83]">
              For security, SymptomLens does not reveal
              whether an email address has an account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}