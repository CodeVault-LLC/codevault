import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, formatDate } from "@/lib/utils";

// eslint-disable-next-line react-refresh/only-export-components
export const timelineItemVariants = cva("relative flex flex-col gap-3", {
  variants: {
    position: {
      left: "items-start text-left",
      right: "items-end text-right",
    },
  },
  defaultVariants: {
    position: "left",
  },
});

export interface TimelineItemProps
  extends VariantProps<typeof timelineItemVariants> {
  title: string;
  subtitle?: string;
  period?: string | Date;
  description?: string;
  technologies?: string[];
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  position?: "left" | "right";
  colorClass?: string; // Tailwind class to override dot and line colors
}

export function TimelineItem({
  title,
  subtitle,
  period,
  description,
  technologies = [],
  icon,
  badge,
  position,
  colorClass = "border-primary bg-background",
}: TimelineItemProps) {
  const userLanguage = navigator.language || "en-US";

  return (
    <div
      className={cn(timelineItemVariants({ position }), "pl-8 pb-12 last:pb-0")}
    >
      {/* Dot */}
      <div
        className={cn(
          "absolute h-3 w-3 -translate-x-1/2 left-px top-3 rounded-full border-2",
          colorClass
        )}
      />

      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 h-9 w-9 bg-accent rounded-full flex items-center justify-center">
          {icon}
        </div>
        <span className="text-base sm:text-lg font-semibold">{title}</span>
        {badge}
      </div>

      {subtitle && (
        <h3 className="text-lg sm:text-xl font-medium">{subtitle}</h3>
      )}

      {period && (
        <div className="text-sm text-muted-foreground">
          {typeof period === "string"
            ? period
            : formatDate(period, userLanguage)}
        </div>
      )}

      {description && (
        <p className="text-sm sm:text-base text-muted-foreground">
          {description}
        </p>
      )}

      {technologies?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <div
              key={tech}
              className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
            >
              {tech}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface TimelineProps {
  items: TimelineItemProps[];
  alternating?: boolean;
  className?: string;
  lineColorClass?: string;
}

export function Timeline({
  items,
  alternating = false,
  className,
  lineColorClass = "border-l-2 border-border",
}: TimelineProps) {
  return (
    <div
      className={cn("max-w-screen-sm mx-auto py-12 md:py-20 px-6", className)}
    >
      <div className="relative ml-3">
        {/* Timeline line */}
        <div className={cn("absolute left-0 top-4 bottom-0", lineColorClass)} />

        {items.map((item, index) => (
          <TimelineItem
            key={index}
            {...item}
            position={
              alternating ? (index % 2 === 0 ? "left" : "right") : item.position
            }
          />
        ))}
      </div>
    </div>
  );
}
