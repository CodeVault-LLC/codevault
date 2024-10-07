import { FC } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import AutoForm, { AutoFormSubmit } from "@/components/ui/auto-form";
import {
  localizationSchema,
  pricingSchema,
  purchaseLimitSchema,
  stripeProductAvaliableDatesSchema,
  stripeProductSchema,
  subscriptionOptionsSchema,
  visibilityRestrictionSchema,
} from "@/client/schema/stripe-product.schemas";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const CreateProductStripeModal: FC = () => {
  const { mutate, isSuccess, isPending } = useCreatePricing();

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

        <Tabs defaultValue="product">
          <TabsList aria-label="Product Creation Tabs" className="mb-6">
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="purchaseLimit">Purchase Limit</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="availabilityDates">
              Availability Dates
            </TabsTrigger>
            <TabsTrigger value="visibilityRestrictions">Visibility</TabsTrigger>
            <TabsTrigger value="subscriptionOptions">
              Subscription Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="product">
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
            >
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <AutoFormSubmit>Create Product</AutoFormSubmit>
              </DialogFooter>
            </AutoForm>
          </TabsContent>

          <TabsContent value="pricing">
            <AutoForm formSchema={pricingSchema}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <AutoFormSubmit>Create Product</AutoFormSubmit>
              </DialogFooter>
            </AutoForm>
          </TabsContent>

          <TabsContent value="purchaseLimit">
            <AutoForm formSchema={purchaseLimitSchema}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <AutoFormSubmit>Create Product</AutoFormSubmit>
              </DialogFooter>
            </AutoForm>
          </TabsContent>

          <TabsContent value="localization">
            <AutoForm formSchema={localizationSchema}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <AutoFormSubmit>Create Product</AutoFormSubmit>
              </DialogFooter>
            </AutoForm>
          </TabsContent>

          <TabsContent value="availabilityDates">
            <AutoForm formSchema={stripeProductAvaliableDatesSchema}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <AutoFormSubmit>Create Product</AutoFormSubmit>
              </DialogFooter>
            </AutoForm>
          </TabsContent>

          <TabsContent value="visibilityRestrictions">
            <AutoForm formSchema={visibilityRestrictionSchema}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <AutoFormSubmit>Create Product</AutoFormSubmit>
              </DialogFooter>
            </AutoForm>
          </TabsContent>

          <TabsContent value="subscriptionOptions">
            <AutoForm formSchema={subscriptionOptionsSchema}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <AutoFormSubmit>Create Product</AutoFormSubmit>
              </DialogFooter>
            </AutoForm>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
