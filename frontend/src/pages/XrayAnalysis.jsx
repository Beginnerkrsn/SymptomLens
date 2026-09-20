import {
  ArrowLeft,
  CheckCircle2,
  FileImage,
  ImageUp,
  LoaderCircle,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import RiskNotice from '../components/RiskNotice'
import { analyzeXray } from '../services/xrayService'

const MAX_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getFileType(file) {
  if (file.type === 'image/png') {
    return 'PNG Image'
  }

  if (file.type === 'image/jpeg') {
    return 'JPEG Image'
  }

  return 'Image File'
}

export default function XrayAnalysis() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleFile(event) {
    const nextFile = event.target.files?.[0]

    setError('')
    setResult(null)

    if (!nextFile) return

    if (!['image/jpeg', 'image/png'].includes(nextFile.type)) {
      setError('Please upload a JPG or PNG chest X-ray image.')
      return
    }

    if (nextFile.size > MAX_SIZE) {
      setError('X-ray image must be 10 MB or less.')
      return
    }

    setFile(nextFile)
  }

  function removeFile() {
    setFile(null)
    setResult(null)
    setError('')

    const input = document.getElementById('xray-file')

    if (input) {
      input.value = ''
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!file) {
      setError('Please choose a chest X-ray image.')
      return
    }

    setLoading(true)
    setError('')

    try {
      setResult(await analyzeXray(file))
    } catch (requestError) {
      setError(
        requestError?.response?.data?.detail ||
          'The X-ray analysis could not be completed.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#39735c] transition hover:text-[#173d32]"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>

      <div className="mt-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#da7d43]">
          Chest X-ray Analysis
        </p>

        <h1 className="heading mt-3 text-4xl font-bold text-[#173d32] sm:text-5xl">
          Upload a chest X-ray
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-[#62756c]">
          The model reports only a binary pneumonia-related pattern finding.
          It is not a diagnosis.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-xl sm:p-9"
      >
        {!file ? (
          <label
            htmlFor="xray-file"
            className="flex cursor-pointer flex-col items-center rounded-[1.5rem] border-2 border-dashed border-[#b9d0be] bg-[#f8fbf8] p-10 text-center transition hover:border-[#39735c] hover:bg-white"
          >
            <ImageUp
              size={34}
              className="text-[#39735c]"
            />

            <span className="mt-4 font-bold text-[#173d32]">
              Choose JPG or PNG
            </span>

            <span className="mt-2 text-sm text-[#71847a]">
              Maximum file size: 10 MB
            </span>

            <input
              id="xray-file"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFile}
              className="sr-only"
              disabled={loading}
            />
          </label>
        ) : (
          <div className="rounded-[1.5rem] border border-[#dce8df] bg-[#f8fbf8] p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e8f4eb] text-[#39735c]">
                <FileImage size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#899b92]">
                      Selected X-ray
                    </p>

                    <p className="mt-1 break-all text-base font-bold text-[#173d32]">
                      {file.name}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={loading}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#dce8df] bg-white text-[#71847a] transition hover:border-[#d77b5a] hover:text-[#b84f32] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove selected X-ray"
                    title="Remove file"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#39735c]">
                    {getFileType(file)}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#62756c]">
                    {formatFileSize(file.size)}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f4eb] px-3 py-1.5 text-xs font-bold text-[#39735c]">
                    <CheckCircle2 size={14} />
                    Ready to analyze
                  </span>
                </div>
              </div>
            </div>

            <label
              htmlFor="xray-file"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#39735c] transition hover:text-[#173d32]"
            >
              <ImageUp size={17} />
              Choose a different image
            </label>

            <input
              id="xray-file"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFile}
              className="sr-only"
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-2xl bg-[#fff4f0] px-4 py-3 text-sm font-semibold text-[#9c4935]">
            {error}
          </p>
        )}

        <div className="mt-6">
          <RiskNotice />
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e8793f] px-6 py-4 font-bold text-white transition hover:bg-[#c85f2d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
              Analyzing X-ray...
            </>
          ) : (
            'Analyze X-ray'
          )}
        </button>
      </form>

      {result && (
        <section className="mt-6 rounded-[2rem] border border-[#dce8df] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#da7d43]">
            Model-generated finding
          </p>

          <h2 className="heading mt-3 text-2xl font-bold text-[#173d32]">
            {result.finding}
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#62756c]">
            Model score:{' '}
            {Number(result.score * 100).toFixed(2)}%
          </p>

          <p className="mt-4 text-sm leading-6 text-[#7a8b83]">
            {result.disclaimer}
          </p>
        </section>
      )}
    </div>
  )
}