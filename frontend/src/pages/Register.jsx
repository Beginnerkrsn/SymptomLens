import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth.js'
import api from '../services/api.js'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (trimmedName.length < 2) {
      setError('Please enter your full name.')
      return
    }

    if (!normalizedEmail) {
      setError('Please enter your email address.')
      return
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post(
        '/auth/register',
        {
          full_name: trimmedName,
          email: normalizedEmail,
          password,
          confirm_password: confirmPassword,
        },
      )

      const {
        access_token,
        user,
      } = response.data

      if (!access_token || !user) {
        throw new Error(
          'Invalid registration response from the server.',
        )
      }

      login(
        user,
        access_token,
      )

      navigate('/dashboard', {
        replace: true,
      })
    } catch (requestError) {
      console.error(
        'Registration failed:',
        requestError,
      )

      const responseMessage =
        requestError?.response?.data?.detail

      if (typeof responseMessage === 'string') {
        setError(responseMessage)
      } else if (
        Array.isArray(responseMessage)
      ) {
        setError(
          responseMessage
            .map((item) => item.msg)
            .join(' '),
        )
      } else if (
        requestError?.request &&
        !requestError?.response
      ) {
        setError(
          'Unable to connect to the SymptomLens server. Please make sure the backend is running.',
        )
      } else {
        setError(
          'Registration failed. Please check your details and try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f7f4] px-6 py-10 sm:py-16">
      <div className="mx-auto flex min-h-[82vh] max-w-md items-center">
        <div className="w-full">
          <Link
            to="/"
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <div className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-xl sm:p-9">
            {/* Brand */}
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
                  Your personal health information workspace
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
                Get started
              </p>

              <h1 className="heading mt-3 text-4xl font-bold tracking-tight text-[#173d32]">
                Create your account
              </h1>

              <p className="mt-3 leading-6 text-[#62756c]">
                Create a SymptomLens account to save your
                analyses and access your history.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 rounded-2xl border border-[#edc8c8] bg-[#fff4f4] px-4 py-3 text-sm leading-6 text-[#9b3f3f]"
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
              aria-busy={loading}
            >
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-bold text-[#173d32]"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={loading}
                  required
                  className="mt-2 w-full rounded-2xl border border-[#cfddd2] bg-[#f8fbf8] px-4 py-3.5 text-[#173d32] outline-none transition placeholder:text-[#98a8a0] focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-[#173d32]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                  className="mt-2 w-full rounded-2xl border border-[#cfddd2] bg-[#f8fbf8] px-4 py-3.5 text-[#173d32] outline-none transition placeholder:text-[#98a8a0] focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-[#173d32]"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  disabled={loading}
                  required
                  className="mt-2 w-full rounded-2xl border border-[#cfddd2] bg-[#f8fbf8] px-4 py-3.5 text-[#173d32] outline-none transition placeholder:text-[#98a8a0] focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-2 flex items-center gap-2 text-xs text-[#7a8b83]">
                  <CheckCircle2 size={14} />
                  Use at least 8 characters.
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-bold text-[#173d32]"
                >
                  Confirm password
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
                  className="mt-2 w-full rounded-2xl border border-[#cfddd2] bg-[#f8fbf8] px-4 py-3.5 text-[#173d32] outline-none transition placeholder:text-[#98a8a0] focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#da7d43] px-5 py-3.5 font-bold text-white shadow-md shadow-[#da7d43]/15 transition hover:-translate-y-0.5 hover:bg-[#c86c35] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create account
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#62756c]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#39735c] transition hover:text-[#173d32]"
              >
                Log in
              </Link>
            </p>

            <p className="mt-5 text-xs leading-5 text-[#82918b]">
              SymptomLens provides model-generated health
              information for educational and informational
              purposes. It does not replace professional
              medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}