import { Button } from "@/components/ui/button";
import { DefaultWrapper } from "@/core/lib/wrappers/default-wrapper";
import { projects } from "@/projects";
import { createFileRoute, Link } from "@tanstack/react-router";

function RouteComponent() {
  return (
    <DefaultWrapper project={null}>
      <div className="grid grid-cols-3 xs:grid-cols-1 gap-4 w-full">
        {projects.map((project) => (
          <div className="p-4 border rounded-md shadow-sm" key={project.id}>
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />

            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <p className="mb-4">{project.description}</p>

            <Link to={`/project/${project.id}`}>
              <Button variant="outline" className="w-full">
                Read more
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </DefaultWrapper>
  );
}

export const Route = createFileRoute("/projects")({
  component: RouteComponent,
});
