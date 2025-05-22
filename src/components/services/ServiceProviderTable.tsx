
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";
import { ServiceProviderTableRow } from "./ServiceProviderTableRow";

interface ServiceProviderTableProps {
  serviceProviders: ServiceProvider[];
  loading: boolean;
  refreshing: boolean;
}

export function ServiceProviderTable({ 
  serviceProviders, 
  loading,
  refreshing 
}: ServiceProviderTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!serviceProviders.length) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <h3 className="font-medium text-gray-600">No service providers found</h3>
        <p className="text-sm text-gray-500 mt-1">
          Service providers will appear here once they are added to your properties.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableCaption>
          {refreshing 
            ? "Refreshing service provider list..." 
            : `A list of ${serviceProviders.length} service providers`
          }
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Properties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceProviders.map((provider) => (
            <ServiceProviderTableRow key={provider.id} provider={provider} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
