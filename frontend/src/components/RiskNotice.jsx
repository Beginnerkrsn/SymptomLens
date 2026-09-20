import { AlertTriangle } from 'lucide-react'

export default function RiskNotice() {
  return (
    <aside
      aria-label="Medical safety notice"
      className="rounded-[1.5rem] border border-[#f0d7a9] bg-[#fff8e9] p-5 text-[#755c2c]"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0c9] text-[#927340]">
          <AlertTriangle size={19} />
        </div>

        <div className="min-w-0">
          <p className="font-bold">
            Important health information notice
          </p>

          <p className="mt-1 text-sm leading-6">
            SymptomLens provides educational,
            model-generated information. Its outputs may be
            incomplete or incorrect and are not a medical
            diagnosis or treatment recommendation.
          </p>

          <p className="mt-2 text-sm font-semibold leading-6">
            Seek professional medical advice for serious,
            severe, or worsening symptoms.
          </p>
        </div>
      </div>
    </aside>
  )
}