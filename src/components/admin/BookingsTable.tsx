
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { useAdminAll } from "@/hooks/admin/useAdminAll";

export default function BookingsTable() {
  const bookingsQuery = useAdminAll("bookings");

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Bus ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingsQuery.data?.map((booking: any) => (
              <TableRow key={booking.id}>
                <TableCell className="max-w-xs truncate">{booking.id}</TableCell>
                <TableCell>{booking.bus_id}</TableCell>
                <TableCell className="max-w-xs truncate">{booking.user_id}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>
                  {booking.created_at ? booking.created_at.substring(0, 19).replace("T", " ") : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
