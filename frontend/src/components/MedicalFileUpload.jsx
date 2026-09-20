import { useRef, useState } from 'react'
import {
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  CheckCircle2,
} from 'lucide-react'

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
]

const MAX_SIZE = 10 * 1024 * 1024

export default function MedicalFileUpload({
  onFileSelected,
  selectedFile,
  disabled = false,
}) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  function validateFile(file) {
    setError('')

    if (!file) {
      return false
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PDF, JPG, or PNG file.')
      return false
    }

    if (file.size > MAX_SIZE) {
      setError('File size must be less than 10 MB.')
      return false
    }

    return true
  }

  function handleFile(file) {
    if (!validateFile(file)) {
      return
    }

    onFileSelected(file)
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0]

    if (file) {
      handleFile(file)
    }

    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()

    if (disabled) {
      return
    }

    const file = event.dataTransfer.files?.[0]

    if (file) {
      handleFile(file)
    }
  }

  function removeFile() {
    onFileSelected(null)
    setError('')
  }

  function getFileIcon() {
    if (selectedFile?.type === 'application/pdf') {
      return <FileText size={28} />
    }

    return <ImageIcon size={28} />
  }

  return (
    <div>
      {!selectedFile ? (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`group cursor-pointer rounded-[2rem] border-2 border-dashed p-10 text-center transition ${
            disabled
              ? 'cursor-not-allowed border-[#dce8df] bg-[#f5f8f5]'
              : 'border-[#b9d0be] bg-[#f8fbf8] hover:border-[#39735c] hover:bg-white'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#e8f3ea] text-[#39735c]">
            <Upload size={28} />
          </div>

          <h3 className="heading mt-5 text-xl font-bold text-[#173d32]">
            Upload your medical report
          </h3>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#687b71]">
            Drag and drop your report here, or click to browse your device.
          </p>

          <div className="mt-5 flex justify-center gap-2">
            <span className="rounded-full bg-[#eaf3ec] px-3 py-1 text-xs font-semibold text-[#39735c]">
              PDF
            </span>

            <span className="rounded-full bg-[#eaf3ec] px-3 py-1 text-xs font-semibold text-[#39735c]">
              JPG
            </span>

            <span className="rounded-full bg-[#eaf3ec] px-3 py-1 text-xs font-semibold text-[#39735c]">
              PNG
            </span>
          </div>

          <p className="mt-4 text-xs text-[#94a89d]">
            Maximum file size: 10 MB
          </p>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-[#cfe0d3] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e9f4eb] text-[#39735c]">
              {getFileIcon()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-[#173d32]">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-sm text-[#7b8c84]">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#39735c]">
                <CheckCircle2 size={14} />
                File ready for analysis
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              disabled={disabled}
              className="rounded-full p-2 text-[#71847a] hover:bg-[#f3f7f4]"
              aria-label="Remove file"
            >
              <X size={19} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-2xl bg-[#fff0ec] px-4 py-3 text-sm font-semibold text-[#aa4934]">
          {error}
        </p>
      )}
    </div>
  )
}