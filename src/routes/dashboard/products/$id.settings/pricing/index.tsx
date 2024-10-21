import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { FC } from "react";
import {
  useRetrieveProduct,
  useRetrieveProductPricing,
} from "@/client/hooks/useProject";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Unauthorized } from "@/components/Unauthorized";
import { CreateProductStripeModal } from "@/components/dialog/CreateProductStripeModal";
import {
  Card,
  CardFooter,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Pricing: FC = () => {
  const { id }: { id: number } = useParams({ strict: false });

  const { isFetching, isError, isSuccess } = useRetrieveProduct(id);
  const { data: pricingList } = useRetrieveProductPricing(id);

  if (isFetching)
    return (
      <div className="flex justify-center items-center h-32">
        <p>
          <LoadingSpinner />
        </p>
      </div>
    );

  if (isError) return <Unauthorized />;

  if (!isFetching && pricingList === undefined)
    return (
      <div className="flex justify-center items-center h-32">
        <p>Project not found</p>
      </div>
    );

  if (!isFetching && isSuccess)
    return (
      <div className="flex flex-col gap-8">
        <CreateProductStripeModal />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingList
            ? pricingList.map((pricing) => (
                <Card
                  key={pricing.name}
                  className="transition-shadow duration-300 hover:shadow-lg border rounded-lg"
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">{pricing.name}</h2>
                      {pricing.hidden ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                      {pricing.description || "No description available."}
                    </p>
                  </CardHeader>

                  <CardContent className="mt-4">
                    <div className="text-lg font-medium">
                      Price: {pricing?.currency?.toUpperCase()}{" "}
                      {pricing?.amount}
                    </div>
                    {pricing?.coupons?.length > 0 && (
                      <div className="text-sm text-gray-600 mt-2">
                        Coupons Available:{" "}
                        <span className="font-medium">
                          {pricing?.coupons.join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-400 mt-1">
                      Interval: {pricing?.interval}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t mt-4 pt-4">
                    <Link
                      to="/dashboard/projects/$id/settings/pricing/$pricingId"
                      params={{
                        id,
                        pricingId: pricing.id,
                      }}
                    >
                      <Button
                        variant="default"
                        className="w-full hover:bg-blue-600"
                      >
                        Edit Pricing
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            : null}
        </div>
      </div>
    );

  return null;
};

export const Route = createFileRoute(
  "/dashboard/products/$id/settings/pricing/"
)({
  component: Pricing,
});
