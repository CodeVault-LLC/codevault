import { createFileRoute, useParams } from "@tanstack/react-router";
import { FC } from "react";
import { Unauthorized } from "@/components/Unauthorized";
import { useEditProduct, useRetrieveProduct } from "@/client/hooks/useProject";
import { LoadingSpinner } from "@/components/ui/spinner";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { productCreateSchema } from "@/client/forms";

const SettingsOverview: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });
  const {
    data: projectData,
    isFetching,
    isError,
    isSuccess,
  } = useRetrieveProduct(id);
  const { mutate } = useEditProduct(id);

  if (isFetching)
    return (
      <div className="flex justify-center items-center h-32">
        <p>
          <LoadingSpinner />
        </p>
      </div>
    );

  if (isError) return <Unauthorized />;

  if (!isFetching && projectData === undefined)
    return (
      <div className="flex justify-center items-center h-32">
        <p>Project not found</p>
      </div>
    );

  if (!isFetching && isSuccess) {
    return (
      <div className="flex flex-col gap-8">
        <AutoForm
          formSchema={productCreateSchema}
          values={{
            category: projectData.category,
            description: projectData.description,
            isPublic: projectData.isPublic,
            name: projectData.name,
            status: projectData.status,
            tagline: projectData.tagline,
          }}
          fieldConfig={{
            name: {
              label: "Name",
              inputProps: {
                placeholder: "Project Name",
              },
            },
            description: {
              label: "Description",
              inputProps: {
                placeholder: "A short description of the project",
              },
            },
            isPublic: {
              label: "Public",
              fieldType: "switch",
            },
            tags: {
              label: "Tags",
              fieldType: "tags",
              inputProps: {
                placeholder: "Add tags to your project",
              },
            },
          }}
          onSubmit={(values) => {
            mutate(values);
          }}
        >
          <AutoFormSubmit>Edit Project</AutoFormSubmit>
        </AutoForm>
      </div>
    );
  }

  return null;
};

export const Route = createFileRoute("/dashboard/products/$id/settings/")({
  component: SettingsOverview,
});
