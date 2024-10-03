import { FC } from "react";

const Unauthorized: FC = () => {
  return (
    <div className="border border-red-600 text-red-600 p-4 rounded-md">
      <h4 className="text-lg font-semibold">
        You are not authorized to view this page.
      </h4>
      <p className="text-sm">
        Try to refresh the page or contact the project administrator.
      </p>
    </div>
  );
};

export { Unauthorized };
