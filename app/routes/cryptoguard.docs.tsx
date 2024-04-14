import { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "CryptoGuard | CodeVault" },
    {
      name: "description",
      content:
        "CryptoGuard is a versatile encryption and decryption tool designed to provide robust file security.",
    },
  ];
};