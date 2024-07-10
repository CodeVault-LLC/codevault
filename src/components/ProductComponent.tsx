import { Link } from "@tanstack/react-router";
import React from "react";
import { CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type ProductComponentProps = {
  product: Product;
};

const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

const BadgeComponent: React.FC<{ badge: string }> = ({ badge }) => (
  <Badge
    variant="outline"
    className={cn(
      "bg-background",
      badge === "new" ? "border-green-600" : "border-gray-400"
    )}
  >
    <CircleIcon
      className={cn(
        "h-3 w-3 -translate-x-1",
        badge === "new"
          ? "animate-pulse fill-green-300 text-green-300"
          : "text-gray-400 fill-gray-600"
      )}
    />
    {badge.charAt(0).toUpperCase() + badge.slice(1)}
  </Badge>
);

const ProductComponent: React.FC<ProductComponentProps> = ({ product }) => {
  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg">
      <div className="p-4 bg-background">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className={cn("text-xl font-bold", product.textStyle)}>
                {product.name}
              </h3>
              {product.badge ? (
                <div className="flex flex-wrap gap-2">
                  <BadgeComponent badge={product.badge} />
                </div>
              ) : null}
            </div>

            <p className="text-muted-foreground">
              {truncateText(product.tagline, 250)}
            </p>
          </div>
        </div>
        <div className="mb-4 flex flex-row items-center justify-between gap-8">
          <Link
            to="/product/$productId"
            params={{ productId: product.id }}
            className="w-full"
          >
            <Button variant="default" className="w-full">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export { ProductComponent };
