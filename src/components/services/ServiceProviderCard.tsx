
import React, { memo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export const ServiceProviderCard = memo(function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  return (
    <Card key={provider.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{provider.name}</CardTitle>
        <CardDescription>{provider.email || "No email available"}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-1">Assigned Properties:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          {provider.properties.length > 0 ? 
            provider.properties.map((property, index) => (
              <li key={index}>{property}</li>
            ))
            : 
            <li className="text-gray-500">No properties assigned</li>
          }
        </ul>
      </CardContent>
    </Card>
  );
});
