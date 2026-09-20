import {
  MapPin,
  Stethoscope,
} from 'lucide-react'

export default function PhysicianCard({
  physician,
}) {
  const providerName =
    physician?.provider_name ||
    'Healthcare Provider'

  const specialty =
    physician?.specialty ||
    'Medical Specialty'

  const city =
    physician?.city ||
    null

  const bookingUrl =
    physician?.booking_url ||
    physician?.profile_url ||
    null

  return (
    <article className="rounded-[1.7rem] border border-[#dce7e5] bg-[#f9fcfb] p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex min-w-0 gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e8f8f5] text-[#0f766e]">
            <Stethoscope size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#899b98]">
              Healthcare Provider
            </p>

            <h3 className="heading mt-1 break-words text-xl font-bold text-[#102a2a]">
              {providerName}
            </h3>

            <p className="mt-1 font-semibold text-[#0f766e]">
              Find {specialty} doctors
            </p>
          </div>
        </div>

      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        <div className="rounded-xl bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#849693]">
            Specialty
          </p>

          <p className="mt-1 text-sm font-bold text-[#284947]">
            {specialty}
          </p>
        </div>

        {city && (
          <div className="rounded-xl bg-white p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#849693]">
              Location
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <MapPin
                size={15}
                className="text-[#2563eb]"
              />

              <p className="text-sm font-bold text-[#284947]">
                {city}
              </p>
            </div>
          </div>
        )}

      </div>

      <div className="mt-5 rounded-xl border border-[#dce8df] bg-white p-4">
        <p className="text-sm leading-6 text-[#58716e]">
          View the provider's official directory for current doctors,
          profiles, availability, and appointment options.
        </p>
      </div>

      {bookingUrl && (
        <div className="mt-5">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-[#0f766e] px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-[#0b5f59] focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:ring-offset-2"
          >
            View Doctors & Availability
          </a>
        </div>
      )}

      {physician?.provider_name && (
        <p className="mt-3 text-center text-[11px] leading-5 text-[#62756c]">
          Opens the official {providerName} directory
        </p>
      )}
    </article>
  )
}