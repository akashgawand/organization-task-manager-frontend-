import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { StatusDistribution } from "@/app/services/analyticsServices";

interface TaskDistributionChartProps {
  data: StatusDistribution[];
}

export default function TaskDistributionChart({
  data,
}: TaskDistributionChartProps) {
  // Map our data to highcharts format
  const seriesData = data
    .map((d) => {
      const nameLower = d.name.toLowerCase();
      let color = "#94a3b8"; // To Do fallback

      if (nameLower.includes("progress")) color = "rgb(var(--color-info))";
      else if (nameLower.includes("review"))
        color = "rgb(var(--color-warning))";
      else if (nameLower.includes("done")) color = "rgb(var(--color-success))";
      else if (nameLower.includes("blocked"))
        color = "rgb(var(--color-danger))";

      return {
        name: d.name,
        y: d.value,
        color,
      };
    })
    .filter((d) => d.y > 0);

  const fallbackTotal = seriesData.reduce((acc, curr) => acc + curr.y, 0) || 1;

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      style: { fontFamily: "inherit" },
      height: 250,
      margin: [0, 0, 0, 0],
    },
    title: { text: undefined }, // removes title
    tooltip: {
      headerFormat: "",
      pointFormatter: function () {
        const percent = Math.round((this.y! / fallbackTotal) * 100);
        return `<b>${this.y}</b> (${percent}%)<br/>${this.name}`;
      },
      backgroundColor: "#fff",
      borderColor: "rgba(0,0,0,0.08)",
      borderRadius: 8,
      shadow: true,
      style: { fontSize: "12px" },
    },
    plotOptions: {
      pie: {
        innerSize: "60%",
        borderWidth: 2,
        borderColor: "rgb(var(--color-surface))",
        dataLabels: {
          enabled: false,
        },
      },
    },
    series: [
      {
        type: "pie",
        name: "Tasks",
        data: seriesData,
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      {/* Legend */}
      <div className="w-full space-y-2 mt-2">
        {seriesData.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                {item.y} ({Math.round((item.y / fallbackTotal) * 100)}%)
              </span>
            </div>
            <div className="h-1.5 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(item.y / fallbackTotal) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
