import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Product } from "@/types/product";

type ProductComponentProps = {
  product: Product;
};

const ProductComponent: React.FC<ProductComponentProps> = ({ product }) => {
  const truncateDescription = (description: string, maxLength: number) =>
    description.length > maxLength
      ? description.substring(0, maxLength) + "..."
      : description;

  return (
    <Card className="flex flex-col gap-8 justify-between">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
        <CardDescription className="text-base">
          {truncateDescription(product.description, 1000)}
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <Button variant="outline" asChild>
          <Link
            to={"/product/$productId"}
            params={{
              productId: product.id,
            }}
          >
            View Product
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductComponent;