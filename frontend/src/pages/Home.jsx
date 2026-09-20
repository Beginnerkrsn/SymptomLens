import {
  Activity,
  ArrowRight,
  Brain,
  ClipboardList,
  FileText,
  ImageUp,
  LogIn,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import RiskNotice from '../components/RiskNotice'
import { useAuth } from '../context/useAuth.js'

const steps = [
  {
    number: '01',
    title: 'Describe',
    text: 'Write your symptoms naturally, just as you would explain them to a clinician.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Analyze',
    text: 'A trained model compares your description with example health records.',
    icon: Brain,
  },
  {
    number: '03',
    title: 'Explore',
    text: 'Review model-generated possibilities with supporting context and safety guidance.',
    icon: ShieldCheck,
  },
]

const exploreOptions = [
  {
    icon: Stethoscope,
    title: 'Describe Your Symptoms',
    text: 'Explain what you are experiencing in natural language and explore model-generated possibilities.',
    link: '/diagnosis',
    button: 'Describe Symptoms',
  },
  {
    icon: ClipboardList,
    title: 'Understand Medical Reports',
    text: 'Upload a medical report and review extracted findings, measurements, and specialty information.',
    link: '/medical-analysis',
    button: 'Analyze Report',
  },
  {
    icon: ImageUp,
    title: 'Explore Your X-Ray',
    text: 'Upload a chest X-ray and view the model-generated pneumonia-related pattern finding.',
    link: '/xray-analysis',
    button: 'Analyze X-Ray',
  },
]

const exampleResults = [
  ['Possible condition', 'Malaria', '82%'],
  ['Possible condition', 'Dengue', '11%'],
  ['Possible condition', 'Typhoid', '7%'],
]

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <div className="mesh-background min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#d8e6dc] bg-[#f8fbf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="SymptomLens home"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173d32] text-white shadow-sm">
              <Activity size={20} />
            </span>

            <span className="heading text-xl font-bold text-[#173d32]">
              Symptom
              <span className="text-[#da7d43]">
                Lens
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated && !isLoading && (
              <Link
                to="/login"
                className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-[#173d32] transition hover:bg-white sm:inline-flex"
              >
                Log in
              </Link>
            )}

            <Link
              to={
                isAuthenticated
                  ? '/dashboard'
                  : '/register'
              }
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173d32] px-5 py-2.5 text-sm font-bold !text-white shadow-lg shadow-[#173d32]/20 transition hover:bg-[#285847]"
            >
              {isAuthenticated ? (
                <ArrowRight size={17} />
              ) : (
                <LogIn size={17} />
              )}

              {isLoading
                ? 'Checking session...'
                : isAuthenticated
                  ? 'Open Dashboard'
                  : 'Get started'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-20 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-28">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-[#bad5c0] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#39735c]">
            AI-assisted health information
          </p>

          <h1 className="heading max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.05em] text-[#173d32] sm:text-7xl">
            Understand your health information.{' '}
            <span className="text-[#da7d43]">
              Ask better questions.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-[#52655d]">
            Explore symptoms, medical reports, and chest X-rays
            through model-generated health information designed
            to help you understand what to discuss with a
            healthcare professional.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to={
                isAuthenticated
                  ? '/diagnosis'
                  : '/login'
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#173d32] px-6 py-3.5 font-bold !text-white shadow-xl shadow-[#173d32]/20 transition hover:bg-[#285847]"
            >
              Start Analysis
              <ArrowRight size={18} />
            </Link>

            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#9fbdaa] bg-white px-6 py-3.5 font-bold !text-[#173d32] shadow-sm transition hover:border-[#39735c] hover:bg-[#f8fbf8]"
              >
                Create Account
                <ArrowRight size={18} />
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#9fbdaa] bg-white px-6 py-3.5 font-bold !text-[#173d32] shadow-sm transition hover:border-[#39735c] hover:bg-[#f8fbf8]"
              >
                Dashboard
                <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {isAuthenticated && (
            <p className="mt-4 text-sm font-semibold text-[#39735c]">
              Welcome back, {user?.name || 'there'}.
            </p>
          )}
        </div>

        {/* Example Analysis */}
        <div className="relative">
          <div className="card-shadow rounded-[2rem] border border-white/80 bg-white/85 p-5 backdrop-blur">
            <div className="rounded-[1.5rem] bg-[#173d32] p-7 text-white">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-[#b8d8c1]">
                  Example symptom analysis
                </span>

                <span className="rounded-full bg-[#da7d43] px-3 py-1 text-xs font-bold !text-white">
                  Educational
                </span>
              </div>

              <p className="mt-8 text-sm leading-6 text-[#d6e7da]">
                “Fever, headache, chills and body aches
                for two days.”
              </p>

              <div className="mt-8 space-y-3">
                {exampleResults.map(
                  ([label, condition, score]) => (
                    <div
                      key={condition}
                      className="rounded-2xl bg-white/10 p-4"
                    >
                      <div className="flex justify-between text-xs text-[#c9e0cf]">
                        <span>{label}</span>
                        <span>Model score: {score}</span>
                      </div>

                      <p className="mt-1 font-bold">
                        {condition}
                      </p>

                      <div className="mt-3 h-1.5 rounded-full bg-white/15">
                        <div
                          className="h-1.5 rounded-full bg-[#f0b477]"
                          style={{
                            width: score,
                          }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>

              <p className="mt-6 text-xs leading-5 text-[#b8d8c1]">
                Example only. Model scores are not medical
                probabilities, diagnoses, or treatment advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety / Trust Strip */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-3 rounded-[1.7rem] border border-[#d9e7dc] bg-white/75 p-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl px-4 py-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f4eb] text-[#39735c]">
              <Brain size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#173d32]">
                Model-generated
              </p>
              <p className="text-xs leading-5 text-[#71847a]">
                Results come from machine-learning models.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl px-4 py-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff1e8] text-[#da7d43]">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#173d32]">
                Not a diagnosis
              </p>
              <p className="text-xs leading-5 text-[#71847a]">
                Use the information as a starting point.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl px-4 py-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f4eb] text-[#39735c]">
              <Stethoscope size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#173d32]">
                Professional care matters
              </p>
              <p className="text-xs leading-5 text-[#71847a]">
                Seek clinical advice when appropriate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety + Steps */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <RiskNotice />

        <div className="mt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
              How it works
            </p>

            <h2 className="heading mt-3 text-3xl font-bold text-[#173d32] sm:text-4xl">
              From your information to a clearer conversation.
            </h2>

            <p className="mt-4 leading-7 text-[#62756c]">
              SymptomLens helps organize information so you
              can better understand what the model found and
              decide what you may want to discuss with a
              healthcare professional.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map(
              ({
                number,
                title,
                text,
                icon: Icon,
              }) => (
                <article
                  key={number}
                  className="rounded-3xl border border-[#d9e7dc] bg-white/70 p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="heading text-4xl font-bold text-[#da7d43]">
                      {number}
                    </span>

                    <Icon
                      size={22}
                      className="text-[#39735c]"
                    />
                  </div>

                  <h3 className="heading mt-8 text-2xl font-bold text-[#173d32]">
                    {title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#62756c]">
                    {text}
                  </p>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Understand What's Next */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-[#d9e7dc] bg-white/80 px-6 py-12 shadow-sm sm:px-10 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
              Explore SymptomLens
            </p>

            <h2 className="heading mt-3 text-3xl font-bold text-[#173d32] sm:text-4xl">
              Understand What's Next
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#62756c]">
              Organize your health information, understand
              what the model found, and know when it may be
              time to seek professional care.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {exploreOptions.map(
              ({
                icon: Icon,
                title,
                text,
                link,
                button,
              }) => (
                <article
                  key={title}
                  className="group flex h-full flex-col rounded-[1.7rem] border border-[#dce8df] bg-[#f8fbf8] p-6 transition hover:-translate-y-1 hover:border-[#b9d0be] hover:bg-white hover:shadow-lg"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f4eb] text-[#39735c] transition group-hover:bg-[#173d32] group-hover:text-white">
                    <Icon size={23} />
                  </div>

                  <h3 className="heading mt-6 text-xl font-bold text-[#173d32]">
                    {title}
                  </h3>

                  <p className="mt-3 flex-1 leading-7 text-[#62756c]">
                    {text}
                  </p>

                  <Link
                    to={isAuthenticated ? link : '/login'}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#39735c] transition hover:text-[#173d32]"
                  >
                    {isAuthenticated
                      ? button
                      : 'Log in to explore'}
                    <ArrowRight size={16} />
                  </Link>
                </article>
              ),
            )}
          </div>

          <div className="mt-10 text-center">
            <p className="text-lg font-bold text-[#173d32]">
              Understand the information.
            </p>

            <p className="mt-1 text-[#62756c]">
              Know the next step. Talk to a professional when you need one.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d8e6dc] bg-[#173d32]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/"
              className="heading text-lg font-bold text-white"
            >
              Symptom
              <span className="text-[#f0b477]">
                Lens
              </span>
            </Link>

            <p className="mt-1 text-xs leading-5 text-[#b8d8c1]">
              Health information and model-assisted exploration.
            </p>
          </div>

          <p className="max-w-xl text-xs leading-5 text-[#b8d8c1] sm:text-right">
            SymptomLens provides model-generated information
            for educational and informational purposes. It does
            not replace professional medical advice, diagnosis,
            or treatment.
          </p>
        </div>
      </footer>
    </div>
  )
}