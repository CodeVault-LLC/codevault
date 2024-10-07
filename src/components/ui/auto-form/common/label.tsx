import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export const AutoFormLabel = ({
  label,
  isRequired,
  className,
}: {
  label: string;
  isRequired: boolean;
  className?: string;
}) => {
  return (
    <FormLabel className={cn(className)}>
      {label}
      {isRequired ? <span className="text-destructive"> *</span> : null}
    </FormLabel>
  );
};
