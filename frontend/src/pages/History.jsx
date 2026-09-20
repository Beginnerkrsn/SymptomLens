import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  Clock3,
  Home,
  LoaderCircle,
  Plus,
  Stethoscope,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'

import {
  getPredictionHistory,
} from '../services/predictionService'

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Unknown date'
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatScore(score) {
  if (
    typeof score !== 'number' ||
    Number.isNaN(score)
  ) {
    return null
  }

  return `${(score * 100).toFixed(1)}%`
}

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await getPredictionHistory()

      const historyItems =
        Array.isArray(response?.items)
          ? response.items
          : []

      setItems(historyItems)
    } catch (requestError) {
      console.error(
        'Unable to load history:',
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
          'Unable to load your analysis history.',
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return (
    <div className="min-h-screen bg-[#f3f7f4]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        {/* Header actions */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <Link
            to="/diagnosis"
            className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#285847]"
          >
            <Plus size={17} />
            New Analysis
          </Link>
        </div>

        {/* Heading */}
        <section className="mt-9">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
            Your Records
          </p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="heading text-4xl font-bold tracking-[-0.03em] text-[#173d32] sm:text-5xl">
                Analysis History
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-[#62756c]">
                Review previous symptom analyses saved to
                your SymptomLens account.
              </p>
            </div>

            {!loading &&
              !error &&
              items.length > 0 && (
                <div className="rounded-2xl border border-[#dce8df] bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829290]">
                    Saved analyses
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#173d32]">
                    {items.length}
                  </p>
                </div>
              )}
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <section className="mt-10 rounded-[2rem] border border-[#dce8df] bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
              <LoaderCircle
                size={30}
                className="animate-spin"
              />
            </div>

            <h2 className="heading mt-5 text-2xl font-bold text-[#173d32]">
              Loading your history
            </h2>

            <p className="mx-auto mt-2 max-w-md leading-6 text-[#62756c]">
              Retrieving your saved symptom analyses...
            </p>
          </section>
        )}

        {/* Error */}
        {!loading && error && (
          <section
            role="alert"
            className="mt-10 rounded-[2rem] border border-[#f0d2d2] bg-white p-7 shadow-sm sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff2f0] text-[#aa4934]">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2 className="heading text-xl font-bold text-[#7f3838]">
                  Unable to load history
                </h2>

                <p className="mt-2 max-w-xl leading-7 text-[#8a4141]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadHistory}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#173d32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285847]"
                >
                  Try Again
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          items.length === 0 && (
            <section className="mt-10 rounded-[2rem] border border-[#dce8df] bg-white p-10 text-center shadow-sm sm:p-14">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
                <Clock3 size={30} />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
                No saved records
              </p>

              <h2 className="heading mt-2 text-2xl font-bold text-[#173d32] sm:text-3xl">
                Your analysis history is empty
              </h2>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-[#62756c]">
                Completed symptom analyses will appear here
                after you run your first analysis.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  to="/diagnosis"
                  className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-6 py-3.5 font-bold text-white transition hover:bg-[#285847]"
                >
                  <Stethoscope size={18} />
                  Analyze Symptoms
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-6 py-3.5 font-bold text-[#39735c] transition hover:border-[#39735c]"
                >
                  <Home size={18} />
                  Dashboard
                </Link>
              </div>
            </section>
          )}

        {/* History cards */}
        {!loading &&
          !error &&
          items.length > 0 && (
            <section className="mt-10 space-y-5">
              {items.map((item, index) => {
                const score =
                  formatScore(item.top_score)

                return (
                  <article
                    key={item.id}
                    className="group rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-7"
                  >
                    <div className="flex flex-col gap-6">
                      {/* Main */}
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
                            <Brain size={22} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7a8b83]">
                                Symptom Analysis
                              </p>

                              <span className="rounded-full bg-[#f4f8f5] px-2.5 py-1 text-[11px] font-bold text-[#829290]">
                                #{index + 1}
                              </span>
                            </div>

                            <p className="mt-2 break-words leading-7 text-[#173d32]">
                              {item.input_text ||
                                'Symptom description unavailable.'}
                            </p>

                            <p className="mt-2 text-sm text-[#7a8b83]">
                              {formatDate(
                                item.created_at,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:w-[330px]">
                          {item.top_condition && (
                            <div className="rounded-2xl bg-[#f7faf8] p-4">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-[#7a8b83]">
                                Top model possibility
                              </p>

                              <p className="mt-1 break-words font-bold text-[#173d32]">
                                {item.top_condition}
                              </p>
                            </div>
                          )}

                          {score && (
                            <div className="rounded-2xl bg-[#f7faf8] p-4">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-[#7a8b83]">
                                Model score
                              </p>

                              <p className="mt-1 font-bold text-[#173d32]">
                                {score}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-[#edf1ee] pt-5">
                        <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-bold capitalize text-[#39735c]">
                          {item.confidence_level ||
                            'unknown'}{' '}
                          confidence
                        </span>

                        {item.requires_review && (
                          <span className="rounded-full bg-[#fff8e9] px-3 py-1.5 text-xs font-bold text-[#755c2c]">
                            Review recommended
                          </span>
                        )}

                        <span className="rounded-full bg-[#f4f8f5] px-3 py-1.5 text-xs font-bold text-[#62756c]">
                          {item.status || 'unknown'}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-4 border-t border-[#edf1ee] pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-xl text-xs leading-5 text-[#7a8b83]">
                          The displayed score is a model
                          score, not a medical probability or
                          diagnosis.
                        </p>

                        <Link
                          to={`/history/${item.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8793f] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c85f2d] hover:shadow-md"
                        >
                          View Full Details
                          <ArrowRight size={17} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}

        {/* Bottom */}
        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                to="/diagnosis"
                className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-5 py-3 font-bold text-white transition hover:bg-[#285847]"
              >
                <Plus size={17} />
                New Symptom Analysis
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-5 py-3 font-bold text-[#39735c] transition hover:border-[#39735c] hover:text-[#173d32]"
              >
                <Home size={17} />
                Dashboard
              </Link>
            </div>
          )}
      </div>
    </div>
  )
}