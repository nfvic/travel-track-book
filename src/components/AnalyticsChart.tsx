
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { format } from "date-fns";

export default function AnalyticsChart() {
  const { data: analyticsData, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = (analyticsData ?? [])
    .filter((row) => row.day)
    .slice()
    .reverse()
    .map((row) => ({
      day: format(new Date(row.day!), "MMM d"),
      Revenue: (row.total_amount_cents ?? 0) / 100,
      Bookings: row.total_booked_trips ?? 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Revenue") {
                  return [`$${(value as number).toFixed(2)}`, "Revenue"];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Revenue"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line yAxisId="right" type="monotone" dataKey="Bookings" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
