import { Link } from "@tanstack/react-router";
import { Card } from "./ui/card";
import { Product, ReleasePhase } from "@/types/product";
import { Badge } from "./ui/badge";
import {
  CircleIcon,
  DoorOpenIcon,
  GitForkIcon,
  Github,
  StarIcon,
} from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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

const GitHubStats: React.FC = () => (
  <div className="flex flex-col items-end gap-4 text-sm text-muted-foreground">
    <div className="flex items-center gap-2">
      <StarIcon className="h-4 w-4 text-yellow-400" />
      <span>1.2k</span>
    </div>
    <div className="flex items-center gap-2">
      <GitForkIcon className="h-4 w-4 text-green-400" />
      <span>500</span>
    </div>
    <div className="flex items-center gap-2">
      <DoorOpenIcon className="h-4 w-4 text-red-400" />
      <span>12</span>
    </div>
  </div>
);

const ProductComponent: React.FC<ProductComponentProps> = ({ product }) => {
  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg">
      <div className="p-4 bg-background">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{product.name}</h3>
              {product.badge && (
                <div className="flex flex-wrap gap-2">
                  <BadgeComponent badge={product.badge} />
                </div>
              )}
            </div>

            <p className="text-muted-foreground">
              {truncateText(product.tagline, 250)}
            </p>
          </div>
          {product.github?.url === "Not Now!" && (
            <>
              <Separator className="mx-4 h-28" orientation="vertical" />
              <GitHubStats />
            </>
          )}
        </div>
        <div className="mb-4 flex flex-row items-center justify-between gap-8">
          {product.github ? (
            <Link
              to="/product/$productId"
              params={{ productId: product.id }}
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              disabled={product.release.phase !== ReleasePhase.stable}
            >
              Add to Cart
            </Button>
          )}
          {product.github?.url && product.github.url !== "Not Now!" && (
            <a
              href={product.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row gap-2 w-20 hover:bg-accent hover:text-accent-foreground cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 p-2"
            >
              GitHub
              <Github className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductComponent;
