import { Link } from "@tanstack/react-router";
import { Separator } from "./ui/separator";
import { useTranslation } from "react-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-background px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-screen-xl mx-auto">
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            CodeVault
          </h2>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="max-w-screen-xl mx-auto pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()}. CodeVault.{" "}
            {t("footer.copyright")}
          </p>

          <ul className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            <li>
              <Link
                to="/terms-conditions"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("footer.terms_of_conditions")}
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("footer.privacy_policy")}
              </Link>
            </li>
            <li>
              <Link
                to="/returns"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                {t("footer.returns_refunds")}
              </Link>
            </li>
            <li>
              <Link
                to="/"
                className="transition hover:text-blue-600 dark:hover:text-blue-400"
              >
                Cookies
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
