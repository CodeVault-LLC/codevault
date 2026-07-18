import { LegalDocument, LegalSection } from "@/components/legal/legal-document"
import { legal, legalPages } from "@/core/config/legal"
import { site } from "@/core/config/site"

/**
 * Vulnerability disclosure policy.
 *
 * Not legally required. It exists because the site has authentication, file
 * upload, and a document archive — the combination that attracts reports —
 * and because a researcher with nowhere obvious to write tends to either post
 * publicly or say nothing.
 *
 * The machine-readable half is `public/.well-known/security.txt`, whose
 * `Expires` date is a real maintenance obligation.
 */
export function Security() {
  const host = site.url.replace(/^https?:\/\//, "").replace(/\/+$/, "")

  return (
    <LegalDocument page={legalPages.security}>
      <LegalSection id="report" title="How to report">
        <p>
          Email <a href={legal.contact.href}>{legal.contact.email}</a> and put
          something recognisable in the subject line. Tell us what you found,
          where, and how to reproduce it. A rough description of impact helps us
          prioritise, but don't let uncertainty stop you sending it — we would
          rather triage a false alarm than miss a real one.
        </p>
        <p>
          Please give us a reasonable chance to fix the problem before
          describing it publicly.
        </p>
      </LegalSection>

      <LegalSection id="scope" title="What is in scope">
        <p>
          <strong>{host}</strong> and the domain we serve report files from,
          including the admin dashboard and the deposit and ingest paths behind
          it.
        </p>
        <p>Out of scope:</p>
        <ul>
          <li>
            Our repositories on GitHub — report issues there, or send a pull
            request. Nothing in them is secret.
          </li>
          <li>
            The infrastructure providers themselves. A vulnerability in Oracle
            Cloud or Cloudflare belongs to them, not to us.
          </li>
          <li>
            Findings from automated scanners with no demonstrated impact,
            missing hardening headers on their own, and reports that amount to a
            configuration preference.
          </li>
          <li>
            Social engineering, physical access, and anything requiring a person
            to be tricked.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="expect" title="What to expect">
        <p>
          A human reply, not a ticket number. CodeVault is a small operation, so
          we won't promise a response time we can't keep — but we read that
          address, and we will tell you what we think and what we intend to do.
        </p>
        <p>
          If you'd like credit for a finding, say so and we will name you. If
          you'd rather not be named, we won't.
        </p>
      </LegalSection>

      <LegalSection id="safe-harbour" title="Testing safely">
        <p>
          If you stay within the scope above, act in good faith, and avoid
          harming the service or anyone's data, we will treat your research as
          authorised and won't pursue you for it.
        </p>
        <p>Concretely, that means:</p>
        <ul>
          <li>
            Use your own test data. Don't access, modify, or download anyone
            else's, and stop as soon as you have shown a problem exists.
          </li>
          <li>
            Don't degrade the service — no denial-of-service testing, no
            automated scanning at volume.
          </li>
          <li>
            Don't leave anything behind: no persistent access, no backdoors, no
            uploaded files beyond what a proof of concept needs.
          </li>
        </ul>
        <p>
          This is our undertaking, not legal immunity. We can't waive the rights
          of third parties, and nothing here authorises breaking Norwegian law.
        </p>
      </LegalSection>

      <LegalSection id="bounty" title="There is no bounty">
        <p>
          We don't pay for vulnerability reports. CodeVault has no revenue and
          no budget for one, and we would rather say so plainly than let you
          spend an afternoon expecting otherwise.
        </p>
        <p>Credit, thanks, and a straight answer are what we have to offer.</p>
      </LegalSection>
    </LegalDocument>
  )
}
