import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Home,
  MapPin,
  Search,
  Stethoscope,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import PhysicianCard from '../components/PhysicianCard'
import RiskNotice from '../components/RiskNotice'

const SPECIALTY_SLUGS = {
  cardiology: 'cardiologist',
  nephrology: 'nephrologist',
  gastroenterology: 'gastroenterologist',
  neurology: 'neurologist',
  orthopedics: 'orthopedist',
  ophthalmology: 'ophthalmologist',
  pulmonology: 'pulmonologist',
  dermatology: 'dermatologist',
  endocrinology: 'endocrinologist',
  gynecology: 'gynecologist',
  'general medicine': 'general-physician',
}

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function buildProviderUrl(
  providerName,
  specialty,
  location,
) {
  const city = location
    .trim()
    .split(',')[0]
    .trim()

  if (!city) {
    return null
  }

  const citySlug = city
    .toLowerCase()
    .replace(/\s+/g, '-')

  const specialtyKey = normalize(
    specialty,
  )

  const specialtySlug =
    SPECIALTY_SLUGS[specialtyKey] ||
    specialtyKey.replace(/\s+/g, '-')

  const provider = normalize(providerName)

  if (provider.includes('practo')) {
    return `https://www.practo.com/${citySlug}/${specialtySlug}`
  }

  if (provider.includes('apollo')) {
    return `https://www.apollo247.com/doctors/${specialtySlug}s-in-${citySlug}-scity`
  }

  return null
}

