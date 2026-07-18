import { LegalDocument, LegalSection } from "@/components/legal/legal-document"
import { legal, legalPages, operatorLabel } from "@/core/config/legal"

/**
 * Terms of use.
 *
 * Two things here are deliberately narrower than a template would write them.
 * The liability clause is limited to what Norwegian law actually permits —
 * liability for gross negligence and intent cannot be disclaimed here, and a
 * clause claiming otherwise is void rather than merely ambitious. And the
 * acceptable-use section forbids very little: an archive meant to be read
 * should not read as though it would rather you didn't.
 */
export function Terms() {
  return (
    <LegalDocument page={legalPages.terms}>
      <LegalSection id="operator" title="Who runs this site">
        <p>
          CodeVault is run by <strong>{operatorLabel()}</strong>, in{" "}
          {legal.operator.country}. CodeVault is a name we publish work under,
          not a registered company. You can reach us at{" "}
          <a href={legal.contact.href}>{legal.contact.email}</a>.
        </p>
        <p>
          By using this site you accept what follows. If you don't, the remedy
          is simply not to use it.
        </p>
      </LegalSection>

      <LegalSection id="archive" title="The archive">
        <p>
          The reports published here are a record of our own work. We write them
          to document what we tried and what happened, and we publish them as
          they were written.
        </p>
        <p>
          They are provided <strong>as-is</strong>. We don't warrant that a
          report is accurate, current, or complete, and we don't undertake to
          keep one up to date — a report describing something we did in 2026
          says what we thought in 2026. Don't rely on one as professional
          advice, or as the basis for a decision that matters, without checking
          it yourself.
        </p>
        <p>
          We may add, revise, or withdraw a report at any time. Published
          records carry an accession ID so a specific version can be cited.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="Who owns what">
        <p>
          The text, design, and reports on this site belong to the operator,
          unless a page says otherwise. You may read, quote, and cite them with
          attribution. You may not republish a report wholesale as your own.
        </p>
        <p>
          <strong>
            Software we publish is governed only by the licence in its own
            repository.
          </strong>{" "}
          Nothing on this page adds to or takes away from those licences. If a
          repository is MIT-licensed, it stays MIT-licensed, and these terms
          have nothing to say about what you do with it.
        </p>
        <p>
          There is <strong>no geographic restriction</strong> on reading this
          site, downloading a report, or using anything we publish. Anyone,
          anywhere.
        </p>
      </LegalSection>

      <LegalSection id="use" title="What we ask you not to do">
        <p>
          The list is short, and it is about the site rather than the ideas:
        </p>
        <ul>
          <li>
            Don't try to get past the sign-in, or use an account that isn't
            yours.
          </li>
          <li>
            Don't attack the service, or submit content designed to compromise
            it or the people who read it.
          </li>
          <li>
            Don't make automated requests at a volume that degrades the site for
            other people. Reasonable crawling and scripted downloads are fine —
            we publish an archive; reading it in bulk is a normal thing to want.
          </li>
        </ul>
        <p>
          If you've found a way past any of this, we would much rather hear
          about it than not — see the{" "}
          <a href="/legal/security">security page</a>.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Liability">
        <p>
          We provide this site without warranties of any kind, so far as the law
          allows, and we are not liable for indirect or consequential loss
          arising from your use of it — including loss arising from relying on a
          report.
        </p>
        <p>
          That limit goes exactly as far as Norwegian law permits and no
          further. We do not exclude liability for{" "}
          <strong>gross negligence or intentional wrongdoing</strong>, for
          personal injury, or for anything else that cannot be excluded by
          agreement. If you are a consumer, your mandatory rights under
          Norwegian law are unaffected by anything on this page.
        </p>
      </LegalSection>

      <LegalSection id="law" title="Governing law">
        <p>
          These terms are governed by Norwegian law, and disputes belong to the
          Norwegian courts.
        </p>
        <p>
          This decides which law applies if there is ever a disagreement. It
          does not limit who may use the site — see above.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to these terms">
        <p>
          We may revise these terms. The date at the top of the page tracks the
          text, and continuing to use the site after a change means you accept
          the revised version.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
