import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  FileText,
  Home,
  MapPin,
  Stethoscope,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import RiskNotice from '../components/RiskNotice'
import { getMedicalReportHistoryDetail } from '../services/medicalAnalysisService'

function formatDate(value) {
  if (!value) {
    return 'Date unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'Not available'
  }

  return String(value)
}

function getSpecialtyName(item) {
  if (typeof item === 'string') {
    return item
  }

  if (item && typeof item === 'object') {
    return (
      item.name ||
      item.specialty ||
      item.specialty_name ||
      'Specialty'
    )
  }

  return 'Specialty'
}

function getFindingText(item) {
  if (typeof item === 'string') {
    return item
  }

  if (item && typeof item === 'object') {
    return (
      item.finding ||
      item.description ||
      item.text ||
      item.result ||
      JSON.stringify(item)
    )
  }

  return String(item)
}

function getMeasurementData(item) {
  if (typeof item === 'string') {
    return {
      name: item,
      value: '',
      unit: '',
    }
  }

  if (item && typeof item === 'object') {
    return {
      name:
        item.name ||
        item.parameter ||
        item.measurement ||
        item.test ||
        'Measurement',
      value:
        item.value ??
        item.result ??
        item.amount ??
        '',
      unit: item.unit || '',
    }
  }

  return {
    name: 'Measurement',
    value: '',
    unit: '',
  }
}

function getProviderData(provider) {
  if (!provider || typeof provider !== 'object') {
    return {
      name: 'Healthcare Provider',
      providerName: '',
      specialty: 'Medical specialty',
      location: '',
      bookingUrl: '',
    }
  }

  return {
    name:
      provider.name ||
      provider.full_name ||
      provider.doctor_name ||
      'Healthcare Provider',
    providerName:
      provider.provider_name ||
      provider.source ||
      '',
    specialty:
      provider.specialty ||
      provider.specialty_name ||
      provider.department ||
      'Medical specialty',
    location:
      provider.city ||
      provider.location ||
      provider.address ||
      '',
    bookingUrl:
      provider.booking_url ||
      provider.profile_url ||
      '',
  }
}

