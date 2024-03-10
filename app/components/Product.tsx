import { motion } from "framer-motion";

type ProductComponentProps = {
  product: Product;
};

const ProductComponent: React.FC<ProductComponentProps> = ({
  product,
}: {
  product: Product;
}) => {
  return (
    <motion.div
      key={product.link}
      className={`p-4 border-2 border-gray-200 dark:border-gray-700 rounded-md cursor-pointer`}
      whileHover={{
        borderColor: product.colors.map((color) => `hsl(${color})`),
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      }}
      whileTap={{ scale: 0.98 }}
      animate={{ borderColor: "gray" }} // Add this line
    >
      <h3
        className="text-lg font-bold mb-2"
        style={{
          color: `hsl(${product.colors[0]})`,
        }}
      >
        {product.name}
      </h3>
      <p className="text-sm mb-4">{product.description}</p>
    </motion.div>
  );
};

export default ProductComponent;
