import { Separator } from "@/components/ui/separator";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-conditions")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DefaultWrapper project={null}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Terms and Conditions</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: May 06, 2025
        </p>

        <Separator className="my-4" />

        <section className="mb-6">
          <p>
            These Terms and Conditions (“Terms”) govern your access to and use
            of the website and digital services provided by Codevault AS
            (“Codevault”, “we”, “us”, or “our”), a company registered in Norway.
            By accessing or using our platform, you agree to be bound by these
            Terms and all applicable laws and regulations.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">1. Eligibility</h3>
          <p>
            You must be at least 18 years old or the age of legal majority in
            your jurisdiction to use our services. By using Codevault, you
            represent that you meet these requirements.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">2. Services</h3>
          <p>
            Codevault provides access to digital resources, products, and
            services which may be offered as free, one-time purchases, or
            recurring subscription plans. We reserve the right to modify or
            discontinue any part of the service at any time.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">3. Payments & Currency</h3>
          <p>
            All transactions are processed in Norwegian Kroner (NOK). By
            purchasing a product or subscription, you agree to pay the listed
            price including any applicable taxes. Prices may change at our
            discretion but will never apply retroactively.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">4. Subscriptions</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Subscriptions renew automatically unless canceled before the next
              billing cycle.
            </li>
            <li>
              You may cancel your subscription at any time via your account.
            </li>
            <li>
              No refunds are provided for partial billing periods unless legally
              required.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">5. User Accounts</h3>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and credentials. You agree not to share your login with
            others. We may suspend or terminate your account if suspicious
            activity is detected or if these Terms are violated.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            6. Intellectual Property
          </h3>
          <p>
            All content on Codevault, including text, code, designs, and
            graphics, is the property of Codevault or its licensors and is
            protected by copyright and other intellectual property laws. You may
            not reproduce, redistribute, or resell any part of the platform
            without explicit permission.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            7. Privacy & Data Protection
          </h3>
          <p>
            We comply with the General Data Protection Regulation (GDPR) and
            Norwegian data protection laws. We collect only the data necessary
            to provide our services, such as email addresses and usage logs.
            Please see our{" "}
            <a href="/privacy" className="underline text-primary">
              Privacy Policy
            </a>{" "}
            for more details.
          </p>
          <p>
            You have the right to access, correct, or delete your personal data.
            Requests can be made via email to{" "}
            <a href="mailto:codevaultllc@gmail.com">codevaultllc@gmail.com</a>.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">8. Disclaimer</h3>
          <p>
            Codevault provides services "as is" without warranties of any kind.
            We are not responsible for any losses or damages resulting from the
            use or inability to use the platform. We do not guarantee that
            content will always be available or error-free.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">9. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of Norway. Any disputes arising under these Terms shall be
            subject to the exclusive jurisdiction of the courts of Norway.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">10. Contact</h3>
          <p>
            If you have any questions or concerns about these Terms, please
            contact us at:
          </p>
          <ul className="list-disc list-inside">
            <li>
              Email:{" "}
              <a href="mailto:codevaultllc@gmail.com">codevaultllc@gmail.com</a>
            </li>
          </ul>
        </section>
      </div>
    </DefaultWrapper>
  );
}
