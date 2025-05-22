
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";
import { Users } from "lucide-react";

interface ServiceProviderTableRowProps {
  provider: ServiceProvider;
}

export function ServiceProviderTableRow({ provider }: ServiceProviderTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {provider.name || "Unknown"}
      </TableCell>
      <TableCell>
        {provider.email || "No email provided"}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-gray-500" />
          <span>
            {provider.properties.length === 0 ? (
              "Not assigned to any properties"
            ) : provider.properties.length === 1 ? (
              provider.properties[0]
            ) : (
              `${provider.properties.length} properties`
            )}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
