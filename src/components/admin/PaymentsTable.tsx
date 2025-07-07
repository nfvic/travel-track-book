
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { useAdminAll } from "@/hooks/admin/useAdminAll";

export default function PaymentsTable() {
  const ordersQuery = useAdminAll("orders");

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Bus ID</TableHead>
              <TableHead>Route ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersQuery.data?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="max-w-xs truncate">{order.id}</TableCell>
                <TableCell className="max-w-xs truncate">{order.user_id}</TableCell>
                <TableCell className="max-w-xs truncate">{order.bus_id}</TableCell>
                <TableCell className="max-w-xs truncate">{order.route_id}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>{order.currency}</TableCell>
                <TableCell>{order.status || "—"}</TableCell>
                <TableCell>
                  {order.created_at ? order.created_at.substring(0, 19).replace("T", " ") : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
