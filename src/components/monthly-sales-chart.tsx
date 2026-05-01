"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { fmtCOP } from "@/lib/formatters";

export type MonthlySalesPoint = {
  month: string;
  ventas: number;
};

const chartConfig = {
  ventas: {
    color: "#d4a574",
    label: "Ventas",
  },
} satisfies ChartConfig;

function getTrend(data: MonthlySalesPoint[]) {
  const monthsWithSales = data.filter((item) => item.ventas > 0);
  const current = monthsWithSales[monthsWithSales.length - 1];
  const previous = monthsWithSales[monthsWithSales.length - 2];

  if (!current || !previous || previous.ventas === 0) {
    return null;
  }

  return ((current.ventas - previous.ventas) / previous.ventas) * 100;
}

export function MonthlySalesChart({ data }: { data: MonthlySalesPoint[] }) {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const monthOptions = useMemo(
    () => data.filter((item) => item.ventas > 0).map((item) => item.month),
    [data]
  );
  const filteredData =
    selectedMonth === "all"
      ? data
      : data.filter((item) => item.month === selectedMonth);
  const trend = getTrend(filteredData);
  const total = filteredData.reduce((sum, item) => sum + item.ventas, 0);
  const showDots = selectedMonth !== "all";

  return (
    <Card className="dashboard-chart-card">
      <CardHeader className="dashboard-chart-card-header">
        <div>
          <CardTitle>Ventas por mes</CardTitle>
          <CardDescription>Total enviado en pesos colombianos</CardDescription>
        </div>
        <select
          aria-label="Filtrar ventas por mes"
          className="fin-input mono dashboard-chart-select"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        >
          <option value="all">Todos los meses</option>
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[180px] w-full"
          config={chartConfig}
          initialDimension={{ height: 180, width: 900 }}
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => String(value).slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickFormatter={(value) => `${Number(value) / 1000000}M`}
              tickLine={false}
              tickMargin={8}
              width={48}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => (
                    <span className="font-mono font-medium text-foreground">
                      {fmtCOP(Number(value))}
                    </span>
                  )}
                />
              }
              cursor={false}
            />
            <Line
              dataKey="ventas"
              dot={showDots}
              stroke="var(--color-ventas)"
              strokeWidth={2}
              type="linear"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="dashboard-chart-footer">
        <div className="flex gap-2 leading-none font-medium">
          {trend === null
            ? "Aun no hay suficientes meses para comparar"
            : `Variación mensual ${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%`}
          {trend !== null ? <TrendingUp data-icon="inline-end" /> : null}
        </div>
        <div className="leading-none text-muted-foreground">
          Total acumulado: {fmtCOP(total)}
        </div>
      </CardFooter>
    </Card>
  );
}
