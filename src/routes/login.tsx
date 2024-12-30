import { createFileRoute, Link } from "@tanstack/react-router";
import { FC, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLogin } from "@/gql/gpl";
import { LoadingSpinner } from "@/components/ui/spinner";

const Login: FC = () => {
  const { mutate, isPending, data } = useLogin({ token: true });

  useEffect(() => {
    console.log(data);
    if (data?.token) {
      const token = data.token;
      localStorage.setItem("jwt", token);

      window.location.href = "/";
    }
  }, [data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutate({
      email: (event.target as any).email.value,
      password: (event.target as any).password.value,
    });
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            <Link
              to="/register"
              className="text-primary hover:underline hover:text-primary-dark"
            >
              Don&apos;t have an account? Register here
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              {isPending ? <LoadingSpinner /> : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/login")({
  component: Login,
});
