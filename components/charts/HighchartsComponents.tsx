"use client";

import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

if (typeof window !== 'undefined' && typeof Highcharts === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const HC_more = require('highcharts/highcharts-more');
    if (typeof HC_more === 'function') {
        HC_more(Highcharts);
    } else if (HC_more && typeof HC_more.default === 'function') {
        HC_more.default(Highcharts);
    }
}

// Helper to get computed CSS variables
const getComputedStyleValue = (variable: string) => {
    if (typeof window === "undefined") return "rgb(15, 23, 42)"; // fallback
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    // Fallbacks if styles aren't fully loaded
    const fallbacks: Record<string, { light: string; dark: string }> = {
        "--color-text-secondary": { light: "rgb(51, 65, 85)", dark: "rgb(212, 212, 216)" },
        "--color-text-primary": { light: "rgb(15, 23, 42)", dark: "rgb(250, 250, 250)" },
        "--color-surface": { light: "rgb(255, 255, 255)", dark: "rgb(24, 24, 27)" },
        "--color-border": { light: "rgb(226, 232, 240)", dark: "rgb(63, 63, 70)" },
        "--color-text-tertiary": { light: "rgb(100, 116, 139)", dark: "rgb(161, 161, 170)" },
    };

    const val = getComputedStyle(document.body).getPropertyValue(variable);
    if (!val || val.trim() === "") {
        return isDark ? fallbacks[variable]?.dark : fallbacks[variable]?.light;
    }
    return `rgb(${val})`;
};

const getCommonOptions = (): Highcharts.Options => ({
    chart: {
        backgroundColor: "transparent",
        style: {
            fontFamily: "inherit",
        },
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: {
        useHTML: true,
        labelFormatter: function (this: Highcharts.Point | Highcharts.Series) {
            const series = this as Highcharts.Series;
            return `<span title="Click to ${series.visible ? 'hide' : 'show'} ${series.name}">${series.name}</span>`;
        },
        itemStyle: {
            color: getComputedStyleValue("--color-text-secondary"),
            fontWeight: "500",
            cursor: "pointer",
        },
        itemHoverStyle: {
            color: getComputedStyleValue("--color-text-primary"),
        },
    },
    tooltip: {
        backgroundColor: getComputedStyleValue("--color-surface"),
        borderColor: getComputedStyleValue("--color-border"),
        style: {
            color: getComputedStyleValue("--color-text-primary"),
        },
        borderRadius: 8,
        shadow: true,
    },
});

// A hook to listen to theme changes
const useThemeColors = () => {
    const [key, setKey] = useState(0);

    useEffect(() => {
        // Redraw charts when theme changes via a MutationObserver on HTML class
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    setKey((prev) => prev + 1);
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return key;
};

// Returns raw RGB string to be used with rgba()
const getRawRgb = (variable: string) => {
    if (typeof window === "undefined") return "15, 23, 42"; // fallback
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    // Fallbacks
    const fallbacks: Record<string, { light: string; dark: string }> = {
        "--color-success": { light: "22, 163, 74", dark: "34, 197, 94" },
        "--color-accent": { light: "79, 70, 229", dark: "99, 102, 241" },
        "--color-info": { light: "37, 99, 235", dark: "56, 189, 248" },
        "--color-surface-hover": { light: "245, 247, 251", dark: "39, 39, 42" },
        "--color-border": { light: "226, 232, 240", dark: "63, 63, 70" }
    };
    const val = getComputedStyle(document.body).getPropertyValue(variable);
    if (!val || val.trim() === "") {
        return isDark ? fallbacks[variable]?.dark : fallbacks[variable]?.light;
    }
    return val.trim();
};


export const TrendHighchart = ({ data }: { data: { date: string; completedTasks: number; createdTasks: number }[] }) => {
    const themeKey = useThemeColors();
    const commonOptions = getCommonOptions();

    const borderRaw = getRawRgb("--color-border");
    const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

    // Theme-aware series colors
    const completedColor = isDark ? `rgb(${getRawRgb("--color-success")})` : "#10B981";
    const createdColor = isDark ? `rgb(${getRawRgb("--color-accent")})` : "#6366F1";
    const completedFillTop = isDark ? `rgba(${getRawRgb("--color-success")}, 0.3)` : "rgba(16, 185, 129, 0.25)";
    const createdFillTop = isDark ? `rgba(${getRawRgb("--color-accent")}, 0.3)` : "rgba(99, 102, 241, 0.2)";

    const options: Highcharts.Options = {
        ...commonOptions,
        chart: {
            ...commonOptions.chart,
            type: "areaspline",
            height: 300,
            spacing: [20, 0, 10, 0],
        },
        xAxis: {
            categories: data.map((d) => {
                const date = new Date(d.date);
                return `${date.getDate()} ${date.toLocaleString("en", { month: "short" })}`;
            }),
            lineColor: `rgba(${borderRaw}, 0.5)`,
            tickColor: `rgba(${borderRaw}, 0.5)`,
            labels: {
                style: { color: getComputedStyleValue("--color-text-tertiary") },
            },
        },
        yAxis: {
            title: { text: undefined },
            gridLineColor: `rgba(${borderRaw}, 0.3)`,
            gridLineDashStyle: "Dash",
            labels: {
                style: { color: getComputedStyleValue("--color-text-tertiary") },
            },
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.1,
                lineWidth: 3,
                marker: {
                    enabled: false,
                    symbol: "circle",
                    radius: 4,
                    states: { hover: { enabled: true } },
                },
            },
        },
        series: [
            {
                type: "areaspline",
                name: "Completed Tasks",
                data: data.map((d) => d.completedTasks),
                color: completedColor,
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, completedFillTop],
                        [1, "rgba(16, 185, 129, 0.0)"],
                    ],
                },
            },
            {
                type: "areaspline",
                name: "Created Tasks",
                data: data.map((d) => d.createdTasks),
                color: createdColor,
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, createdFillTop],
                        [1, "rgba(99, 102, 241, 0.0)"],
                    ],
                },
            },
        ],
    };

    return <HighchartsReact key={`trend-${themeKey}`} highcharts={Highcharts} options={options} />;
};

