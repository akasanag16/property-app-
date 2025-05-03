
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { TenantStatusBadge } from "./TenantStatusBadge";
import { Tenant } from "@/types/tenant";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TenantTableRowProps {
  tenant: Tenant;
}

export function TenantTableRow({ tenant }: TenantTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {tenant.first_name} {tenant.last_name}
      </TableCell>
      <TableCell>{tenant.property.name}</TableCell>
      <TableCell>
        {tenant.email || (
          <Badge variant="warning" className="text-xs">No email</Badge>
        )}
      </TableCell>
      <TableCell>
        {tenant.last_payment?.date ? formatDate(tenant.last_payment.date) : "N/A"}
      </TableCell>
      <TableCell>
        {tenant.next_payment?.date ? formatDate(tenant.next_payment.date) : "N/A"}
      </TableCell>
      <TableCell>${tenant.next_payment?.amount?.toFixed(2) || "N/A"}</TableCell>
      <TableCell>
        {tenant.last_payment?.status ? (
          <TenantStatusBadge status={tenant.last_payment.status} />
        ) : (
          <Badge variant="info">New Tenant</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
