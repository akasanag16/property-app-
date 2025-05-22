
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TenantTableRow } from "./TenantTableRow";
import { Tenant } from "@/types/tenant";
import { UsersRound, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TenantTableProps {
  tenants: Tenant[];
  showHeader?: boolean;
}

export function TenantTable({ tenants, showHeader = false }: TenantTableProps) {
  return (
    <>
      {!tenants || tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 border rounded-lg">
          <UsersRound className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No tenants found</h3>
          <p className="text-gray-500 max-w-md mb-6">
            You don't have any tenants yet. Add tenants to your properties to manage them here.
          </p>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Tenant
          </Button>
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
    </>
  );
}
