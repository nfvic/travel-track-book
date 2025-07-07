
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAdminAll } from "@/hooks/admin/useAdminAll";
import { DollarSign, Ticket, Bus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsCards() {
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics();
  const { data: busesData, isLoading: isBusesLoading } = useAdminAll("buses");

  const activeBusesCount = busesData?.filter((bus: any) => !bus.is_suspended).length ?? 0;
  const totalRevenue = analyticsData?.reduce((sum, row) => sum + (row.total_amount_cents ?? 0), 0) ?? 0;
  const totalBookings = analyticsData?.reduce((sum, row) => sum + (row.total_booked_trips ?? 0), 0) ?? 0;

  const isLoading = isAnalyticsLoading || isBusesLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From all paid bookings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalBookings}</div>
          <p className="text-xs text-muted-foreground">Successful trips booked</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
          <Bus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBusesCount}</div>
          <p className="text-xs text-muted-foreground">Buses not suspended</p>
        </CardContent>
      </Card>
    </div>
  );
}
