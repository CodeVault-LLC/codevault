import { Link } from "@remix-run/react";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ProductComponentProps = {
  product: Product;
};

const ProductComponent: React.FC<ProductComponentProps> = ({
  product,
}: {
  product: Product;
}) => {
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
          <Link to={product.link}>View Product</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductComponent;
