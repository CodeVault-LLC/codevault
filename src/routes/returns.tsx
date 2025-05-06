import { Separator } from "@/components/ui/separator";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DefaultWrapper project={null}>
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Returns and Refunds Policy</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Last updated: May 06, 2025
        </p>

        <Separator className="my-4" />

        <section className="mb-6">
          <p>
            At Codevault, we offer digital products and services. Due to the
            nature of these items, we have a different refund policy than
            physical goods.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Digital Products Only</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>We do not sell or ship physical products.</li>
            <li>
              All products are delivered digitally via download or access link.
            </li>
            <li>
              Once access is granted or the product is downloaded, the purchase
              is considered final and non-refundable.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Refund Conditions</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Refunds may be issued in the case of duplicate purchases.</li>
            <li>
              Refunds may also be considered if a technical issue prevents you
              from accessing your product and we are unable to resolve it.
            </li>
            <li>
              Billing errors will be corrected or refunded upon verification.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">EU/EEA Consumer Rights</h3>
          <p>
            By purchasing a digital product and gaining immediate access, you
            agree to waive your 14-day right of withdrawal as per applicable EU
            regulations. This waiver is confirmed at checkout.
          </p>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
          <p>
            If you believe you are eligible for a refund, or if you have any
            questions about this policy, please contact us at:
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
