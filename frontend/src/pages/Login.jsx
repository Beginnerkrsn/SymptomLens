import {
  Activity,
  ArrowLeft,
  LoaderCircle,
  LockKeyhole,
  LogIn,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth.js'
import api from '../services/api.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    login,
    isAuthenticated,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const destination =
        location.state?.from || '/dashboard'

      navigate(destination, {
        replace: true,
      })
    }
  }, [
    isAuthenticated,
    location.state,
    navigate,
  ])

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const normalizedEmail = email
      .trim()
      .toLowerCase()

    if (!normalizedEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post(
        '/auth/login',
        {
          email: normalizedEmail,
          password,
        },
      )

      const {
        access_token,
        user,
      } = response.data

      if (!access_token || !user) {
        throw new Error(
          'Invalid login response from the server.',
        )
      }

      login(
        user,
        access_token,
      )

      const destination =
        location.state?.from || '/dashboard'

      navigate(destination, {
        replace: true,
      })
    } catch (requestError) {
      console.error(
        'Login failed:',
        requestError,
      )

      const responseMessage =
        requestError?.response?.data?.detail

      if (typeof responseMessage === 'string') {
        setError(responseMessage)
      } else if (
        requestError?.request &&
        !requestError?.response
      ) {
        setError(
          'Unable to connect to the SymptomLens server. Please make sure the backend is running.',
        )
      } else {
        setError(
          'Login failed. Please check your email and password and try again.',
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
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
          >
            <ArrowLeft size={17} />
            Back to Home
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
                  AI-assisted health information
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
                Welcome back
              </p>

              <h1 className="heading mt-3 text-4xl font-bold text-[#173d32]">
                Log in
              </h1>

              <p className="mt-3 text-[#62756c]">
                Sign in to continue to SymptomLens.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 rounded-2xl border border-[#edc8c8] bg-[#fff4f4] px-4 py-3 text-sm leading-6 text-[#9b3f3f]"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
              aria-busy={loading}
            >
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-bold text-[#173d32]"
                >
                  Email
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
                  className="mt-2 w-full rounded-2xl border border-[#cfddd2] bg-[#f8fbf8] px-4 py-3.5 outline-none transition focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-sm font-bold text-[#173d32]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="mt-2 w-full rounded-2xl border border-[#cfddd2] bg-[#f8fbf8] px-4 py-3.5 outline-none transition focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#173d32] px-5 py-3.5 font-bold text-white transition hover:bg-[#285847] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Log in
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-[#62756c]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#39735c] transition hover:text-[#173d32]"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}