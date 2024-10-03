import { FC } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import { stripeProductSchema } from "@/client/forms";
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create Stripe Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            description: {
              label: "Description",
              inputProps: {
                placeholder: "A short description of the product",
              },
              description: "The description of the product",
            },
            availabilityDates: {
              label: "Availability Dates",
              inputProps: {
                type: "date",
              },
              description: "The availability dates of the product",
              fieldType: "date",
            },
            comingsoon: {
              label: "Coming Soon",
              fieldType: "switch",
              inputProps: {
                defaultChecked: false,
              },
              description: "The product is coming soon",
            },
            featured: {
              label: "Featured",
              fieldType: "switch",
              inputProps: {
                defaultChecked: false,
              },
              description: "The product is featured",
            },
            highlight: {
              label: "Highlight",
              fieldType: "switch",
              inputProps: {
                defaultChecked: false,
              },
              description: "The product is highlighted",
            },
            hidden: {
              label: "Hidden",
              fieldType: "switch",
              inputProps: {
                defaultChecked: false,
              },
              description: "The product is hidden",
            },
            localization: {
              label: "Localization",
              description: "The localization of the product",
            },
            metadata: {
              label: "Metadata",
              description: "The metadata of the product",
            },
            pricing: {
              label: "Pricing",
              description: "The pricing of the product",
            },
            purchaseLimit: {
              label: "Purchase Limit",
              description: "The purchase limit of the product",
            },
            soldout: {
              label: "Sold Out",
              fieldType: "switch",
              inputProps: {
                defaultChecked: false,
              },
              description: "The product is sold out",
            },
            subscriptionOptions: {
              label: "Subscription Options",
              description: "The subscription options of the product",
            },
            tags: {
              label: "Tags",
              description: "The tags of the product",
            },
            visibilityRestrictions: {
              label: "Visibility Restrictions",
              description: "The visibility restrictions of the product",
            },
            waitlist: {
              label: "Waitlist",
              fieldType: "switch",
              inputProps: {
                defaultChecked: false,
              },
              description: "The product has a waitlist",
            },
          }}
          onSubmit={(values) => {}}
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