export default function PhysicianResults() {
  const [location, setLocation] =
    useState('Nellore')

  const [searchedLocation, setSearchedLocation] =
    useState('Nellore')

  let result = null

  try {
    const saved = sessionStorage.getItem(
      'latest_medical_analysis',
    )

    if (saved) {
      result = JSON.parse(saved)
    }
  } catch (error) {
    console.error(
      'Failed to read medical analysis result:',
      error,
    )
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
          >
            <Home size={17} />
            Dashboard
          </Link>

          <Link
            to="/medical-analysis"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#62756c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
          >
            <ArrowLeft size={17} />
            Medical Analysis
          </Link>
        </div>

        <section className="rounded-[2rem] border border-[#dce8df] bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff8e9] text-[#da7d43]">
            <AlertTriangle size={28} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
            No saved result
          </p>

          <h1 className="heading mt-2 text-3xl font-bold text-[#173d32]">
            No analysis result found
          </h1>

          <p className="mx-auto mt-3 max-w-xl leading-7 text-[#62756c]">
            Upload a medical report first to generate an
            analysis and provider-directory options.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/medical-analysis"
              className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-6 py-3 font-bold text-white transition hover:bg-[#285847]"
            >
              <ArrowLeft size={18} />
              Upload Report
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-6 py-3 font-bold text-[#39735c] transition hover:border-[#39735c]"
            >
              <Home size={18} />
              Dashboard
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const physicians = Array.isArray(
    result.physicians,
  )
    ? result.physicians
    : []

  const specialties = Array.isArray(
    result.specialties,
  )
    ? result.specialties
    : []

  const findings = Array.isArray(
    result.findings,
  )
    ? result.findings
    : []

  const measurements = Array.isArray(
    result.measurements,
  )
    ? result.measurements
    : []

  const primarySpecialty =
    result.primary_specialty ||
    'Medical Specialty'

  const reportType =
    result.report_type ||
    'Medical Report'

  const confidenceLevel =
    result.confidence_level ||
    'unknown'

  const routingScore =
    typeof result.routing_score_percentage ===
    'number'
      ? result.routing_score_percentage
      : null

  const providerOptions =
    physicians.map((physician) => {
      const specialty =
        physician.specialty ||
        primarySpecialty

      const updatedUrl =
        buildProviderUrl(
          physician.provider_name,
          specialty,
          searchedLocation,
        )

      return {
        ...physician,
        city: searchedLocation,
        specialty,
        booking_url:
          updatedUrl ||
          physician.booking_url,
      }
    })

  function handleLocationSearch(event) {
    event.preventDefault()

    const cleanedLocation =
      location.trim()

    if (!cleanedLocation) {
      return
    }

    setSearchedLocation(
      cleanedLocation,
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
      {/* Navigation */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
        >
          <Home size={17} />
          Dashboard
        </Link>

        <Link
          to="/medical-analysis"
          className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#62756c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
        >
          <ArrowLeft size={17} />
          New Medical Analysis
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
          Medical Report Analysis
        </p>

        <h1 className="heading mt-3 text-4xl font-bold text-[#173d32] sm:text-5xl">
          Analysis Results
        </h1>

        <p className="mt-4 max-w-3xl leading-7 text-[#62756c]">
          Review the structured information extracted from
          your report, then explore official healthcare
          provider directories.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Report summary */}
          <section className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
                <FileText size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#829290]">
                  Uploaded report
                </p>

                <h2 className="heading mt-2 break-words text-2xl font-bold text-[#173d32]">
                  {result.file_name ||
                    'Medical Report'}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f4f8f5] px-3 py-1.5 text-xs font-bold text-[#52655d]">
                    {reportType}
                  </span>

                  <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-bold text-[#39735c]">
                    {primarySpecialty}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7faf8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                  Primary specialty
                </p>

                <p className="mt-2 font-bold text-[#173d32]">
                  {primarySpecialty}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7faf8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                  Confidence
                </p>

                <p className="mt-2 font-bold capitalize text-[#173d32]">
                  {confidenceLevel}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7faf8] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                  Routing score
                </p>

                <p className="mt-2 font-bold text-[#173d32]">
                  {routingScore !== null
                    ? `${routingScore.toFixed(1)}%`
                    : 'Not available'}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#7a8b83]">
              Routing score is an application-level evidence
              score, not a medical probability or diagnosis.
            </p>
          </section>

          {/* Specialties */}
          {specialties.length > 0 && (
            <section className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
                Routing
              </p>

              <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
                Specialty evidence
              </h2>

              <div className="mt-5 space-y-3">
                {specialties.map(
                  (item, index) => {
                    const name =
                      typeof item === 'string'
                        ? item
                        : item?.specialty ||
                          item?.name ||
                          'Specialty'

                    const percentage =
                      typeof item?.percentage ===
                      'number'
                        ? item.percentage
                        : null

                    return (
                      <div
                        key={`${name}-${index}`}
                        className="rounded-2xl border border-[#e4ece6] bg-[#fbfdfb] p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-[#173d32]">
                            {name}
                          </p>

                          {percentage !== null && (
                            <span className="text-sm font-bold text-[#39735c]">
                              {Number(
                                percentage,
                              ).toFixed(1)}
                              %
                            </span>
                          )}
                        </div>

                        {Array.isArray(
                          item?.evidence,
                        ) &&
                          item.evidence.length > 0 && (
                            <p className="mt-2 text-sm leading-6 text-[#62756c]">
                              Evidence:{' '}
                              {item.evidence.join(
                                ', ',
                              )}
                            </p>
                          )}
                      </div>
                    )
                  },
                )}
              </div>
            </section>
          )}

          {/* Findings */}
          {findings.length > 0 && (
            <section className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
                Report information
              </p>

              <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
                Key findings
              </h2>

              <div className="mt-5 space-y-3">
                {findings.map(
                  (finding, index) => (
                    <div
                      key={`${finding}-${index}`}
                      className="rounded-2xl bg-[#f7faf8] px-4 py-3 text-sm leading-7 text-[#52655d]"
                    >
                      {finding}
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          {/* Measurements */}
          {measurements.length > 0 && (
            <section className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
                Structured data
              </p>

              <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
                Measurements
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {measurements.map(
                  (measurement, index) => (
                    <div
                      key={`${measurement?.name || 'measurement'}-${index}`}
                      className="rounded-2xl bg-[#f7faf8] p-4"
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                        {measurement?.name ||
                          'Measurement'}
                      </p>

                      <p className="mt-2 text-xl font-bold text-[#173d32]">
                        {measurement?.value ??
                          measurement?.result ??
                          'Not available'}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <section className="rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
                <Stethoscope size={21} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829290]">
                  Professional care
                </p>

                <h2 className="heading mt-1 text-2xl font-bold text-[#173d32]">
                  Find a healthcare professional
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#62756c]">
              Search official provider directories for the
              specialty identified from the report.
            </p>

            {/* Location */}
            <form
              onSubmit={handleLocationSearch}
              className="mt-6 rounded-2xl border border-[#dce8df] bg-[#f7faf8] p-4"
            >
              <label
                htmlFor="provider-location"
                className="text-sm font-bold text-[#173d32]"
              >
                Location
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39735c]"
                  />

                  <input
                    id="provider-location"
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value,
                      )
                    }
                    placeholder="Example: Nellore"
                    className="w-full rounded-xl border border-[#cfded4] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#173d32] outline-none transition placeholder:text-[#9aaaA3] focus:border-[#39735c] focus:ring-2 focus:ring-[#39735c]/10"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173d32] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285847] focus:outline-none focus:ring-2 focus:ring-[#173d32] focus:ring-offset-2"
                >
                  <Search size={17} />
                  Search
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#7a8b83]">
                <span>
                  Showing directory links for
                </span>

                <span className="rounded-full bg-white px-3 py-1 font-bold text-[#39735c]">
                  {searchedLocation}
                </span>
              </div>
            </form>

            {/* Guidance */}
            <div className="mt-6 rounded-2xl border border-[#dce8df] bg-[#f4f8f5] p-5">
              <p className="text-sm font-bold text-[#173d32]">
                Important
              </p>

              <p className="mt-2 text-sm leading-6 text-[#52655d]">
                SymptomLens does not select or endorse a
                particular doctor. The links below open
                external provider directories where you
                can review current doctors, profiles,
                availability, and appointment options.
              </p>
            </div>

            {/* Providers */}
            {providerOptions.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-[#fff8e9] p-5 text-sm leading-6 text-[#755c2c]">
                No healthcare provider directories are
                available for this specialty.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {providerOptions.map(
                  (physician, index) => (
                    <PhysicianCard
                      key={
                        physician.provider_name ||
                        physician.name ||
                        index
                      }
                      physician={physician}
                    />
                  ),
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-[#edf1ee] pt-6">
              <Link
                to="/medical-history"
                className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-bold text-[#39735c] transition hover:border-[#39735c]"
              >
                <FileText size={16} />
                View Medical History
              </Link>

              <Link
                to="/medical-analysis"
                className="inline-flex items-center gap-2 rounded-full bg-[#da7d43] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#c86c35]"
              >
                Analyze Another Report
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8">
        <RiskNotice />
      </div>
    </div>
  )
}