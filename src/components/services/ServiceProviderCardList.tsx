
import React from "react";
import { ServiceProvider } from "@/hooks/services/useOwnerServiceProviders";
import { ServiceProviderCard } from "./ServiceProviderCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorAlert } from "@/components/ui/alert-error";
import { Building } from "lucide-react";

interface ServiceProviderCardListProps {
  serviceProviders: ServiceProvider[];
  loading: boolean;
  error: string | null;
}

export function ServiceProviderCardList({
  serviceProviders,
  loading,
  error
}: ServiceProviderCardListProps) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (serviceProviders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-lg">No Service Providers</h3>
          <p className="text-gray-500 max-w-md">
            You don't have any service providers assigned to your properties yet. 
            Invite service providers through your properties' management section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {serviceProviders.map((provider) => (
        <ServiceProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
