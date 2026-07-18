import {
  AlertTriangle,
  Check,
  CircleCheck,
  CloudUpload,
  Hash,
  Loader2,
  X,
} from "lucide-react"

import type { PublishRailProps } from "./types"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

/**
 * The publish rail: what is blocking, what saving means, and what publishing
 * will do.
 *
 * The last of those is the part the page previously left unsaid. Publishing is
 * not "save, but more" — it allocates a permanent identifier, moves the file
 * out of quarantine into a public bucket, and makes the record live. Those are
 * three separate irreversible things (design §8.4), and listing them where the
 * button is costs nothing.
 */
export function PublishRail({
  gate,
  saveState,
  classification,
  dissemination,
  publishing,
  error,
  onPublish,
}: PublishRailProps) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <section
        aria-labelledby="gate-heading"
        className="flex flex-col gap-3 rounded-xl border border-border p-4"
      >
        <h2 id="gate-heading" className="text-ui-sm font-medium">
          Before this can publish
        </h2>

        {gate.publishable ? (
          <p className="flex items-center gap-2 text-ui-sm">
            <CircleCheck className="size-4 shrink-0 text-olive" aria-hidden />
            Everything required is present.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {gate.blockers.map((finding) => (
              <li
                key={`${finding.code}-${finding.field}`}
                className="flex items-start gap-2 text-ui-xs text-pretty"
              >
                <X
                  className="mt-0.5 size-3.5 shrink-0 text-destructive"
                  aria-hidden
                />
                {finding.message}
              </li>
            ))}
          </ul>
        )}

        {gate.warnings.length > 0 && (
          <ul className="flex flex-col gap-2 border-t border-border pt-3">
            {gate.warnings.map((finding) => (
              <li
                key={`${finding.code}-${finding.field}`}
                className="flex items-start gap-2 text-ui-xs text-pretty text-muted-foreground"
              >
                {/* Warnings never block — worth seeing, not fixing. */}
                <AlertTriangle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden
                />
                {finding.message}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <h2 className="text-ui-sm font-medium">Publishing will</h2>

        <ul className="flex flex-col gap-2">
          <Consequence icon={Hash}>
            Allocate a permanent accession ID. It is never reused, even if the
            record is later withdrawn.
          </Consequence>
          <Consequence icon={CloudUpload}>
            Move the PDF out of quarantine into the{" "}
            {classification === "internal" ? "internal" : "public"} bucket.
          </Consequence>
          <Consequence icon={Check}>
            {classification === "internal"
              ? "Make the record visible to signed-in staff only."
              : dissemination === "metadata_only"
                ? "Make the record page public, with the document withheld."
                : "Make the record and its PDF publicly readable."}
          </Consequence>
        </ul>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                className="w-full"
                disabled={!gate.publishable || publishing}
              >
                {publishing ? (
                  <>
                    <Loader2
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                    Publishing…
                  </>
                ) : (
                  "Publish"
                )}
              </Button>
            }
          />

          <AlertDialogContent>
            <AlertDialogTitle>Publish this report?</AlertDialogTitle>
            <AlertDialogDescription>
              {classification === "internal"
                ? "This record will be visible to signed-in staff only. Anonymous visitors will get a 404 — not a 403, which would confirm it exists."
                : dissemination === "metadata_only"
                  ? "The record page will be publicly readable by anyone. The PDF itself will not be served."
                  : "This record and its PDF will be publicly readable by anyone, and it will be assigned a permanent accession ID."}
            </AlertDialogDescription>

            <AlertDialogFooter>
              <AlertDialogClose
                render={<Button variant="ghost">Cancel</Button>}
              />
              <Button onClick={onPublish} disabled={publishing}>
                {publishing ? "Publishing…" : "Publish"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {error && (
          <p role="alert" className="text-ui-xs text-pretty text-destructive">
            {error}
          </p>
        )}

        <SaveStatus state={saveState} />
      </section>
    </aside>
  )
}

function Consequence({
  icon: Icon,
  children,
}: {
  icon: typeof Hash
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-2 text-ui-xs text-pretty text-muted-foreground">
      <Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {children}
    </li>
  )
}

/**
 * Autosave status.
 *
 * `aria-live="polite"` rather than `assertive`: routine saves should not
 * interrupt a screen reader mid-sentence, and the failure case is also rendered
 * in `destructive` with `role="alert"` semantics carried by the text itself.
 */
function SaveStatus({ state }: { state: PublishRailProps["saveState"] }) {
  return (
    <p
      aria-live="polite"
      className={[
        "flex items-center gap-1.5 border-t border-border pt-3 text-ui-xs",
        state.status === "failed"
          ? "text-destructive"
          : "text-muted-foreground",
      ].join(" ")}
    >
      {state.status === "saving" && (
        <>
          <Loader2 className="size-3 animate-spin" aria-hidden />
          Saving…
        </>
      )}

      {state.status === "saved" && (
        <>
          <Check className="size-3 text-olive" aria-hidden />
          Draft saved at{" "}
          {state.at.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          .
        </>
      )}

      {state.status === "failed" && (
        <>
          <X className="size-3" aria-hidden />
          {state.message} Your changes are unsaved.
        </>
      )}

      {state.status === "idle" &&
        "Saved automatically as you leave each field. Saving never publishes."}
    </p>
  )
}