export default function MedicalHistoryDetail() {
  const { reportId } = useParams()
  const navigate = useNavigate()

  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] =
    useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadReport() {
      try {
        setIsLoading(true)
        setError('')

        const data =
          await getMedicalReportHistoryDetail(
            reportId,
          )

        if (mounted) {
          setReport(data)
        }
      } catch (requestError) {
        console.error(
          'Unable to load medical report:',
          requestError,
        )

        if (!mounted) {
          return
        }

        const message =
          requestError?.response?.data?.detail ||
          requestError?.message ||
          'Unable to load this medical report.'

        setError(message)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadReport()

    return () => {
      mounted = false
    }
  }, [reportId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f7f4] px-6 py-12">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-[2rem] border border-[#dce8df] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
              <FileText
                size={27}
                className="animate-pulse"
              />
            </div>

            <p className="mt-5 text-sm font-semibold text-[#62756c]">
              Loading medical report...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f7f4] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate('/medical-history')
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
          >
            <ArrowLeft size={18} />
            Back to Medical History
          </button>

          <div
            role="alert"
            className="rounded-[2rem] border border-[#f0d2d2] bg-white p-8 shadow-sm sm:p-10"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fff2f0] text-[#aa4934]">
              <AlertTriangle size={28} />
            </div>

            <h1 className="heading mt-5 text-3xl font-bold text-[#173d32]">
              Unable to load report
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-[#8a4141]">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/medical-history')
              }
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173d32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285847]"
            >
              Return to Medical History
              <ArrowLeft
                size={17}
                className="rotate-180"
              />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#f3f7f4] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate('/medical-history')
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#39735c]"
          >
            <ArrowLeft size={18} />
            Back to Medical History
          </button>

          <div className="rounded-[2rem] border border-[#dce8df] bg-white p-10 text-center shadow-sm">
            <p className="text-[#62756c]">
              Medical report not found.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const specialties = Array.isArray(
    report.specialties,
  )
    ? report.specialties
    : []

  const findings = Array.isArray(
    report.findings,
  )
    ? report.findings
    : []

  const measurements = Array.isArray(
    report.measurements,
  )
    ? report.measurements
    : []

  const physicians = Array.isArray(
    report.physicians,
  )
    ? report.physicians
    : []

  return (
    <div className="min-h-screen bg-[#f3f7f4] px-6 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              navigate('/medical-history')
            }
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c]"
          >
            <ArrowLeft size={17} />
            Medical History
          </button>

          <button
            type="button"
            onClick={() =>
              navigate('/dashboard')
            }
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#62756c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c]"
          >
            <Home size={17} />
            Dashboard
          </button>
        </div>

        {/* Report header */}
        <section className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-bold text-[#39735c]">
                <FileText size={14} />
                Saved Medical Report
              </div>

              <h1 className="heading mt-4 break-words text-3xl font-bold tracking-tight text-[#173d32] sm:text-4xl">
                {formatValue(report.file_name)}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#71847a]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={15} />
                  {formatDate(report.created_at)}
                </span>

                {report.report_type && (
                  <span className="rounded-full bg-[#f4f8f5] px-3 py-1.5 text-xs font-bold text-[#52655d]">
                    {report.report_type}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 rounded-2xl bg-[#f7faf8] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829290]">
                Status
              </p>

              <p className="mt-1 text-lg font-bold capitalize text-[#173d32]">
                {formatValue(report.status)}
              </p>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <SummaryCard
            label="Primary Specialty"
            value={formatValue(
              report.primary_specialty,
            )}
            icon={Stethoscope}
          />

          <SummaryCard
            label="Routing Score"
            value={
              report.routing_score_percentage !==
                null &&
              report.routing_score_percentage !==
                undefined
                ? `${Number(
                    report.routing_score_percentage,
                  ).toFixed(2)}%`
                : 'Not available'
            }
          />

          <SummaryCard
            label="Confidence"
            value={formatValue(
              report.confidence_level,
            )}
          />
        </section>

        {/* Specialties */}
        {specialties.length > 0 && (
          <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
              Routing
            </p>

            <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
              Detected specialties
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#62756c]">
              Specialties identified from the uploaded
              report.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {specialties.map(
                (specialty, index) => (
                  <span
                    key={`${getSpecialtyName(
                      specialty,
                    )}-${index}`}
                    className="rounded-full bg-[#edf5ef] px-4 py-2 text-sm font-bold text-[#39735c]"
                  >
                    {getSpecialtyName(
                      specialty,
                    )}
                  </span>
                ),
              )}
            </div>
          </section>
        )}

        {/* Findings */}
        <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
            Report interpretation
          </p>

          <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
            Findings
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#62756c]">
            Structured findings extracted from the
            saved report.
          </p>

          {findings.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#f7faf8] p-5 text-sm text-[#687c77]">
              No structured findings were recorded for
              this report.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {findings.map(
                (finding, index) => (
                  <div
                    key={`finding-${index}`}
                    className="rounded-2xl border border-[#e1eae5] bg-[#fbfdfb] p-4"
                  >
                    <div className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#39735c]" />

                      <p className="text-sm leading-7 text-[#415650]">
                        {getFindingText(
                          finding,
                        )}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* Measurements */}
        <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
            Structured data
          </p>

          <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
            Measurements
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#62756c]">
            Measurements and values identified in the
            uploaded report.
          </p>

          {measurements.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#f7faf8] p-5 text-sm text-[#687c77]">
              No structured measurements were recorded
              for this report.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {measurements.map(
                (measurement, index) => {
                  const data =
                    getMeasurementData(
                      measurement,
                    )

                  return (
                    <div
                      key={`measurement-${index}`}
                      className="rounded-2xl border border-[#e1eae5] bg-[#fbfdfb] p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-[#829290]">
                        {data.name}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-[#173d32]">
                        {formatValue(
                          data.value,
                        )}

                        {data.unit && (
                          <span className="ml-1 text-sm font-semibold text-[#71847a]">
                            {data.unit}
                          </span>
                        )}
                      </p>
                    </div>
                  )
                },
              )}
            </div>
          )}
        </section>

        {/* Provider directories */}
        <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf3ff] text-[#2563eb]">
              <Stethoscope size={22} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#829290]">
                Professional care
              </p>

              <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
                Provider options
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#62756c]">
                These links open external provider
                directories. Current doctors, profiles,
                availability, and appointment options are
                shown on the provider website.
              </p>
            </div>
          </div>

          {physicians.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-[#f7faf8] p-5 text-sm leading-6 text-[#687c77]">
              No provider directory information was saved
              with this report.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {physicians.map(
                (physician, index) => {
                  const data =
                    getProviderData(
                      physician,
                    )

                  return (
                    <article
                      key={`provider-${index}`}
                      className="rounded-2xl border border-[#dce8df] bg-[#f9fcfb] p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#829290]">
                        Official directory
                      </p>

                      <h3 className="heading mt-2 text-xl font-bold text-[#173d32]">
                        {data.providerName ||
                          data.name}
                      </h3>

                      <p className="mt-1 font-semibold text-[#0f766e]">
                        {data.specialty}
                      </p>

                      {data.location && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-[#52655d]">
                          <MapPin
                            size={16}
                            className="text-[#2563eb]"
                          />
                          {data.location}
                        </div>
                      )}

                      <p className="mt-4 text-sm leading-6 text-[#687c77]">
                        Open the official provider directory
                        to view current doctors and appointment
                        information.
                      </p>

                      {data.bookingUrl && (
                        <a
                          href={data.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 block rounded-xl bg-[#0f766e] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0b5f59]"
                        >
                          View Doctors & Availability
                        </a>
                      )}
                    </article>
                  )
                },
              )}
            </div>
          )}
        </section>

        <div className="mt-8">
          <RiskNotice />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-[1.7rem] border border-[#dce8df] bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829290]">
        {label}
      </p>

      <div className="mt-3 flex items-center gap-3">
        {Icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf5ef] text-[#39735c]">
            <Icon size={19} />
          </div>
        )}

        <p className="break-words font-bold text-[#173d32]">
          {value}
        </p>
      </div>
    </div>
  )
}