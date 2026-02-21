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
  Cell,
} from "recharts";
import { TeamProductivity } from "@/lib/analytics";

interface ProductivityChartProps {
  data: TeamProductivity[];
  title: string;
}

const COLORS = [
  "rgb(var(--color-accent))",
  "rgb(var(--color-success))",
  "rgb(var(--color-info))",
  "rgb(var(--color-warning))",
  "rgb(var(--color-danger))",
];

export default function ProductivityChart({
  data,
  title,
}: ProductivityChartProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="teamName"
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
            dataKey="tasksCompleted"
            name="Tasks Completed"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
