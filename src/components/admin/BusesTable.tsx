
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useAdminAll } from "@/hooks/admin/useAdminAll";
import { useToggleSuspension } from "@/hooks/admin/useToggleSuspension";

export default function BusesTable() {
  const busesQuery = useAdminAll("buses");
  const toggleBusSuspension = useToggleSuspension("buses");

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Buses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Owner ID</TableHead>
              <TableHead>Suspended</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {busesQuery.data?.map((bus: any) => (
              <TableRow key={bus.id}>
                <TableCell className="max-w-xs truncate">{bus.id}</TableCell>
                <TableCell>{bus.name}</TableCell>
                <TableCell>{bus.plate_number}</TableCell>
                <TableCell className="max-w-xs truncate">{bus.owner_id}</TableCell>
                <TableCell>
                  <Switch
                    checked={bus.is_suspended}
                    onCheckedChange={(val: boolean) =>
                      toggleBusSuspension.mutate({ id: bus.id, is_suspended: val })
                    }
                  />
                </TableCell>
                <TableCell>
                  {bus.is_suspended ? (
                    <span className="text-xs text-red-500">Suspended</span>
                  ) : (
                    <span className="text-xs text-green-500">Active</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
