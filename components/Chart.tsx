"use client"; 

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; // UI components for card layout
import { ChartConfig, ChartContainer } from "@/components/ui/chart"; // Custom chart container and config types
import { calculatePercentage, convertFileSize } from "@/lib/utils"; // Utility functions for percentage calculation and file size conversion

// Chart configuration object defining labels and colors for different data keys.
// This ensures consistent styling and labeling across the chart component.
const chartConfig = {
  size: {
    label: "Size",
  },
  used: {
    label: "Used",
    color: "white",
  },
} satisfies ChartConfig; // Ensures the object matches the expected ChartConfig type

// Chart component accepts a single prop 'used' representing the amount of storage used (in bytes or relevant units).
export const Chart = ({ used = 0 }: { used: number }) => {
  // Prepare the data array for RadialBarChart
  // 'storage' key is used for mapping the data; '10' holds the used value; 'fill' controls bar color.
  const chartData = [{ storage: "used", 10: used, fill: "white" }];

  return (
    <Card className="chart">
      {/* CardContent holds the chart visualization, with no padding for tight layout */}
      <CardContent className="flex-1 p-0">
        {/* ChartContainer wraps the chart and applies chartConfig settings */}
        <ChartContainer config={chartConfig} className="chart-container">
          <RadialBarChart
            data={chartData}
            startAngle={90} // Start drawing the chart from 90 degrees (top center)
            endAngle={Number(calculatePercentage(used)) + 90} // End angle based on the used percentage + 90 degrees offset
            innerRadius={80} // Inner radius of the radial bars, controls the donut hole size
            outerRadius={110} // Outer radius, controls overall size of the chart
          >
            {/* PolarGrid displays concentric circles without radial lines */}
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="polar-grid"
              polarRadius={[86, 74]} // Define specific radii for grid circles
            />
            {/* RadialBar represents the actual used storage bar with rounded corners */}
            <RadialBar dataKey="storage" background cornerRadius={10} />
            {/* PolarRadiusAxis hides axis ticks and lines, customizes label */}
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              {/* Custom label rendered in the center of the chart */}
              <Label
                content={({ viewBox }) => {
                  // Defensive check for valid viewBox containing center coordinates
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {/* Display percentage of storage used, stripping leading zeros */}
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="chart-total-percentage"
                        >
                          {used && calculatePercentage(used)
                            ? calculatePercentage(used)
                                .toString()
                                .replace(/^0+/, "")
                            : "0"}
                          %
                        </tspan>
                        {/* Sub-label describing what the percentage means */}
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24} // Offset below the percentage number
                          className="fill-white/70"
                        >
                          Space used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {/* CardHeader contains textual information below the chart */}
      <CardHeader className="chart-details">
        <CardTitle className="chart-title">Available Storage</CardTitle>
        <CardDescription className="chart-description">
          {/* Show used storage in human-readable format or default to "2GB" if zero */}
          {used ? convertFileSize(used) : "2GB"} / 2GB
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
