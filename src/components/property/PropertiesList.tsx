
import { EnhancedPropertyCard } from "./EnhancedPropertyCard";
import type { Property } from "@/types/property";
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
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border shadow-sm">
        <div className="p-6 max-w-md mx-auto space-y-6">
          <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <Plus className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">No Properties Found</h2>
          <p className="text-gray-500">
            Start managing your properties by adding your first property
          </p>
          <Button 
            onClick={onAddProperty}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
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
