import { FC } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useParams } from "@tanstack/react-router";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { stripeProductSchema } from "@/client/schema/stripe-product.schemas";
import { useCreatePricing } from "@/client/hooks/useProject";
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

export const CreateProductStripeModal: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });
  const { mutate } = useCreatePricing(id);

  return (
    <Dialog modal>
      <DialogTrigger asChild>
        <Button variant="outline">Create Stripe Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Stripe Product</DialogTitle>
          <DialogDescription>
            Create a new Stripe product to get started.
          </DialogDescription>
        </DialogHeader>

        <AutoForm
          formSchema={stripeProductSchema}
          fieldConfig={{
            name: {
              label: "Name",
              inputProps: {
                placeholder: "Product Name",
              },
              description: "The name of the product",
            },
            tags: {
              label: "Tags",
              description: "The tags of the product",
              fieldType: "tags",
            },
          }}
          onSubmit={(values) => {
            mutate({
              body: values,
            });
          }}
        >
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <AutoFormSubmit>Create Product</AutoFormSubmit>
          </DialogFooter>
        </AutoForm>
      </DialogContent>
    </Dialog>
  );
};
