import { FaMailBulk } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa6";

export default function Footer() {
  const Sosials = [
    {
      sosial: "discord",
      link: "https://discord.gg",
      icon: <FaDiscord />,
    },
    {
      sosial: "gmail",
      link: "mailto:codevaultllc@gmail.com",
      icon: <FaMailBulk />,
    },
  ];

  return (
    <footer className="dark:bg-dark-theme dark:text-white p-8">
      <div className="flex flex-row justify-center items-center gap-4 p-8">
        <div className="grid grid-cols-3 gap-4 mt-8 w-full">
          {Sosials.map((sosial, index) => (
            <a
              key={index}
              href={sosial.link}
              className="w-6/12 text-center text-lg font-bold flex flex-row justify-center items-center gap-2"
            >
              <span>{sosial.icon}</span>
              <span>{sosial.sosial}</span>
            </a>
          ))}
        </div>

        <div className="mt-8 w-full">
          <p className="text-center text-gray-400">
            CodeVault is a collection of code snippets and products for
            developers.
          </p>
        </div>

        <div className="mt-8 w-full">
          <p className="text-center text-gray-400">
            <a
              href="/privacy"
              className="hover:underline transition-all duration-300 hover:text-yellow-500"
            >
              Privacy Policy
            </a>
          </p>

          <p className="text-center text-gray-400">
            <a
              href="/terms"
              className="hover:underline transition-all duration-300 hover:text-purple-500"
            >
              Terms of Service
            </a>
          </p>

          <p className="text-center text-gray-400">
            <a
              href="/disclaimer"
              className="hover:underline transition-all duration-300 hover:text-cyan-500"
            >
              Disclaimer
            </a>
          </p>
        </div>
      </div>

      <p className="text-center text-gray-400">© 2024 CodeVault</p>
    </footer>
  );
}
