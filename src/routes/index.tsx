import { Button } from "@/components/ui/button";
import { Timeline, TimelineItemProps } from "@/components/ui/timeline";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { seo } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const Home: React.FC = () => {
  const { t } = useTranslation();

  const timelineItems: TimelineItemProps[] = [
    {
      title: t("home.timeline.items.02.18.2024.title"),
      description: t("home.timeline.items.02.18.2024.description"),
      period: new Date("2024-02-18"),
      colorClass: "border-primary bg-background", // customize this if needed
      icon: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          className="text-primary h-5 w-5"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
      ),
    },
    {
      title: t("home.timeline.items.05.23.2024.title"),
      description: t("home.timeline.items.05.23.2024.description"),
      period: new Date("2024-05-23"),
      colorClass: "border-border bg-background",
      icon: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          className="text-primary h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M0 11.75A.75.75 0 0 1 .75 11h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Zm17.5 0a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z" />
          <path d="M12 17.75a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-1.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
        </svg>
      ),
    },
    {
      period: new Date("05.05.2025"),
      title: t("home.timeline.items.05.05.2025.title"),
      description: t("home.timeline.items.05.05.2025.description"),
      colorClass: "border-success bg-background",
      icon: <GlobeIcon className="text-primary h-5 w-5" />,
    },
  ];

  return (
    <DefaultWrapper project={null}>
      <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 py-12 md:px-12 lg:py-24">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              We hear you, Developers
            </h1>
            <h4 className="text-lg md:text-xl font-medium dark:text-blue-200 text-blue-600">
              {t("home.subtitle")}
            </h4>
          </div>
          <p className="dark:text-gray-300 text-gray-800 max-w-xl">
            {t("home.description")}
          </p>

          <div className="flex space-x-4 mt-8">
            <Link to="/projects">
              <Button
                variant="outline"
                className="bg-transparent dark:border-white dark:hover:bg-white dark:hover:text-black transition-colors border-gray-300  hover:bg-gray-100 text-gray-800 dark:text-white"
              >
                {t("home.explore")}
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <img
            src="/stock/people-working-together-laptops.avif?height=600&width=600"
            alt="People working together"
            loading="lazy"
            width={600}
            height={600}
            className="object-cover rounded-lg"
          />
        </div>
      </section>

      <section className="relative">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-8">
          {t("home.timeline.title")}
        </h3>
        <Timeline items={timelineItems} />
      </section>
    </DefaultWrapper>
  );
};

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: seo({
      title: "Home | Codevault",
      description:
        "The marketing and documentation site for CodeVault Products.",
      keywords: "codevault, products, documentation, marketing",
    }),
  }),
});
