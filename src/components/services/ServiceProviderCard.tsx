
import React, { memo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";
import { Mail, Building } from "lucide-react";

interface ServiceProviderCardProps {
  provider: ServiceProvider;
}

export const ServiceProviderCard = memo(function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  return (
    <Card key={provider.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{provider.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Mail className="h-3.5 w-3.5 text-gray-500" />
          <span>{provider.email || "No email available"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-1">
          <Building className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Assigned Properties:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-1">
              {provider.properties.length > 0 ? 
                provider.properties.map((property, index) => (
                  <li key={index}>{property}</li>
                ))
                : 
                <li className="text-gray-500">No properties assigned</li>
              }
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
