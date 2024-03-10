import React, { useState } from "react";
import { GithubBranch } from "~/types/github-branch";

type NewVersionProps = {
  data: GithubBranch;
  cookie: Record<string, string>;
};

const NewVersion: React.FC<NewVersionProps> = ({
  data,
  cookie,
}: {
  data: GithubBranch;
  cookie: Record<string, string>;
}) => {
  const [closed, setClosed] = useState(false);

  const handleClose = () => {
    setClosed(true);
  };

  if (closed) {
    return null; // Return null if the component is closed
  }

  return (
    <>
      {data &&
      data?.author &&
      data?.author?.avatar_url &&
      cookie &&
      cookie?.version &&
      cookie?.version[data.id] === "closed" ? null : (
        <div className="relative p-4 border border-teal-600 rounded-lg shadow-md w-6/12">
          <button
            onClick={handleClose}
            className="absolute top-0 right-0 m-2 p-1 rounded-sm hover:bg-gray-600 transition-colors duration-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white transition-colors duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <a
            className="text-xl font-semibold text-teal-600 hover:underline"
            href={data.html_url}
            target="_blank"
            rel="noreferrer"
          >
            New Version Available
          </a>

          <div className="flex flex-row items-center mt-4">
            {data.author?.avatar_url && (
              <img
                src={data?.author?.avatar_url}
                alt={data?.author?.node_id}
                height={48}
                width={48}
                className="rounded-full mr-4"
              />
            )}

            <div>
              <p className="text-gray-700">
                {data.name
                  ? data.name
                  : new Date(data.published_at).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Released by {data.author?.login}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewVersion;
