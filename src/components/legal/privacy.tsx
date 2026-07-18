import { LegalDocument, LegalSection } from "@/components/legal/legal-document"
import { legal, legalPages, operatorLabel } from "@/core/config/legal"

/**
 * The privacy policy.
 *
 * Every claim here is traceable to something the code actually does — the
 * fields listed under "staff account" are the columns in `session` and
 * `audit_log`, and the statement that reading is unlogged is true because
 * `reports.$accessionId_.download.ts` writes no audit entry. If any of that
 * changes, this page changes on the same commit.
 */
export function Privacy() {
  return (
    <LegalDocument page={legalPages.privacy}>
      <LegalSection id="controller" title="Who is responsible">
        <p>
          This site is run by <strong>{operatorLabel()}</strong>, in{" "}
          {legal.operator.country}. CodeVault is the name the work is published
          under, not a registered company — so the person named above is the
          data controller and is accountable for everything on this page.
        </p>
        <p>
          For anything to do with your data, write to{" "}
          <a href={legal.contact.href}>{legal.contact.email}</a>.
        </p>
      </LegalSection>

      <LegalSection id="reading" title="If you are just reading">
        <p>
          Then we collect essentially nothing. There is no account to create, no
          analytics, and no cookie is set. Reading a report or downloading its
          PDF writes <strong>no record</strong> identifying you — the archive
          does not log who reads what.
        </p>
        <p>
          What remains is what any web server unavoidably receives in order to
          answer a request: your IP address, the page requested, the time, and
          your browser's user-agent string. This sits in the infrastructure logs
          of the providers listed below, and we do not build profiles from it,
          combine it with anything else, or use it to identify you.
        </p>
      </LegalSection>

      <LegalSection id="staff" title="If you hold a staff account">
        <p>
          Accounts exist only for people who deposit and catalogue reports. They
          are issued by invitation — there is no public sign-up. For those
          people we store:
        </p>
        <ul>
          <li>
            <strong>Account details</strong> — the name and identifier the
            account was created with.
          </li>
          <li>
            <strong>Passkey credentials</strong> — the public key and metadata
            for each registered passkey. We never hold a password.
          </li>
          <li>
            <strong>Sessions</strong> — including the{" "}
            <strong>IP address and user-agent</strong> a session was created
            from, so a signed-in session can be recognised and revoked.
          </li>
          <li>
            <strong>Audit entries</strong> — a record of administrative actions
            (depositing, editing, publishing, account changes), each with the
            actor, the time, and the same IP address and user-agent.
          </li>
        </ul>
        <p>
          The legal basis is our legitimate interest in keeping the archive
          secure and its history accountable. The audit log exists so that any
          change to the record can be attributed and reviewed.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="How long we keep it">
        <p>
          Sessions expire automatically eight hours after sign-in, and expired
          sessions are removed.
        </p>
        <p>
          <strong>Audit entries are kept indefinitely.</strong> That is
          deliberate rather than neglectful: the log is hash-chained, so each
          entry is cryptographically linked to the one before it. Deleting an
          entry would break that chain and destroy the tamper-evidence the log
          exists to provide. The only people appearing in it are staff — no
          visitor to the public site is ever recorded there.
        </p>
      </LegalSection>

      <LegalSection id="processors" title="Who else touches it">
        <p>
          Two providers process data on our behalf, both under contract and only
          on our instructions:
        </p>
        <ul>
          {legal.processors.map((processor) => (
            <li key={processor.name}>
              <strong>{processor.name}</strong> — {processor.purpose}
            </li>
          ))}
        </ul>
        <p>
          Nobody else. We do not sell data, share it with advertisers, or use it
          for profiling or automated decision-making. There is no advertising on
          this site and no third-party tracking scripts.
        </p>
      </LegalSection>

      <LegalSection id="storage" title="Where data is stored">
        <p>
          The server, the database, and the report files are located in{" "}
          {legal.dataRegion}. Where a provider's support staff need access from
          outside the European Economic Area, that access happens under the
          European Commission's standard contractual clauses.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your rights">
        <p>
          Under the GDPR you can ask us for a copy of the data we hold about
          you, ask us to correct it or delete it, ask us to restrict how we use
          it, object to our using it, or ask for it in a portable form. Write to{" "}
          <a href={legal.contact.href}>{legal.contact.email}</a> and we will
          answer within a month.
        </p>
        <p>
          Where a request would break the audit log's hash chain, we will say so
          and explain what we can do instead, rather than quietly declining.
        </p>
        <p>
          If you think we have handled your data badly, you can complain to{" "}
          <a
            href={legal.supervisoryAuthority.href}
            target="_blank"
            rel="noreferrer"
          >
            {legal.supervisoryAuthority.name}
          </a>
          , the Norwegian data protection authority. You are welcome to raise it
          with us first, but you are not required to.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to this page">
        <p>
          If what we collect changes, this page changes with it and the date at
          the top moves. We do not keep a public archive of previous versions;
          if you need to know what this page said on a particular date, ask.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
