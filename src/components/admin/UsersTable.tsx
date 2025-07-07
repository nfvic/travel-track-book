
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useAdminAll } from "@/hooks/admin/useAdminAll";
import { useToggleSuspension } from "@/hooks/admin/useToggleSuspension";

export default function UsersTable() {
  const usersQuery = useAdminAll("profiles");
  const toggleUserSuspension = useToggleSuspension("profiles");

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Suspended</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.data?.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell className="max-w-xs truncate">{user.id}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.is_suspended}
                    onCheckedChange={(val: boolean) =>
                      toggleUserSuspension.mutate({ id: user.id, is_suspended: val })
                    }
                  />
                </TableCell>
                <TableCell>
                  {user.is_suspended ? (
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
