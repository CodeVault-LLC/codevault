import * as React from "react"
import { UploadCloud } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * A drag-and-drop target that is also a real button.
 *
 * The keyboard path is not an afterthought here: the region is a `<button>`
 * that opens the file picker, so tab-and-enter works exactly as it would for
 * "Choose a file", and the drag affordance is an enhancement on top rather than
 * the only way in. The `<input type="file">` stays in the DOM and does the
 * actual work — it is visually hidden, not replaced.
 *
 * Rejecting the wrong type happens here, before any network call, because
 * telling someone their .docx is not a PDF after a 40 MB upload is a bad trade.
 * It is not a security control: the server re-checks magic bytes on the bytes
 * it actually received, which is the check that counts (design §9.2).
 */

type DropzoneProps = {
  onFile: (file: File) => void
  /** Rejected client-side before upload. Server-side validation is separate. */
  accept?: string
  disabled?: boolean
  /** Shown in place of the prompt once something has been selected. */
  children?: React.ReactNode
  id?: string
}

export function Dropzone({
  onFile,
  accept = "application/pdf",
  disabled = false,
  children,
  id,
}: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [rejected, setRejected] = React.useState<string | null>(null)

  // Dragging over a child element fires dragleave on the parent, so a boolean
  // toggled by both events flickers. Counting enter/leave pairs instead means
  // the state only clears when the pointer has actually left the region.
  const dragDepth = React.useRef(0)

  function accepts(file: File): boolean {
    return accept.split(",").some((type) => file.type === type.trim())
  }

  function handle(file: File | undefined) {
    if (!file) return

    if (!accepts(file)) {
      setRejected(`${file.name} is not a PDF.`)
      return
    }

    setRejected(null)
    onFile(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          dragDepth.current += 1
          setDragging(true)
        }}
        onDragOver={(event) => {
          // Without this the browser navigates to the dropped file instead of
          // handing it over.
          event.preventDefault()
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          dragDepth.current -= 1
          if (dragDepth.current <= 0) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          dragDepth.current = 0
          setDragging(false)
          handle(event.dataTransfer.files[0])
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          dragging
            ? "border-olive bg-olive/5"
            : "border-input hover:border-ring/60 hover:bg-muted/40"
        )}
      >
        {children ?? (
          <>
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <UploadCloud className="size-4" aria-hidden />
            </span>
            <span className="text-ui-sm font-medium">
              Drop a PDF here, or choose a file
            </span>
            <span className="text-ui-xs text-muted-foreground">
              Up to 100 MB. Nothing is created until you pick one.
            </span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          handle(event.target.files?.[0])
          // Cleared so re-selecting the same file after a failure still fires
          // a change event.
          event.target.value = ""
        }}
      />

      {rejected && (
        <p className="text-ui-xs text-destructive" role="alert">
          {rejected}
        </p>
      )}
    </div>
  )
}
