import React from "react";
import { Product } from "@/types/product";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductProps {
  product: Product;
}

export const ProductPage: React.FC<ProductProps> = ({ product }) => {
  return (
    <div className="p-6">
      <Card className="mb-6 shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-md text-gray-500 mt-2">{product.tagline}</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {product.status}
          </Badge>
        </CardHeader>

        <CardContent className="mt-4 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">About this Product</h2>
            <p className="text-gray-700 mt-2">{product.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Category</h2>
              <p className="text-gray-700">{product.category}</p>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Public Availability</h2>
              <Badge
                variant={product.isPublic ? "default" : "destructive"}
                className="mt-2"
              >
                {product.isPublic ? "Available to Everyone" : "Restricted"}
              </Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row gap-4 justify-end mt-6">
          <Button variant="outline" className="w-full md:w-auto">
            Learn More
          </Button>
          <Button variant="default" className="w-full md:w-auto">
            Buy Now
          </Button>
          <Button variant="outline" className="w-full md:w-auto">
            Contact Support
          </Button>
        </CardFooter>
      </Card>

      {/* Additional information section, such as pricing or user reviews */}
      <Card className="shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-bold">Pricing & Offers</h2>
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Price</h2>
            <p className="text-gray-700">$29.99/month</p>
          </div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Current Offers</h2>
            <p className="text-gray-700">10% off for the first 3 months</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline">See More Pricing Options</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
