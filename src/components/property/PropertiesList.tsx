
import { EnhancedPropertyCard } from "./EnhancedPropertyCard";
import type { Property } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type PropertiesListProps = {
  loading: boolean;
  properties: Property[];
  onAddProperty: () => void;
};

export function PropertiesList({ loading, properties, onAddProperty }: PropertiesListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
        <p className="text-gray-500 mb-4">
          Please add properties from the dashboard
        </p>
        <Button onClick={onAddProperty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <EnhancedPropertyCard
          key={property.id}
          id={property.id}
          name={property.name}
          address={property.address}
          type={property.details?.type}
          bedrooms={property.details?.bedrooms}
          bathrooms={property.details?.bathrooms}
          area={property.details?.area}
          rent={property.details?.rent}
          imageUrl={property.image_url}
        />
      ))}
    </div>
  );
}
