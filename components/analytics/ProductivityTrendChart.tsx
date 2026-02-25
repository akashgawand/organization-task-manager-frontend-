import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { TrendDataPoint } from "@/app/services/analyticsServices";

interface ProductivityTrendChartProps {
  data: TrendDataPoint[];
}

export default function ProductivityTrendChart({
  data,
}: ProductivityTrendChartProps) {
  const categories =
    data.length > 0
      ? data.map((d) => new Date(d.date).getDate().toString())
      : ["1"];
  const counts = data.length > 0 ? data.map((d) => d.completedTasks || 0) : [0];

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
      height: 220,
    },
    title: { text: undefined }, // removes title
    xAxis: {
      categories,
      labels: {
        style: {
          color: "rgb(var(--color-text-primary))",
          fontSize: "11px",
        },
      },
      lineWidth: 0,
      tickWidth: 0,
    },
    yAxis: {
      min: 0,
      allowDecimals: false,
      title: { text: undefined },
      labels: {
        style: { color: "rgb(var(--color-text-primary))", fontSize: "11px" },
      },
      gridLineColor: "rgba(0,0,0,0.06)",
      gridLineDashStyle: "ShortDash",
    },
    tooltip: {
      headerFormat: "",
      pointFormat: "<b>{point.y} tasks</b> Completed",
      backgroundColor: "#fff",
      borderColor: "rgba(0,0,0,0.08)",
      borderRadius: 8,
      shadow: true,
      style: { fontSize: "12px" },
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        maxPointWidth: 40,
        color: "rgb(var(--color-accent))",
      },
      series: {
        borderWidth: 0,
      },
    },
    series: [
      {
        type: "column",
        name: "Tasks",
        data: counts,
        showInLegend: false,
      },
    ],
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
}
