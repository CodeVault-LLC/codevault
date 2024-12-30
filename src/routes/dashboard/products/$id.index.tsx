import { createFileRoute, useParams } from "@tanstack/react-router";
import { FC } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Unauthorized } from "@/components/Unauthorized";
import { useProduct } from "@/gql/gpl";

const Overview: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });

  const {
    data: project,
    isFetching,
    isError,
    isSuccess,
  } = useProduct(
    {
      id: true,
      createdAt: true,
      description: true,
      name: true,
      updatedAt: true,
    },
    {
      id: id.toString(),
    }
  );

  if (isFetching)
    return (
      <div className="flex justify-center items-center h-32">
        <p>
          <LoadingSpinner />
        </p>
      </div>
    );

  if (isError) return <Unauthorized />;

  if (!isFetching && project === undefined)
    return (
      <div className="flex justify-center items-center h-32">
        <p>Project not found</p>
      </div>
    );

  if (!isFetching && isSuccess)
    return (
      <>
        <hr className="mt-4" />
        <p className="mt-4 dark:text-gray-400 text-gray-800">
          {project.description}
        </p>

        <div className="mt-4" />
      </>
    );

  return null;
};

export const Route = createFileRoute("/dashboard/products/$id/")({
  component: Overview,
});
