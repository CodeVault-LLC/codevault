import { Link, createFileRoute } from "@tanstack/react-router";
import { FC } from "react";
import { CreateProjectModal } from "@/components/dialog/CreateProjectModal";
import { Unauthorized } from "@/components/Unauthorized";
import { useProducts } from "@/gql/gpl";

const Products: FC = () => {
  const { data: products, isError } = useProducts({
    id: true,
    name: true,
    description: true,
    updatedAt: true,
    createdAt: true,
  });

  if (isError) return <Unauthorized />;

  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="dark:text-white text-2xl">Projects</h1>
        <CreateProjectModal />
      </div>

      {!products && (
        <div className="flex justify-center items-center h-32">
          <p className="text-lg">No projects available.</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products
          ? products.map((project) => (
              <Link
                key={project.id}
                className="group/item w-full h-40 rounded-md border border-gray-800 transition-all duration-300 flex flex-row justify-between gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                to="/dashboard/products/$id"
                params={{ id: project.id.toString() }}
              >
                {/*<img src={project.images} alt="Project" className="h-full object-cover" />*/}

                <div className="p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="dark:text-white text-lg">{project.name}</h4>
                    <p className="dark:text-gray-400 text-sm truncate text-clip">
                      {project.description}
                    </p>
                  </div>

                  <p className="dark:text-gray-600 text-sm text-end">
                    {new Date(project.updatedAt).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))
          : null}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/products/")({
  component: Products,
});
