export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  avatarUrl: string;
}
