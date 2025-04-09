import { ReactNode } from "react";
import {
  AlertTriangle,
  Info,
  Lightbulb,
  Ban,
  BookOpenCheck,
  CircleHelp,
} from "lucide-react";
import { JSX } from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type AlertType = "note" | "tip" | "caution" | "deprecated" | "info" | "help";

const icons: Record<AlertType, JSX.Element> = {
  note: <BookOpenCheck className="h-5 w-5 text-blue-600" />,
  tip: <Lightbulb className="h-5 w-5 text-emerald-600" />,
  caution: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  deprecated: <Ban className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-indigo-600" />,
  help: <CircleHelp className="h-5 w-5 text-purple-600" />,
};

const styles: Record<AlertType, string> = {
  note: "bg-emerald-500/10 dark:bg-emerald-600/30",
  tip: "bg-blue-500/10 dark:bg-blue-600/30",
  caution: "bg-yellow-500/10 dark:bg-yellow-600/30",
  deprecated: "bg-red-500/10 dark:bg-red-600/30",
  info: "bg-indigo-500/10 dark:bg-indigo-600/30",
  help: "bg-purple-500/10 dark:bg-purple-600/30",
};

export function AlertMDX({
  type,
  children,
  title,
}: {
  type: AlertType;
  children: { props: { children: ReactNode } };
  title?: string;
}) {
  return (
    <Alert className={cn("border-none", styles[type])} id="mdx-exclusion">
      {icons[type]}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children.props.children}</AlertDescription>
    </Alert>
  );
}
