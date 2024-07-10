import { Link } from "@tanstack/react-router";
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="dark:bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="mt-8 grid grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-3 lg:gap-y-16">
            <div className="col-span-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  CodeVault
                </h2>

                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  CodeVault is a perfect solution when in needs of products! It
                  offers a wide range of products that are made by developers
                  for developers.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-8 dark:border-gray-800">
          <div className="sm:flex sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()}. CodeVault LLC. All rights
              reserved.
            </p>

            <ul className="mt-8 flex flex-wrap justify-start gap-4 text-xs sm:mt-0 lg:justify-end">
              <li>
                <Link
                  to="/"
                  className="text-gray-500 transition hover:opacity-75 dark:text-gray-400"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-gray-500 transition hover:opacity-75 dark:text-gray-400"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  className="text-gray-500 transition hover:opacity-75 dark:text-gray-400"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
