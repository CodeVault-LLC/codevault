import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

("use client");

const user = {
  email: "user@example.com",
  username: "johndoe",
  avatar: "/placeholder.svg?height=100&width=100",
  billingInfo: {
    latestPayment: { amount: "$50.00", date: "2023-05-15", status: "Paid" },
    invoices: [
      {
        id: "INV-001",
        date: "2023-05-15",
        amount: "$50.00",
        status: "Paid",
        lastCardDigits: "9954",
        paymentMethod: "Visa",
      },
      {
        id: "INV-002",
        date: "2023-04-15",
        amount: "$50.00",
        status: "Paid",
        lastCardDigits: "9954",
        paymentMethod: "Visa",
      },
      {
        id: "INV-003",
        date: "2023-03-15",
        amount: "$50.00",
        status: "Paid",
        lastCardDigits: "9954",
        paymentMethod: "Visa",
      },
    ],
    paymentHistory: [
      {
        id: "PAY-001",
        date: "2023-05-15",
        amount: "$50.00",
        method: "Credit Card",
      },
      {
        id: "PAY-002",
        date: "2023-04-15",
        amount: "$50.00",
        method: "Credit Card",
      },
      {
        id: "PAY-003",
        date: "2023-03-15",
        amount: "$50.00",
        method: "PayPal",
      },
    ],
    products: [{ id: "PROD-001", name: "Pro Plan", price: "$50.00/month" }],
  },
};

const UserProfile = () => {
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <p className="text-sm text-gray-600 mb-6">
        This page is only visible to you.
      </p>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 p-1 rounded-md">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Account Information
              </CardTitle>
              <CardDescription>
                Update your account details here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={avatar} alt={username} />
                      <AvatarFallback>
                        {username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-[300px]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Billing Information
              </CardTitle>
              <CardDescription>
                Manage your billing details and subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Latest Payment</h3>
                <div className="p-4 rounded-md border">
                  <p>
                    <strong>Amount:</strong>{" "}
                    {user.billingInfo.latestPayment.amount}
                  </p>
                  <p>
                    <strong>Date:</strong> {user.billingInfo.latestPayment.date}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      {user.billingInfo.latestPayment.status}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Invoices</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.billingInfo.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>
                          {invoice.paymentMethod} ending in{" "}
                          {invoice.lastCardDigits}
                        </TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Payment History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.billingInfo.paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Your Products</h3>
                <ul className="list-disc pl-5">
                  {user.billingInfo.products.map((product) => (
                    <li key={product.id}>
                      <a
                        href={`#${product.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {product.name}
                      </a>{" "}
                      - {product.price}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-gray-600 border-l-4 border-blue-400 p-4 mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Billing Information
                </h3>
                <ul className="list-disc pl-5 text-gray-700 dark:text-white">
                  <li>Your next billing date is on the 15th of next month.</li>
                  <li>
                    We&apos;ll email you a receipt each time your card is
                    charged.
                  </li>
                  <li>You can change or cancel your plan at any time.</li>
                  <li>
                    If you have any questions, please contact our support team.
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                Download All Invoices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Your Products
              </CardTitle>
              <CardDescription>
                View and manage your purchased products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.billingInfo.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const Route = createFileRoute("/profile")({
  component: UserProfile,
});
