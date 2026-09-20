import {
  ArrowLeft,
  ArrowRight,
  FileSearch,
  LoaderCircle,
  MapPin,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import MedicalFileUpload from '../components/MedicalFileUpload'
import RiskNotice from '../components/RiskNotice'
import { analyzeMedicalReport } from '../services/medicalAnalysisService'

export default function MedicalAnalysis() {
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [location, setLocation] = useState('Nellore')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!file) {
      setError('Please upload a medical report.')
      return
    }

    try {
      setLoading(true)

      sessionStorage.removeItem(
        'latest_medical_analysis',
      )

      const result = await analyzeMedicalReport({
        file,
        location,
      })

      if (!result || typeof result !== 'object') {
        throw new Error(
          'The server returned an invalid medical analysis response.',
        )
      }

      sessionStorage.setItem(
        'latest_medical_analysis',
        JSON.stringify(result),
      )

      navigate('/physician-results')
    } catch (requestError) {
      console.error(
        'Medical report analysis failed:',
        requestError,
      )

      const detail =
        requestError?.response?.data?.detail

      if (
        typeof detail === 'string' &&
        detail.trim()
      ) {
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
          requestError?.message ||
            'Unable to analyze the report. Please try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
          Medical Report Analysis
        </p>

        <h1 className="heading mt-3 text-4xl font-bold text-[#173d32] sm:text-5xl">
          Upload your medical report
        </h1>

        <p className="mt-4 max-w-3xl leading-7 text-[#62756c]">
          Upload a PDF, JPG, or PNG report to explore
          extracted findings, specialty routing, and
          official healthcare provider directories.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-xl transition-shadow duration-300 hover:shadow-2xl sm:p-9"
        aria-busy={loading}
      >
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f4eb] text-[#39735c]">
            <FileSearch size={24} />
          </div>

          <div>
            <h2 className="font-bold text-[#173d32]">
              Medical Document
            </h2>

            <p className="text-sm text-[#71847a]">
              PDF, JPG or PNG · Maximum 10 MB
            </p>
          </div>
        </div>

        <MedicalFileUpload
          selectedFile={file}
          onFileSelected={setFile}
          disabled={loading}
        />

        <div className="mt-7">
          <label
            htmlFor="location"
            className="text-sm font-bold text-[#173d32]"
          >
            Provider search location
          </label>

          <div className="relative mt-3">
            <MapPin
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39735c]"
            />

            <input
              id="location"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              disabled={loading}
              autoComplete="address-level2"
              className="w-full rounded-2xl border border-[#cfddd2] bg-[#f8fbf8] py-3.5 pl-11 pr-4 outline-none transition focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Example: Nellore"
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-[#7a8b83]">
            This location is used to open official provider
            directories. It does not change the medical
            report analysis itself.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-5 rounded-2xl border border-[#f0d2d2] bg-[#fff4f4] p-4 text-sm font-semibold leading-6 text-[#8a4141]"
          >
            {error}
          </div>
        )}

        <div className="mt-7">
          <RiskNotice />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#173d32] px-6 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#285847] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
              Analyzing report...
            </>
          ) : (
            <>
              Analyze Report
              <ArrowRight size={19} />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
