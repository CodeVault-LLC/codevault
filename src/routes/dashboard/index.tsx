import { FC } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UploadIcon } from "lucide-react";
import { Bar } from "react-chartjs-2"; // Import a fictitious chart library
import {
  LinearScale,
  Chart,
  CategoryScale,
  BarElement,
  BarController,
} from "chart.js";
import { useCurrentUser } from "@/client/hooks/useUser";
import { Button } from "@/components/ui/button";

const Index: FC = () => {
  const { data } = useCurrentUser();
  Chart.register(LinearScale);
  Chart.register(CategoryScale);
  Chart.register(BarElement);
  Chart.register(BarController);

  const recentProjects = [
    { id: 1, name: "Project A", status: "In Progress" },
    { id: 2, name: "Project B", status: "Completed" },
    { id: 3, name: "Project C", status: "Pending" },
    { id: 4, name: "Project D", status: "In Progress" },
  ];

  const statisticsData = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Number of Projects",
        data: [12, 19, 3, 5, 2],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4">
      <div className="w-full h-20 rounded-md border border-teal-900 p-4 pt-1 flex justify-between items-center">
        <div>
          <h4 className="dark:text-white text-lg">
            Welcome back, {data?.username}!
          </h4>
          <p className="dark:text-gray-400 text-sm">
            Today is{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
        </div>
        <div>
          <Button variant="default">
            <UploadIcon className="mr-2" /> Upload Files
          </Button>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Projects</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-sm text-gray-500">{project.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="w-full">
          <Bar
            data={statisticsData}
            options={{
              scales: {
                y: {
                  type: "linear",
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/")({
  component: Index,
});
