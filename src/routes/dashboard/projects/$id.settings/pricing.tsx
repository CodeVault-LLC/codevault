import { createFileRoute, useParams } from "@tanstack/react-router";
import { FC } from "react";
import { AlertCircleIcon } from "lucide-react";
import { useProject } from "@/client/hooks/useProject";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Unauthorized } from "@/components/Unauthorized";
import AutoForm from "@/components/ui/auto-form";
import { projectPricingSettingsSchema } from "@/client/forms";
import { CreateProductStripeModal } from "@/components/dialog/CreateProductStripeModal";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Pricing: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });

  const { data: project, isFetching, isError, isSuccess } = useProject(id);

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

  const products = [
    {
      name: "Stripe Product",
      description: "Product description",

      price: 1000,
      currency: "usd",
    },
  ];

  if (!isFetching && isSuccess)
    return (
      <div className="flex flex-col gap-8">
        {project.id ? (
          <div className="p-4 rounded-lg bg-blue-100 border border-blue-300 flex items-start space-x-4">
            <AlertCircleIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-sm font-semibold text-blue-700">
                Stripe Product
              </h3>
              <p className="text-sm text-blue-600">
                Product <code>stripe_product_id_123</code> successfully fetched
                from Stripe.
              </p>
            </div>
          </div>
        ) : null}

        <AutoForm
          formSchema={projectPricingSettingsSchema}
          fieldConfig={{
            apiKey: {
              description: "Your Stripe secret key",
              label: "Stripe Secret Key",
            },
          }}
        />

        <CreateProductStripeModal />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.name} className="transition-shadow duration-300">
              {/* Card Header: Product Title & Description */}
              <CardHeader>
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-500 text-sm mt-2">
                  {product.description}
                </p>
              </CardHeader>

              <CardContent>
                {/* Pricing Information */}
                <p className="text-3xl font-bold">${product.price / 100}</p>
                <span className="text-sm uppercase">{product.currency}</span>
              </CardContent>

              {/* Card Footer with Action Buttons */}
              <CardFooter className="border-t mt-4 pt-4 flex space-x-2 justify-between">
                <Button className="w-full text-sm bg-blue-500 text-white hover:bg-blue-600 transition-all">
                  Edit
                </Button>
                <Button className="w-full text-sm bg-red-500 text-white hover:bg-red-600 transition-all">
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );

  return null;
};

export const Route = createFileRoute(
  "/dashboard/projects/$id/settings/pricing"
)({
  component: Pricing,
});
