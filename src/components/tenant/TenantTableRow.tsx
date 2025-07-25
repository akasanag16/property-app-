
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
    <TableRow key={tenant.id} className="hover:bg-muted/30">
      <TableCell className="font-medium">
        {tenant.first_name} {tenant.last_name}
      </TableCell>
      <TableCell>
        {tenant.properties.length > 0 ? (
          <div className="space-y-1">
            {tenant.properties.map(property => (
              <div key={property.id} className="text-xs">
                {property.name}
              </div>
            ))}
          </div>
        ) : (
          <Badge variant="warning" className="text-xs">No properties</Badge>
        )}
      </TableCell>
      <TableCell>
        {tenant.email ? (
          <span className="text-xs break-all">{tenant.email}</span>
        ) : (
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
