
import React from 'react';
import { TenantInfo } from './TenantInfo';
import { ServiceProviderInfo } from './ServiceProviderInfo';

type RequestContentProps = {
  userRole: "owner" | "tenant" | "service_provider";
  description: string;
  tenant: {
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
  serviceProvider: {
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
};

export function RequestContent({ userRole, description, tenant, serviceProvider }: RequestContentProps) {
  if (userRole === "owner") {
    return (
      <>
        <TenantInfo tenant={tenant} />
        <p className="text-sm">{description}</p>
        <ServiceProviderInfo serviceProvider={serviceProvider} />
      </>
    );
  }
  
  if (userRole === "tenant") {
    return (
      <>
        <p className="text-sm">{description}</p>
        {serviceProvider && <ServiceProviderInfo serviceProvider={serviceProvider} />}
      </>
    );
  }
  
  // Service provider view
  return (
    <>
      {tenant && <TenantInfo tenant={tenant} />}
      <p className="text-sm">{description}</p>
    </>
  );
}
