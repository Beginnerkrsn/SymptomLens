import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
} from 'lucide-react'
import { useState } from 'react'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import api from '../services/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] =
    useSearchParams()

  const token =
    searchParams.get('token') || ''

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState('')

  const [error, setError] =
    useState(
      token
        ? ''
        : 'This password reset link is missing or invalid.',
    )

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!token) {
      setError(
        'This password reset link is invalid.',
      )
      return
    }

    if (password.length < 8) {
      setError(
        'Your new password must contain at least 8 characters.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'The passwords do not match.',
      )
      return
    }

    try {
      setLoading(true)

      const response = await api.post(
        '/auth/reset-password',
        {
          token,
          new_password: password,
          confirm_password: confirmPassword,
        },
      )

      setSuccess(
        response?.data?.message ||
          'Your password has been reset successfully.',
      )

      setPassword('')
      setConfirmPassword('')

      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
        })
      }, 1800)
    } catch (requestError) {
      console.error(
        'Password reset failed:',
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
          'Unable to reset your password. Please request a new reset link.',
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
                  Secure password recovery
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf3ff] text-[#2563eb]">
                <LockKeyhole size={27} />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
                Account Recovery
              </p>

              <h1 className="heading mt-3 text-3xl font-bold text-[#173d32]">
                Create a new password
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#62756c]">
                Choose a new password for your
                SymptomLens account.
              </p>
            </div>

            {success && (
              <div className="mt-6 rounded-2xl border border-[#cfe5d7] bg-[#f1faf4] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-[#07856b]"
                  />

                  <p className="text-sm leading-6 text-[#285847]">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 rounded-2xl border border-[#efcfca] bg-[#fff5f3] p-4"
              >
                <p className="text-sm leading-6 text-[#9a443d]">
                  {error}
                </p>
              </div>
            )}

            {!success && (
              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
                aria-busy={loading}
              >
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-[#173d32]"
                  >
                    New password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    disabled={loading}
                    required
                    className="w-full rounded-2xl border border-[#dce8df] bg-[#fbfdfc] px-4 py-3.5 text-sm text-[#173d32] outline-none transition placeholder:text-[#98a8a0] focus:border-[#39735c] focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-2 flex items-center gap-2 text-xs text-[#7a8b83]">
                    <CheckCircle2 size={14} />
                    Use at least 8 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-[#173d32]"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={8}
                    disabled={loading}
                    required
                    className="w-full rounded-2xl border border-[#dce8df] bg-[#fbfdfc] px-4 py-3.5 text-sm text-[#173d32] outline-none transition placeholder:text-[#98a8a0] focus:border-[#39735c] focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#173d32] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#285847] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={18} />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            )}

            {error && !success && (
              <Link
                to="/forgot-password"
                className="mt-5 flex min-h-[50px] w-full items-center justify-center rounded-full border border-[#dce8df] bg-white px-5 py-3 text-sm font-bold text-[#284947] transition hover:border-[#39735c] hover:bg-[#f7faf9]"
              >
                Request a New Reset Link
              </Link>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <Link
                  to="/register"
                  className="text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
                >
                  Don't have an account? Create one
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}