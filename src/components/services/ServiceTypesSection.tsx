
import React from "react";
import { ServiceTypeCard } from "@/components/services/ServiceTypeCard";
import { ServiceType } from "@/data/serviceTypes";

interface ServiceTypesSectionProps {
  serviceTypes: ServiceType[];
  onViewProviders: (name: string) => void;
  onAddToProperty: (name: string) => void;
}

export default function ServiceTypesSection({ 
  serviceTypes,
  onViewProviders,
  onAddToProperty
}: ServiceTypesSectionProps) {
  return (
    <>
      <h2 className="text-xl font-semibold mt-8 mb-4">Available Service Types</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceTypes.map((service) => (
          <ServiceTypeCard 
            key={service.id}
            service={service}
            onViewProviders={onViewProviders}
            onAddToProperty={onAddToProperty}
          />
        ))}
      </div>
    </>
  );
}
