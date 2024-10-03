import {
  Link,
  Outlet,
  createFileRoute,
  useParams,
} from "@tanstack/react-router";
import { FC } from "react";

const Settings: FC = () => {
  const { id }: { id: string } = useParams({ strict: false });

  const links = [
    {
      to: `/dashboard/projects/${id}/settings`,
      label: "General",
    },
    {
      to: `/dashboard/projects/${id}/settings/pricing`,
      label: "Pricing",
    },
    {
      to: `/dashboard/projects/${id}/settings/security`,
      label: "Security",
    },
    {
      to: `/dashboard/projects/${id}/settings/advanced`,
      label: "Advanced",
    },
  ];

  return (
    <div>
      <hr className="my-4" />

      <main className="flex flex-1 flex-col gap-4 md:gap-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav className="grid gap-4 text-sm text-muted-foreground">
            {links.map((link) => (
              <Link
                to={link.to}
                key={link.to}
                activeProps={{
                  className: "font-semibold text-primary",
                }}
                activeOptions={{
                  exact: true,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="grid gap-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/projects/$id/settings")({
  component: Settings,
});
