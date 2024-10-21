import { type FC } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRetrieveProductPricingDetails } from "@/client/hooks/useProject";
import { Label } from "@/components/ui/label";

const PricingId: FC = () => {
  const {
    id,
    pricingId,
  }: {
    id: number;
    pricingId: number;
  } = useParams({
    strict: false,
  });

  const { data: product, isFetching: isFetchingPricing } =
    useRetrieveProductPricingDetails(id, pricingId);

  if (isFetchingPricing) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-32">
        <p>Product or pricing information not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Tabs className="w-full" defaultValue="productInfo">
        <TabsList>
          <TabsTrigger value="productInfo">Product Info</TabsTrigger>
          <TabsTrigger value="pricingInfo">Pricing Info</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="localizations">Localizations</TabsTrigger>
        </TabsList>

        <TabsContent value="productInfo">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Product Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  defaultValue={product.name}
                  className="w-full"
                  id="productName"
                />
              </div>
              <div>
                <Label htmlFor="productDescription">Product Description</Label>
                <Textarea
                  defaultValue={product.description}
                  className="w-full"
                  id="productDescription"
                />
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={product.highlight ? "default" : "secondary"}>
                  Highlight
                </Badge>
                <Badge variant={product.featured ? "default" : "secondary"}>
                  Featured
                </Badge>
                <Badge variant={product.soldout ? "destructive" : "secondary"}>
                  Sold Out
                </Badge>
                <Badge variant={product.comingsoon ? "default" : "secondary"}>
                  Coming Soon
                </Badge>
                <Badge variant={product.waitlist ? "default" : "secondary"}>
                  Waitlist
                </Badge>
              </div>
              <Button variant="default">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricingInfo">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Pricing Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productPrice">Price</Label>
                <Input
                  defaultValue={product.pricing.amount}
                  type="number"
                  className="w-full"
                  id="productPrice"
                />
              </div>
              <div>
                <Label htmlFor="productCurrency">Currency</Label>
                <Select defaultValue={product.pricing.currency}>
                  <SelectTrigger id="productCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="productInterval">Interval</Label>
                <Select defaultValue={product.pricing.interval}>
                  <SelectTrigger id="productInterval">Interval</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">One Time</SelectItem>
                    <SelectItem value="week">Monthly</SelectItem>
                    <SelectItem value="month">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="productSetupFee">Setup Fee</Label>
                <Input
                  defaultValue={product.pricing.setupFee}
                  type="number"
                  className="w-full"
                  id="productSetupFee"
                />
              </div>

              <div>
                <Label htmlFor="productTrialPeriod">Trial Period</Label>
                <Input
                  defaultValue={product.pricing.trialPeriod}
                  type="number"
                  className="w-full"
                  id="productTrialPeriod"
                />
              </div>
              <Button variant="default">Save Pricing</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Discounts</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="discountName">Discount Name</Label>
                <Input
                  type="number"
                  className="w-full"
                  placeholder="Enter discount value"
                  id="discountName"
                />
              </div>
              <div>
                <Label htmlFor="discountValue">Discount Value</Label>
                <Select defaultValue="Percentage">
                  <SelectTrigger id="discountValue">
                    <SelectValue placeholder="Select Discount Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="default">Save Discount</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localizations">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Localizations</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="localizationCountry">Country</Label>
                <Input
                  placeholder="e.g., US, FR, DE"
                  className="w-full"
                  id="localizationCountry"
                />
              </div>
              <div>
                <Label htmlFor="localizationPrice">Price</Label>
                <Input
                  type="number"
                  placeholder="Enter price for the selected country"
                  className="w-full"
                  id="localizationPrice"
                />
              </div>
              <div>
                <Label htmlFor="localizationCurrency">Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger id="localizationCurrency">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="default">Save Localization</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const Route = createFileRoute(
  "/dashboard/products/$id/settings/pricing/$pricingId"
)({
  component: PricingId,
});
