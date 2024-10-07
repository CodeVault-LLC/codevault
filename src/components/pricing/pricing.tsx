import { FC } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex gap-2">
    <CheckCircle2 size={18} className="my-auto text-green-400" />
    <p className="pt-0.5 text-zinc-700 dark:text-zinc-300 text-sm">{text}</p>
  </div>
);

export const PricingCard: FC = () => {
  const title = "Starter";
  const description = "For small teams getting started";
  const monthlyPrice = 0;
  const yearlyPrice = 0;
  const isYearly = false;
  const popular = false;
  const exclusive = false;
  const features = [
    "Unlimited projects",
    "Unlimited storage",
    "Cancel anytime",
  ];
  const actionLabel = "Get Started";

  return (
    <Card
      className={cn(
        `w-72 flex flex-col justify-between py-1 ${popular ? "border-rose-400" : "border-zinc-700"} mx-auto sm:mx-0`,
        {
          "animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] transition-colors":
            exclusive,
        }
      )}
    >
      <div>
        <CardHeader className="pb-8 pt-4">
          {isYearly && yearlyPrice && monthlyPrice ? (
            <div className="flex justify-between">
              <CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">
                {title}
              </CardTitle>
              <div
                className={cn(
                  "px-2.5 rounded-xl h-fit text-sm py-1 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white",
                  {
                    "bg-gradient-to-r from-orange-400 to-rose-400 dark:text-black ":
                      popular,
                  }
                )}
              >
                Save ${monthlyPrice * 12 - yearlyPrice}
              </div>
            </div>
          ) : (
            <CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">
              {title}
            </CardTitle>
          )}
          <div className="flex gap-0.5">
            <h3 className="text-3xl font-bold">
              {(() => {
                if (yearlyPrice && isYearly) {
                  return `$${yearlyPrice}`;
                } else if (monthlyPrice) {
                  return `$${monthlyPrice}`;
                }
                return "Custom";
              })()}
            </h3>
            <span className="flex flex-col justify-end text-sm mb-1">
              {(() => {
                if (yearlyPrice && isYearly) {
                  return "/year";
                } else if (monthlyPrice) {
                  return "/month";
                }
                return null;
              })()}
            </span>
          </div>
          <CardDescription className="pt-1.5 h-12">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {features.map((feature: string) => (
            <CheckItem key={feature} text={feature} />
          ))}
        </CardContent>
      </div>
      <CardFooter className="mt-2">
        <Button variant="outline" className="w-full">
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};
