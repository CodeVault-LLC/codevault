import { CheckCircle } from "lucide-react";

type Props = {
  features: string[];
};

export const FeatureList: React.FC<Props> = ({ features }) => {
  return (
    <div className="grid grid-cols-3 gap-12">
      {features.map((feature, index: number) => (
        <div key={index} className="flex flex-row items-center gap-2">
          <CheckCircle className="text-green-500" />
          <p className="dark:text-gray-200 text-gray-800">{feature}</p>
        </div>
      ))}
    </div>
  );
};
