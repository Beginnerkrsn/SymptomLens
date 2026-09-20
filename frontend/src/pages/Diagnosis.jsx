import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  Sparkles,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import RiskNotice from '../components/RiskNotice'
import { analyzeSymptoms } from '../services/predictionService'

const examples = [
  'I am getting very tired and having stomach pain',
  'My head hurts badly and I feel like vomiting',
  'I have been coughing a lot since yesterday',
]

export default function Diagnosis() {
  const navigate = useNavigate()

  const [symptoms, setSymptoms] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleExample(example) {
    setSymptoms(example)
    setError('')
  }

  function updateSymptoms(event) {
    setSymptoms(event.target.value)
    setError('')
  }

  function clearSymptoms() {
    setSymptoms('')
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedSymptoms = symptoms.trim()

    if (normalizedSymptoms.length < 5) {
      setError(
        'Please tell us a little more about what you are feeling.',
      )
      return
    }

    setLoading(true)
    setError('')

    sessionStorage.removeItem('latest_prediction')
    sessionStorage.removeItem('latest_symptom_analysis')

    try {
      const result = await analyzeSymptoms({
        text: normalizedSymptoms,
      })

      sessionStorage.setItem(
        'latest_prediction',
        JSON.stringify(result),
      )

      navigate('/results')
    } catch (requestError) {
      console.error(
        'Symptom analysis failed:',
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
          'The analysis could not be completed. Please try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f7f4]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        {/* Back */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
          >
            <ArrowRight
              size={17}
              className="rotate-180"
            />
            Back to Dashboard
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e9f4eb] text-[#39735c]">
            <MessageCircle size={27} />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
            Symptom Analysis
          </p>

          <h1 className="heading mt-3 text-4xl font-bold tracking-[-0.04em] text-[#173d32] sm:text-5xl">
            Tell us what you're feeling.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#62756c]">
            Use your own words. You do not need to know
            medical terminology or describe your symptoms
            perfectly.
          </p>
        </div>

        {/* Main Input */}
        <section className="mt-10 rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#173d32] text-white">
              <Sparkles size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="heading text-xl font-bold text-[#173d32]">
                Describe your symptoms naturally
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#7a8b83]">
                Write it the same way you would explain it
                to a friend or doctor.
              </p>
            </div>

            {symptoms && !loading && (
              <button
                type="button"
                onClick={clearSymptoms}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#dce8df] bg-white text-[#71847a] transition hover:border-[#d77b5a] hover:text-[#b84f32]"
                aria-label="Clear symptom description"
                title="Clear"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-7"
            aria-busy={loading}
          >
            <label
              htmlFor="symptoms"
              className="sr-only"
            >
              Describe your symptoms
            </label>

            <textarea
              id="symptoms"
              name="symptoms"
              value={symptoms}
              onChange={updateSymptoms}
              placeholder="For example: I've been feeling very tired and my stomach has been hurting since yesterday..."
              rows={7}
              maxLength={5000}
              disabled={loading}
              className="w-full resize-none rounded-[1.5rem] border border-[#cbdcd0] bg-[#f8fbf8] px-5 py-4 text-base leading-7 text-[#173d32] outline-none transition placeholder:text-[#9aacA1] focus:border-[#39735c] focus:bg-white focus:ring-4 focus:ring-[#39735c]/10 disabled:cursor-not-allowed disabled:opacity-70"
            />

            <div className="mt-3 flex items-start justify-between gap-3 text-xs text-[#8b9c94]">
              <span className="leading-5">
                You can describe symptoms, timing, severity,
                or anything else you've noticed.
              </span>

              <span className="shrink-0">
                {symptoms.length}/5000
              </span>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f1c9bd] bg-[#fff4f0] p-4 text-sm leading-6 text-[#9c4935]"
              >
                <AlertTriangle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                symptoms.trim().length < 5
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#173d32] px-6 py-4 font-bold !text-white shadow-lg shadow-[#173d32]/15 transition hover:bg-[#285847] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                  Understanding your symptoms...
                </>
              ) : (
                <>
                  Analyze My Symptoms
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>
        </section>

        {/* Examples */}
        <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff3e5] text-[#da7d43]">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <h2 className="heading text-lg font-bold text-[#173d32]">
                Not sure what to write?
              </h2>

              <p className="text-sm text-[#7a8b83]">
                Try one of these natural examples.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExample(example)}
                disabled={loading}
                className="block w-full rounded-2xl border border-[#dce8df] bg-[#f8fbf8] p-4 text-left text-sm leading-6 text-[#52655d] transition hover:border-[#39735c] hover:bg-[#f1f8f2] disabled:cursor-not-allowed disabled:opacity-60"
              >
                "{example}"
              </button>
            ))}
          </div>
        </section>

        {/* What happens */}
        <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-[#edf5ef] p-6 sm:p-7">
          <h2 className="heading text-xl font-bold text-[#173d32]">
            What happens after you submit?
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#da7d43]">
                01
              </p>

              <p className="mt-2 font-semibold text-[#173d32]">
                We read your wording
              </p>

              <p className="mt-2 text-sm leading-6 text-[#62756c]">
                Everyday expressions such as "tummy pain"
                or "feeling exhausted" are interpreted into
                useful symptom terms.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#da7d43]">
                02
              </p>

              <p className="mt-2 font-semibold text-[#173d32]">
                The model analyzes it
              </p>

              <p className="mt-2 text-sm leading-6 text-[#62756c]">
                Your description is processed by the trained
                symptom classification model.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#da7d43]">
                03
              </p>

              <p className="mt-2 font-semibold text-[#173d32]">
                You see ranked possibilities
              </p>

              <p className="mt-2 text-sm leading-6 text-[#62756c]">
                Results are shown as model-generated
                possibilities, not as a medical diagnosis.
              </p>
            </div>
          </div>
        </section>

        {/* Safety */}
        <div className="mt-8">
          <RiskNotice />
        </div>
      </div>
    </div>
  )
}