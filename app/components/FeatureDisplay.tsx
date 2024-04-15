import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { cn } from "~/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FeatureDisplay = ({ features }: { features: any }) => {
  const [selected, setSelected] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 100);

    if (timer === 105) {
      setSelected((prev) => (prev + 1) % features.length);
      setTimer(0);
    }

    return () => clearInterval(interval);
  }, [features.length, timer]);

  return (
    <div className="flex flex-col gap-2">
      {features.map((feature: any, index: number) => (
        <div
          key={feature.id}
          className="flex flex-col p-2 w-full h-full gap-2 transition-all duration-300"
        >
          <button
            className="flex flex-row gap-4 my-8"
            onClick={() => {
              if (index === selected) {
                setTimer(0);
              }
              setSelected(index);
              setTimer(0);
            }}
          >
            <Progress
              value={index === selected ? timer : 0}
              className={cn(index === selected ? "h-16" : "h-8")}
              direction="vertical"
            />
            <div className="flex flex-col gap-2 justify-start">
              <h3
                className={cn(
                  "text-base font-semibold text-left",
                  index === selected ? "text-lg" : ""
                )}
              >
                {feature.name}
              </h3>
              <p
                className={cn(selected !== index ? "hidden" : "", "text-left")}
              >
                {feature.description}
              </p>
            </div>
          </button>
          <img
            src={feature.image}
            alt={feature.name}
            className={cn(
              "h-[450px] w-[600px]",
              selected !== index ? "hidden" : ""
            )}
          />
        </div>
      ))}
    </div>
  );
};
