
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
        {!tenants || tenants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tenant data available. 
            <div className="mt-2 text-sm">
              Add tenants to your properties to see their information here.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Email</TableHead>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
