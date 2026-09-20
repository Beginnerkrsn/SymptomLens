import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Home,
  RotateCcw,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import RiskNotice from '../components/RiskNotice'

function readLatestPrediction() {
  const storageKeys = [
    'latest_prediction',
    'latest_symptom_analysis',
  ]

  for (const key of storageKeys) {
    try {
      const saved =
        sessionStorage.getItem(key)

      if (!saved) {
        continue
      }

      const parsed = JSON.parse(saved)

      if (
        parsed &&
        typeof parsed === 'object'
      ) {
        return parsed
      }
    } catch (error) {
      console.error(
        `Unable to read ${key}:`,
        error,
      )
    }
  }

  return null
}

function formatScore(value) {
  const number = Number(value)

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return '0.0'
  }

  return Math.min(number, 100).toFixed(1)
}

function getScoreWidth(value) {
  const number = Number(value)

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return 0
  }

  return Math.min(number, 100)
}

export default function Results() {
  const navigate = useNavigate()
  const result = readLatestPrediction()

  if (!result) {
    return (
      <div className="min-h-screen bg-[#f3f7f4]">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
            >
              <Home size={17} />
              Dashboard
            </Link>

            <Link
              to="/diagnosis"
              className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#62756c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
            >
              <ArrowLeft size={17} />
              Symptom Analysis
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
              No symptom analysis found
            </h1>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-[#62756c]">
              Start a symptom analysis first. Your latest
              completed result will appear here.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/diagnosis"
                className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-6 py-3 font-bold text-white transition hover:bg-[#285847]"
              >
                Analyze Symptoms
                <ArrowRight size={18} />
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
      </div>
    )
  }

  const predictions = Array.isArray(
    result.predictions,
  )
    ? result.predictions
    : []

  const topPrediction =
    result.top_prediction ||
    predictions[0] ||
    null

  const confidence =
    result.confidence_level ||
    'unknown'

  const insufficientMedicalInput =
    result.status ===
    'insufficient_medical_input'

  const insufficientSymptomDetail =
    result.status ===
    'insufficient_symptom_detail'

  const needsMoreInformation =
    insufficientMedicalInput ||
    insufficientSymptomDetail

  function startNewAnalysis() {
    sessionStorage.removeItem(
      'latest_prediction',
    )

    sessionStorage.removeItem(
      'latest_symptom_analysis',
    )

    navigate('/diagnosis')
  }

  const topScore =
    topPrediction?.percentage ?? 0

  return (
    <div className="min-h-screen bg-[#f3f7f4]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        {/* Navigation */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#39735c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
          >
            <Home size={17} />
            Dashboard
          </Link>

          <Link
            to="/history"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#62756c] shadow-sm transition hover:-translate-y-0.5 hover:border-[#39735c] hover:text-[#173d32]"
          >
            Analysis History
          </Link>
        </div>

        {/* Heading */}
        <section>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
            Symptom Analysis
          </p>

          <h1 className="heading mt-3 text-4xl font-bold tracking-[-0.03em] text-[#173d32] sm:text-5xl">
            Model Results
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-[#62756c]">
            Review the model-generated possibilities from
            your symptom description. These results are
            informational and are not a medical diagnosis.
          </p>
        </section>

        {/* Your input */}
        <section className="mt-10 rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf5ef] text-[#39735c]">
              <Brain size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#829290]">
                Your symptom description
              </p>

              <p className="mt-3 break-words leading-7 text-[#173d32]">
                {result.input_text ||
                  'Symptom description unavailable.'}
              </p>
            </div>
          </div>
        </section>

        {/* More information */}
        {needsMoreInformation ? (
          <section className="mt-6 rounded-[2rem] border border-[#f0d7a9] bg-[#fff8e9] p-7 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff0c9] text-[#755c2c]">
                <AlertTriangle size={22} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#927340]">
                  More information needed
                </p>

                <h2 className="heading mt-2 text-2xl font-bold text-[#755c2c]">
                  Please describe your symptoms in more detail
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-[#755c2c]">
                  {result.message ||
                    'Please add more detail about what you are experiencing before running the model again.'}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={startNewAnalysis}
                    className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-5 py-3 font-bold text-white transition hover:bg-[#285847]"
                  >
                    <ArrowLeft size={17} />
                    Add More Symptoms
                  </button>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full border border-[#ddcfad] bg-white px-5 py-3 font-bold text-[#755c2c] transition hover:border-[#755c2c]"
                  >
                    <Home size={17} />
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Top prediction */}
            {topPrediction && (
              <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#829290]">
                      Top model possibility
                    </p>

                    <h2 className="heading mt-2 break-words text-3xl font-bold text-[#173d32] sm:text-4xl">
                      {topPrediction.condition ||
                        'No condition label available'}
                    </h2>

                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#39735c]">
                      <CheckCircle2 size={17} />
                      Confidence level: {confidence}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-[#edf5ef] px-6 py-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#7a8b83]">
                      Model score
                    </p>

                    <p className="mt-1 text-3xl font-bold text-[#173d32]">
                      {formatScore(
                        topScore,
                      )}
                      %
                    </p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#7a8b83]">
                    <span>Model score</span>
                    <span>
                      {formatScore(topScore)}%
                    </span>
                  </div>

                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e7eee9]">
                    <div
                      className="h-full rounded-full bg-[#39735c] transition-all duration-700"
                      style={{
                        width: `${getScoreWidth(
                          topScore,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="mt-5 text-xs leading-5 text-[#7a8b83]">
                  This percentage represents the model's
                  score for this output. It is not the
                  probability that you have the condition.
                </p>
              </section>
            )}

            {/* Ranked possibilities */}
            <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-7 shadow-sm sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#da7d43]">
                  Model output
                </p>

                <h2 className="heading mt-2 text-2xl font-bold text-[#173d32]">
                  Ranked model possibilities
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#62756c]">
                  These entries are ranked according to the
                  model output for the submitted text.
                </p>
              </div>

              {predictions.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {predictions.map(
                    (prediction, index) => (
                      <div
                        key={`${prediction.condition || 'prediction'}-${index}`}
                        className={`rounded-2xl border p-5 ${
                          index === 0
                            ? 'border-[#b9d7c4] bg-[#f5faf6]'
                            : 'border-[#e4ece6] bg-[#fbfdfb]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <span
                              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${
                                index === 0
                                  ? 'bg-[#173d32] text-white'
                                  : 'bg-[#edf5ef] text-[#39735c]'
                              }`}
                            >
                              {index + 1}
                            </span>

                            <p className="break-words pt-1 font-semibold text-[#173d32]">
                              {prediction.condition ||
                                'Unknown possibility'}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#39735c] shadow-sm">
                            {formatScore(
                              prediction.percentage,
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7eee9]">
                          <div
                            className={`h-full rounded-full ${
                              index === 0
                                ? 'bg-[#39735c]'
                                : 'bg-[#9fbcaa]'
                            }`}
                            style={{
                              width: `${getScoreWidth(
                                prediction.percentage,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-[#f7faf8] p-5 text-sm leading-6 text-[#62756c]">
                  No ranked model possibilities were
                  returned for this analysis.
                </div>
              )}
            </section>
          </>
        )}

        {/* Safety */}
        <div className="mt-8">
          <RiskNotice />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startNewAnalysis}
            className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-5 py-3 font-bold text-white transition hover:bg-[#285847]"
          >
            <RotateCcw size={17} />
            New Symptom Analysis
          </button>

          <Link
            to="/history"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-5 py-3 font-bold text-[#39735c] transition hover:border-[#39735c] hover:text-[#173d32]"
          >
            View Analysis History
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#dce8df] bg-white px-5 py-3 font-bold text-[#62756c] transition hover:border-[#39735c]"
          >
            <Home size={17} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}