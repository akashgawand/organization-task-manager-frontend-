"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WorkloadChartProps {
  data: {
    name: string;
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }[];
  title: string;
}

export default function WorkloadChart({ data, title }: WorkloadChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgb(var(--color-text-secondary))" }}
          />
          <YAxis tick={{ fill: "rgb(var(--color-text-secondary))" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(var(--color-surface))",
              border: "1px solid rgb(var(--color-border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey="completed"
            stackId="a"
            fill="rgb(var(--color-success))"
            name="Completed"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="inProgress"
            stackId="a"
            fill="rgb(var(--color-info))"
            name="In Progress"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="pending"
            stackId="a"
            fill="rgb(var(--color-warning))"
            name="Pending"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
