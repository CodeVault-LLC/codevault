import { SupportWrapper } from "@/core/lib/wrappers/support-wrapper";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/support")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SupportWrapper>
      <div className="relative">
        <div className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset bg-linear-115 from-[#fff1be] from-28% via-[#ee87cb] via-70% to-[#b060ff] sm:bg-linear-145"></div>
        <div className="relative">
          <div className="mx-auto max-w-2xl lg:max-w-7xl">
            <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-32 md:pb-48">
              <h1 className="font-display text-6xl/[0.9] font-medium tracking-tight text-balance text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
                Support
              </h1>
              <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
                Get help with a project, find answers to your questions, or view
                basic information about our tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SupportWrapper>
  );
}
