import { FaCheckCircle } from "react-icons/fa";

type FeatureListProps = {
  features: string[];
};

const FeatureList: React.FC<FeatureListProps> = (props: FeatureListProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {props.features.map((feature, index: number) => (
        <div key={index} className="flex flex-row items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <p className="text-gray-200">{feature}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureList;
