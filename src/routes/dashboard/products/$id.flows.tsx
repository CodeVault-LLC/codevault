import { createFileRoute } from "@tanstack/react-router";
import { FC } from "react";
import { ReactFlow, Controls, Background, Node } from "@xyflow/react";

const FlowsLayout: FC = () => {
  const nodes: Node[] = [
    {
      id: "1",
      type: "input",
      data: { label: "Input Node" },
      position: { x: 250, y: 25 },
    },
    {
      id: "2",
      data: { label: "Another Node" },
      position: { x: 100, y: 125 },
    },
    {
      id: "3",
      data: { label: "A Third Node" },
      position: { x: 400, y: 125 },
    },
  ];

  return (
    <>
      <hr className="mt-4" />
      <div style={{ height: "60vh" }}>
        <ReactFlow colorMode="dark" nodes={nodes}>
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <div className="mt-4" />
    </>
  );
};

export const Route = createFileRoute("/dashboard/products/$id/flows")({
  component: FlowsLayout,
});
