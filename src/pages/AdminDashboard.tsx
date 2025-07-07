
import React from "react";
import BackButton from "@/components/BackButton";
import AnalyticsCards from "@/components/AnalyticsCards";
import AnalyticsChart from "@/components/AnalyticsChart";
import DemoTripControls from "@/components/admin/DemoTripControls";
import UsersTable from "@/components/admin/UsersTable";
import BusesTable from "@/components/admin/BusesTable";
import BookingsTable from "@/components/admin/BookingsTable";
import PaymentsTable from "@/components/admin/PaymentsTable";

export default function AdminDashboard() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-background/90 backdrop-blur-sm">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <BackButton />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform's activity and data.
          </p>
        </div>
      </div>
      
      {/* Analytics Section */}
      <div className="space-y-6">
        <AnalyticsCards />
        <AnalyticsChart />
        <p className="text-sm text-muted-foreground">
          For detailed reports and to export data as CSV, explore your data in the{" "}
          <a href="https://supabase.com/dashboard/project/opwcpqijoxytqzjvopyw/editor" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Supabase Table Editor
          </a>.
        </p>
      </div>

      <DemoTripControls />

      <div className="space-y-6">
        <UsersTable />
        <BusesTable />
        <BookingsTable />
        <PaymentsTable />
      </div>
    </div>
  );
}
