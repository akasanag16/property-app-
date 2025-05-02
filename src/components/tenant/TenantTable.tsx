
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TenantTableRow } from "./TenantTableRow";
import { Tenant } from "@/types/tenant";

interface TenantTableProps {
  tenants: Tenant[];
}

export function TenantTable({ tenants }: TenantTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Payment Information</CardTitle>
        <CardDescription>
          Overview of all tenant payments and due dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TenantTableRow key={tenant.id} tenant={tenant} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
