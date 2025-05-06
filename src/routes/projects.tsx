import { Button } from "@/components/ui/button";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { projects } from "@/projects";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <DefaultWrapper project={null}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl duration-300 overflow-hidden flex flex-col border"
          >
            <img
              src={project.image || "/placeholder.png"}
              alt={t(`projects.${project.id}.name` as const, {
                defaultValue: "",
              })}
              className="w-full h-48 object-cover"
            />

            <div className="p-5 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold mb-2">
                {t(`projects.${project.id}.name` as const, {
                  defaultValue: "",
                })}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 flex-1 mb-4 text-sm">
                {t(`projects.${project.id}.description` as const, {
                  defaultValue: "",
                })}
              </p>

              <Link
                to={"/project/$projectId"}
                params={{ projectId: project.id }}
              >
                <Button
                  variant="outline"
                  className="w-full dark:border-white dark:hover:bg-white dark:hover:text-black transition-colors border-gray-300 hover:bg-gray-100 text-gray-800 dark:text-white"
                >
                  {t("common.read_more")}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </DefaultWrapper>
  );
}

export const Route = createFileRoute("/projects")({
  component: RouteComponent,
});
