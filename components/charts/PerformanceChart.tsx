"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendData } from "@/lib/analytics";

interface PerformanceChartProps {
  data: TrendData[];
  title: string;
  type?: "line" | "area";
}

export default function PerformanceChart({
  data,
  title,
  type = "area",
}: PerformanceChartProps) {
  const Chart = type === "area" ? AreaChart : LineChart;
  const ChartComponent = type === "area" ? Area : Line;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Chart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="rgb(var(--color-success))"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="rgb(var(--color-success))"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="rgb(var(--color-accent))"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="rgb(var(--color-accent))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgb(var(--color-text-secondary))" }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
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
          {type === "area" ? (
            <>
              <Area
                type="monotone"
                dataKey="completedTasks"
                stroke="rgb(var(--color-success))"
                fillOpacity={1}
                fill="url(#colorCompleted)"
                name="Completed Tasks"
              />
              <Area
                type="monotone"
                dataKey="createdTasks"
                stroke="rgb(var(--color-accent))"
                fillOpacity={1}
                fill="url(#colorCreated)"
                name="Created Tasks"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="completedTasks"
                stroke="rgb(var(--color-success))"
                strokeWidth={2}
                name="Completed Tasks"
              />
              <Line
                type="monotone"
                dataKey="createdTasks"
                stroke="rgb(var(--color-accent))"
                strokeWidth={2}
                name="Created Tasks"
              />
            </>
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
