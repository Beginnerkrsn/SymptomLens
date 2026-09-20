import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  LoaderCircle,
  Plus,
  Stethoscope,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getMedicalReportHistory } from '../services/medicalAnalysisService'

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

function getReportName(fileName) {
  if (!fileName) {
    return 'Medical Report'
  }

  return fileName.length > 55
    ? `${fileName.slice(0, 52)}...`
    : fileName
}

function formatScore(value) {
  return typeof value === 'number'
    ? `${value.toFixed(1)}%`
    : 'Not available'
}

export default function MedicalHistory() {
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response =
        await getMedicalReportHistory()

      setItems(
        Array.isArray(response?.items)
          ? response.items
          : [],
      )
    } catch (requestError) {
      console.error(
        'Unable to load medical history:',
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
          'Unable to load your medical report history.',
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
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <Link
            to="/medical-analysis"
            className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#285847]"
          >
            <Plus size={17} />
            New Report
          </Link>
        </div>

        {/* Heading */}
        <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
              Your Records
            </p>

            <h1 className="heading mt-3 text-4xl font-bold tracking-[-0.03em] text-[#173d32] sm:text-5xl">
              Medical Report History
            </h1>

            <p className="mt-4 max-w-3xl leading-7 text-[#62756c]">
              Review previously analyzed medical reports,
              extracted information, and specialty routing
              details saved to your account.
            </p>
          </div>

          {!loading && !error && (
            <div className="rounded-2xl border border-[#dce8df] bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829290]">
                Saved reports
              </p>

              <p className="mt-1 text-2xl font-bold text-[#173d32]">
                {items.length}
              </p>
            </div>
          )}
        </div>

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
              Loading your reports
            </h2>

            <p className="mx-auto mt-2 max-w-md leading-6 text-[#62756c]">
              Retrieving your saved medical analyses...
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
                  Unable to load medical history
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
                <ClipboardList size={30} />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
                No saved records
              </p>

              <h2 className="heading mt-2 text-2xl font-bold text-[#173d32] sm:text-3xl">
                No medical reports yet
              </h2>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-[#62756c]">
                Reports you analyze will appear here so you
                can review them later.
              </p>

              <Link
                to="/medical-analysis"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#173d32] px-6 py-3.5 font-bold text-white transition hover:bg-[#285847]"
              >
                <FileText size={18} />
                Upload Medical Report
                <ArrowRight size={17} />
              </Link>
            </section>
          )}

        {/* History */}
        {!loading &&
          !error &&
          items.length > 0 && (
            <section className="mt-10 space-y-5">
              {items.map((item) => {
                const routingScore =
                  typeof item.routing_score_percentage ===
                  'number'
                    ? item.routing_score_percentage
                    : null

                return (
                  <article
                    key={item.id}
                    className="group rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-7"
                  >
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
                            <FileText size={23} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829290]">
                              Medical Report
                            </p>

                            <h2 className="heading mt-2 break-words text-xl font-bold text-[#173d32] sm:text-2xl">
                              {getReportName(
                                item.file_name,
                              )}
                            </h2>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#7a8b83]">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={15} />
                                {formatDate(
                                  item.created_at,
                                )}
                              </span>

                              {item.report_type && (
                                <span className="rounded-full bg-[#f4f8f5] px-3 py-1 text-xs font-bold text-[#52655d]">
                                  {item.report_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {item.status && (
                          <span className="self-start rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-bold capitalize text-[#39735c]">
                            {item.status}
                          </span>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl bg-[#f7faf8] p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                            Primary specialty
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <Stethoscope
                              size={18}
                              className="text-[#39735c]"
                            />

                            <p className="font-bold text-[#173d32]">
                              {item.primary_specialty ||
                                'Not available'}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[#f7faf8] p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                            Confidence
                          </p>

                          <p className="mt-2 font-bold capitalize text-[#173d32]">
                            {item.confidence_level ||
                              'Unknown'}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#f7faf8] p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                            Routing score
                          </p>

                          <p className="mt-2 font-bold text-[#173d32]">
                            {formatScore(routingScore)}
                          </p>
                        </div>
                      </div>

                      {Array.isArray(item.findings) &&
                        item.findings.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                              Key findings
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.findings
                                .slice(0, 4)
                                .map(
                                  (
                                    finding,
                                    index,
                                  ) => (
                                    <span
                                      key={`${finding}-${index}`}
                                      className="rounded-full bg-[#fff8e9] px-3 py-1.5 text-xs font-semibold text-[#755c2c]"
                                    >
                                      {finding}
                                    </span>
                                  ),
                                )}

                              {item.findings.length > 4 && (
                                <span className="rounded-full bg-[#f4f8f5] px-3 py-1.5 text-xs font-semibold text-[#62756c]">
                                  +
                                  {item.findings.length -
                                    4}{' '}
                                  more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1ee] pt-6">
                        <p className="text-xs leading-5 text-[#82918b]">
                          Saved to your SymptomLens account.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/medical-history/${item.id}`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285847]"
                        >
                          View Full Analysis
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}

        {!loading &&
          !error &&
          items.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                to="/medical-analysis"
                className="inline-flex items-center gap-2 rounded-full bg-[#da7d43] px-5 py-3 font-bold text-white transition hover:bg-[#c86c35]"
              >
                <Plus size={17} />
                Analyze New Report
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-5 py-3 font-bold text-[#39735c] transition hover:border-[#39735c] hover:text-[#173d32]"
              >
                <ArrowLeft size={17} />
                Dashboard
              </Link>
            </div>
          )}
      </div>
    </div>
  )
}