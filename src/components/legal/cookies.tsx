import { LegalDocument, LegalSection } from "@/components/legal/legal-document"
import { legal, legalPages } from "@/core/config/legal"

/**
 * The cookie notice.
 *
 * Written so that adding cookieless analytics later needs a paragraph rather
 * than a rewrite — see "If that changes". The absence of a consent banner is
 * stated with its reasoning, because a reader who has been trained by every
 * other site to expect one will otherwise assume we simply forgot.
 */
export function Cookies() {
  return (
    <LegalDocument page={legalPages.cookies}>
      <LegalSection id="what" title="What we set">
        <p>
          One cookie, and only after you sign in to a staff account. If you are
          reading the public site, <strong>nothing is stored</strong> on your
          device by us.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-faded border-b">
                {["Cookie", "What it does", "How long"].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="text-faded pr-4 pb-3 text-detail-xs font-medium uppercase"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-faded border-b">
                <td className="py-4 pr-4 align-top font-mono text-detail-xs">
                  better-auth.session_token
                </td>
                <td className="py-4 pr-4 align-top text-paragraph-s text-pretty text-muted-foreground">
                  Keeps you signed in to the admin dashboard. Without it, every
                  page would ask you to authenticate again.
                </td>
                <td className="py-4 align-top text-paragraph-s text-muted-foreground">
                  8 hours
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          In production the cookie is issued with a{" "}
          <code className="font-mono text-detail-xs">__Secure-</code> prefix and
          sent only over HTTPS.
        </p>
      </LegalSection>

      <LegalSection id="no-banner" title="Why there is no banner">
        <p>
          European rules require your consent before a site stores anything on
          your device — except where it is <strong>strictly necessary</strong>{" "}
          to provide something you asked for. A session cookie that keeps you
          signed in, set only once you have signed in, is the textbook example.
        </p>
        <p>
          So this cookie has to be disclosed, which is what this page is for,
          but it does not need consent. A banner asking permission for a cookie
          you cannot refuse without also refusing to sign in would be theatre,
          and we would rather write the page than build the banner.
        </p>
      </LegalSection>

      <LegalSection id="third-parties" title="What we do not set">
        <p>
          No analytics, no advertising, no third-party tracking, no social media
          pixels, no embedded players. There is no cookie preference panel
          because there are no optional cookies to have a preference about.
        </p>
        <p>
          Fonts are served from our own server rather than a font provider, so
          loading a page does not tell anyone else that you visited.
        </p>
      </LegalSection>

      <LegalSection id="future" title="If that changes">
        <p>
          We may add analytics at some point to see which reports get read. If
          we do, it will be a cookieless tool that records no personal data and
          builds no profile — the kind that needs no banner either. This page
          would gain a paragraph saying exactly what it measures, and the date
          at the top would move.
        </p>
        <p>
          If we ever wanted something that genuinely tracked you, we would have
          to ask first. We don't intend to be in that position.
        </p>
      </LegalSection>

      <LegalSection id="more" title="More detail">
        <p>
          What we collect beyond cookies is set out in the{" "}
          <a href="/legal/privacy">privacy policy</a>. Questions to{" "}
          <a href={legal.contact.href}>{legal.contact.email}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
