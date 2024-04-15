import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "~/lib/utils";

type Direction = "horizontal" | "vertical";

type ProgressProps = {
  direction: Direction;
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps & React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, react/prop-types
>(({ className, value, direction, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-full bg-primary/20",
      direction === "vertical" ? "h-full w-2" : "h-2 w-full",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{
        transform:
          direction === "vertical"
            ? `translateY(-${100 - (value || 0)}%)`
            : `translateX(-${100 - (value || 0)}%)`,
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
