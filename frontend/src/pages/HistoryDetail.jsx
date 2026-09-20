import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Home,
  LoaderCircle,
  RotateCcw,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import RiskNotice from '../components/RiskNotice'
import { getPrediction } from '../services/predictionService'

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

export default function HistoryDetail() {
  const { predictionId } = useParams()

  const [prediction, setPrediction] =
    useState(null)

  const [loading, setLoading] =
    useState(Boolean(predictionId))

  const [error, setError] =
    useState(
      predictionId
        ? ''
        : 'No analysis identifier was provided.',
    )

  useEffect(() => {
    if (!predictionId) {
      return
    }

    let mounted = true

    async function loadPrediction() {
      try {
        setLoading(true)
        setError('')

        const result =
          await getPrediction(predictionId)

        if (!mounted) {
          return
        }

        setPrediction(result)
      } catch (requestError) {
        console.error(
          'Unable to load prediction:',
          requestError,
        )

        if (!mounted) {
          return
        }

        const detail =
          requestError?.response?.data?.detail

        if (typeof detail === 'string') {
          setError(detail)
        } else if (
          requestError?.request &&
          !requestError?.response
        ) {
          setError(
            'Unable to connect to the SymptomLens server.',
          )
        } else {
          setError(
            'Unable to load this saved analysis.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadPrediction()

    return () => {
      mounted = false
    }
  }, [predictionId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-[2rem] border border-[#dce8df] bg-white p-10 text-center shadow-sm">
          <LoaderCircle
            size={32}
            className="mx-auto animate-spin text-[#39735c]"
          />

          <h1 className="heading mt-5 text-2xl font-bold text-[#173d32]">
            Loading saved analysis
          </h1>

          <p className="mt-2 text-sm text-[#6f817e]">
            Retrieving the saved record.
          </p>
        </div>
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-[2rem] border border-[#efcfca] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff4f2] text-[#aa4934]">
            <AlertTriangle size={28} />
          </div>

          <h1 className="heading mt-5 text-3xl font-bold text-[#173d32]">
            Analysis not found
          </h1>

          <p className="mx-auto mt-3 max-w-xl leading-7 text-[#6f817e]">
            {error ||
              'The requested saved analysis could not be found.'}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-5 py-3 font-bold text-white transition hover:bg-[#285847]"
            >
              <ArrowLeft size={17} />
              Back to History
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-5 py-3 font-bold text-[#39735c] transition hover:border-[#39735c]"
            >
              <Home size={17} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const predictions = Array.isArray(
    prediction.predictions,
  )
    ? prediction.predictions
    : []

  const score =
    formatScore(prediction.top_score)

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-bold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c]"
        >
          <ArrowLeft size={17} />
          Back to History
        </Link>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-bold text-[#62756c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c]"
        >
          <Home size={17} />
          Dashboard
        </Link>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#da7d43]">
          Saved Analysis
        </p>

        <h1 className="heading mt-3 text-4xl font-bold tracking-tight text-[#173d32] sm:text-5xl">
          Analysis Details
        </h1>

        <p className="mt-3 text-sm text-[#7c8f8d]">
          Saved on {formatDate(prediction.created_at)}
        </p>
      </div>

      {/* Input */}
      <section className="mt-8 rounded-[2rem] border border-[#dce7e5] bg-white p-7 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf1ff] text-[#2563eb]">
            <Brain size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#829290]">
              Submitted symptoms
            </p>

            <p className="mt-3 break-words leading-8 text-[#284947]">
              {prediction.input_text}
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Top model possibility"
          value={
            prediction.top_condition ||
            'Not available'
          }
        />

        <SummaryCard
          label="Model score"
          value={score || 'Not available'}
        />

        <SummaryCard
          label="Confidence level"
          value={
            prediction.confidence_level ||
            'Unknown'
          }
        />

        <SummaryCard
          label="Status"
          value={
            prediction.status ||
            'Unknown'
          }
        />
      </section>

      {/* Ranked predictions */}
      {predictions.length > 0 && (
        <section className="mt-5 rounded-[2rem] border border-[#dce7e5] bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="heading text-2xl font-bold text-[#173d32]">
                Ranked Model Predictions
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6f817e]">
                These are model outputs based on the submitted
                symptom description. They are not medical diagnoses.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#829290]">
              <RotateCcw size={14} />
              Saved result
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {predictions.map(
              (item, index) => {
                const itemScore =
                  typeof item?.score === 'number'
                    ? item.score
                    : typeof item?.confidence === 'number'
                      ? item.confidence
                      : null

                return (
                  <div
                    key={`${item?.condition || 'prediction'}-${index}`}
                    className={`rounded-2xl border p-5 ${
                      index === 0
                        ? 'border-[#b9d7c4] bg-[#f5faf6]'
                        : 'border-[#e2ebe9] bg-[#f8fbfa]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#829290]">
                          Rank {index + 1}
                        </p>

                        <p className="mt-1 break-words text-lg font-bold text-[#102a2a]">
                          {item?.condition ||
                            'Unknown condition'}
                        </p>
                      </div>

                      {itemScore !== null && (
                        <span className="shrink-0 rounded-full bg-[#e8f8f5] px-3 py-1.5 text-sm font-bold text-[#0f766e]">
                          {(itemScore * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              },
            )}
          </div>
        </section>
      )}

      <div className="mt-8">
        <RiskNotice />
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#dce7e5] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#829290]">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-bold text-[#102a2a]">
        {value}
      </p>
    </div>
  )
}