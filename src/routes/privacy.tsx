import { Separator } from "@/components/ui/separator";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DefaultWrapper project={null}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Privacy Policy</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: May 06, 2025
        </p>

        <Separator className="my-4" />

        <section className="mb-6">
          <p>
            This Privacy Policy explains how Codevault AS ("we", "us", or "our")
            collects, uses, and protects your personal data in accordance with
            the EU General Data Protection Regulation (GDPR) and Norwegian data
            protection laws.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">1. Who We Are</h3>
          <p>
            Codevault AS is a digital company based in Norway. We provide online
            services and digital products through our website{" "}
            <a
              href="https://codevault.no"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              codevault.no
            </a>
            . You can contact us by email at{" "}
            <a href="mailto:codevaultllc@gmail.com">codevaultllc@gmail.com</a>.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            2. What Data We Collect
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Email address (for accounts, orders, and contact)</li>
            <li>
              Payment data (via third-party providers like Stripe or PayPal)
            </li>
            <li>Usage logs and IP addresses (for analytics and security)</li>
            <li>Optional name or profile information (if provided)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            3. How We Use Your Data
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and maintain our digital services</li>
            <li>To process purchases and subscriptions</li>
            <li>To respond to inquiries or support requests</li>
            <li>To send you transactional or account-related communications</li>
            <li>To improve our platform using aggregated usage data</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">4. Legal Basis</h3>
          <p>
            We process your personal data based on one or more of the following
            legal grounds:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Consent (e.g., for newsletter sign-up or cookies)</li>
            <li>Contractual necessity (e.g., fulfilling an order)</li>
            <li>Legal obligation (e.g., tax regulations)</li>
            <li>
              Legitimate interest (e.g., fraud prevention or improving our
              service)
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">5. Cookies & Tracking</h3>
          <p>
            We may use essential cookies to run our site and optional ones (such
            as Google Analytics) to understand traffic and usage patterns. You
            will be asked for consent when applicable.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">6. Data Sharing</h3>
          <p>
            We do not sell your personal data. We may share your data with
            trusted third parties for specific purposes:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Payment processors (e.g., Stripe, PayPal)</li>
            <li>Email service providers (e.g., Mailgun, SendGrid)</li>
            <li>
              Analytics tools (e.g., Plausible, Google Analytics — if used)
            </li>
          </ul>
          <p>
            All third-party services are required to comply with GDPR and only
            process data on our behalf.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">7. Your Rights</h3>
          <p>Under GDPR, you have the following rights:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Delete your data ("right to be forgotten")</li>
            <li>Object to or restrict certain processing</li>
            <li>Withdraw consent at any time</li>
            <li>
              File a complaint with the Norwegian Data Protection Authority
              (Datatilsynet)
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">8. Data Retention</h3>
          <p>
            We retain personal data only for as long as necessary to fulfill the
            purposes outlined in this policy or to comply with legal
            obligations.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">9. Data Security</h3>
          <p>
            We use industry-standard encryption and security measures to protect
            your data. However, no method of transmission over the internet is
            100% secure.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            10. International Transfers
          </h3>
          <p>
            If we transfer your data outside the EEA (e.g., to a US-based
            processor), we ensure that adequate protection is in place via
            standard contractual clauses or other safeguards.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            11. Changes to This Policy
          </h3>
          <p>
            We may update this Privacy Policy from time to time. Significant
            changes will be communicated via our website or by email if
            appropriate.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">12. Contact Us</h3>
          <p>
            If you have questions about this Privacy Policy or how your data is
            handled, contact us at:
          </p>
          <ul className="list-disc list-inside">
            <li>
              Email:{" "}
              <a href="mailto:codevaultllc@gmail.com">codevaultllc@gmail.com</a>
            </li>
            <li>
              Norwegian Data Protection Authority (Datatilsynet):{" "}
              <a
                href="https://www.datatilsynet.no/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                datatilsynet.no
              </a>
            </li>
          </ul>
        </section>
      </div>
    </DefaultWrapper>
  );
}
