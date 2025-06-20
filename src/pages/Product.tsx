import { cn } from "@/lib/utils";
import { IProject } from "@/types/project";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

interface ProjectProps {
  project: IProject;
}

export const ProjectPage: React.FC<ProjectProps> = ({ project }) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 md:px-6 lg:py-24">
        <div className="space-y-4 text-center">
          <h1
            className={cn(
              "bg-gradient-to-r bg-clip-text text-5xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl"
            )}
          >
            {t("projects." + project.id + ".name", {
              defaultValue: "",
            })}
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            {project.description}
          </p>
          <Link
            to="/project/$projectId/docs"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            params={{ projectId: project.id }}
          >
            Explore Documentation
          </Link>
        </div>
      </main>
      <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Unlock the Power of Our Platform
            </h2>
          </div>
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              GitHub Repository
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {project.name} on GitHub
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              The official GitHub repository for the {project.name}, featuring
              roadmaps, issues, and more.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row"></div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex justify-center">
            <img
              src="/placeholder.svg"
              alt="Product Screenshot"
              width={800}
              height={500}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              Product Showcase
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Experience Our Platform in Action
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Explore our interactive product demo to see the full capabilities
              of our platform.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                to="/"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Try the Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
