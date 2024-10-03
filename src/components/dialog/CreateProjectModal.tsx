import { FC } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { useCreateProject } from "@/client/hooks/useProject";
import { projectCreateSchema } from "@/client/forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

export const CreateProjectModal: FC = () => {
  const { mutate } = useCreateProject();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project to get started.
          </DialogDescription>
        </DialogHeader>

        <AutoForm
          formSchema={projectCreateSchema}
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
              inputProps: {
                defaultChecked: false,
              },
            },
          }}
          onSubmit={(values) => {
            mutate(values);
          }}
        >
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <AutoFormSubmit>Create Project</AutoFormSubmit>
          </DialogFooter>
        </AutoForm>
      </DialogContent>
    </Dialog>
  );
};