export const DonutHighchart = ({
    data,
    colors,
}: {
    data: { name: string; value: number }[];
    colors: string[];
}) => {
    const themeKey = useThemeColors();
    const commonOptions = getCommonOptions();

    // Map passed colors (which might be 'rgb(var(...))' strings) to actual resolved RGBs
    // since Highcharts might fail parsing `var(--...)`
    const resolvedColors = colors.map(c => {
        if (c.includes("var(--color-surface-hover)")) {
            const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true;
            return isDark ? "#CDFE12" : "#64F91F";
        }
        if (c.includes("var(--color-info)")) return `rgb(${getRawRgb("--color-info")})`;
        if (c.includes("var(--color-warning)")) return `rgb(${getRawRgb("--color-warning")})`;
        if (c.includes("var(--color-success)")) return `rgb(${getRawRgb("--color-success")})`;
        if (c.includes("var(--color-danger)")) return `rgb(${getRawRgb("--color-danger")})`;
        return c;
    });

    const options: Highcharts.Options = {
        ...commonOptions,
        chart: {
            ...commonOptions.chart,
            type: "pie",
            height: 300,
        },
        tooltip: {
            ...commonOptions.tooltip,
            pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)",
        },
        plotOptions: {
            pie: {
                innerSize: "70%",
                borderWidth: 0,
                colors: resolvedColors,
                dataLabels: {
                    enabled: false,
                },
                showInLegend: true,
            },
        },
        series: [
            {
                type: "pie",
                name: "Distribution",
                data: data.map((d) => ({
                    name: d.name,
                    y: d.value,
                })),
            },
        ],
    };

    return <HighchartsReact key={`donut-${themeKey}`} highcharts={Highcharts} options={options} />;
};

export const UserCompletedTasksChart = ({ data }: { data: { name: string; completed: number }[] }) => {
    const themeKey = useThemeColors();
    const commonOptions = getCommonOptions();

    const borderRaw = getRawRgb("--color-border");

    const options: Highcharts.Options = {
        ...commonOptions,
        chart: {
            ...commonOptions.chart,
            type: "column",
            inverted: true,
            height: 300,
        },
        xAxis: {
            categories: data.map(d => d.name),
            gridLineColor: `rgba(${borderRaw}, 0.3)`,
            lineColor: `rgba(${borderRaw}, 0.5)`,
            tickColor: `rgba(${borderRaw}, 0.5)`,
            labels: {
                style: {
                    color: getComputedStyleValue("--color-text-secondary"),
                    fontWeight: "500",
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: "Completed Tasks",
                style: { color: getComputedStyleValue("--color-text-tertiary") }
            },
            gridLineColor: `rgba(${borderRaw}, 0.3)`,
            gridLineDashStyle: "Dash",
            labels: {
                style: { color: getComputedStyleValue("--color-text-tertiary") },
            },
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            column: {
                colorByPoint: true,
                pointPadding: 0.1,
                groupPadding: 0.1,
                borderWidth: 0,
                borderRadius: 4,
                colors: ['#C7FE13', '#22D3EE', '#344D12', '#60A5FA', '#FCA5A5', '#FACC15', '#A78BFA', '#FB923C'],
            }
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: 'Completed Tasks: {point.y}',
            backgroundColor: getComputedStyleValue("--color-surface"),
            borderColor: getComputedStyleValue("--color-border"),
            style: { color: getComputedStyleValue("--color-text-primary") }
        },
        series: [
            {
                type: 'column',
                name: 'Completed',
                data: data.map(d => d.completed),
                borderRadius: 4
            }
        ]
    };

    return <HighchartsReact key={`user-completed-${themeKey}`} highcharts={Highcharts} options={options} />;
};
