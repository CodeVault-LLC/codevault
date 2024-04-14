interface Feature {
  name: string;
  description: string;

  icon: React.ReactNode;
}

type Props = {
  features: Feature[];
};

export const Features: React.FC<Props> = ({
  features,
}: {
  features: Feature[];
}) => {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 items-start gap-12">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col">
            <div className="relative flex justify-center items-center size-12 bg-white rounded-xl before:absolute before:-inset-px before:-z-[1] before:rounded-xl dark:bg-[#5582ed1f] bg-[#5582ed1f]">
              {feature.icon}
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {feature.name}
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
