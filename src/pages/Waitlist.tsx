import React from "react";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product";
import { BackgroundBeams } from "@/components/ui/background-beams";

interface WaitlistProps {
  product: Product;
}

export const Waitlist: React.FC<WaitlistProps> = () => {
  return (
    <div className="absolute w-full left-0 h-full">
      <div className="h-[40rem] w-full rounded-md relative flex flex-col items-center justify-center antialiased">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
            Join the waitlist
          </h1>
          <p />
          <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
            We are working hard to bring you the best experience. Sign up to get
            early access!
          </p>
          <Input
            type="text"
            placeholder="hi@manuarora.in"
            className="rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-500  w-full relative z-10 mt-4  bg-neutral-950 placeholder:text-neutral-700"
          />
        </div>
        <BackgroundBeams />
      </div>
    </div>
  );
};
