import { Button } from "./ui/button";

export const CookieRequest: React.FC = () => {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 dark:bg-zinc-900 bg-gray-100 dark:text-white text-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <p>
            This website uses cookies to ensure you get the best experience on
            our website.
          </p>
          <div className="flex flex-row gap-2">
            <Button
              variant="default"
              onClick={() => localStorage.setItem("cookie-accepted", "true")}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              onClick={() => localStorage.setItem("cookie-accepted", "false")}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
