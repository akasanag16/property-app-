
import { Map, Home, DollarSign, Bed, Bath, Square } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyDetailCard } from "./PropertyDetailCard";

interface PropertyDetailsTabProps {
  property: Property | null;
}

export function PropertyDetailsTab({ property }: PropertyDetailsTabProps) {
  return (
    <div className="space-y-6 pt-4">
      {/* Property Address */}
      <div className="bg-gray-50 p-4 rounded-lg border flex items-start">
        <div className="p-3 bg-indigo-100 rounded-md mr-4">
          <Map className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-medium mb-1">Property Address</h3>
          <p className="text-gray-700">{property?.address || "No address provided"}</p>
        </div>
      </div>
      
      {/* Property details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PropertyDetailCard
          icon={<Home className="h-5 w-5 text-indigo-600" />}
          title="Property Type"
          value={property?.details?.type}
        />
        
        <PropertyDetailCard
          icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
          title="Monthly Rent"
          value={property?.details?.rent ? `$${property.details.rent}/month` : undefined}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PropertyDetailCard
          icon={<Bed className="h-5 w-5 text-indigo-600" />}
          title="Bedrooms"
          value={property?.details?.bedrooms}
        />
        
        <PropertyDetailCard
          icon={<Bath className="h-5 w-5 text-indigo-600" />}
          title="Bathrooms"
          value={property?.details?.bathrooms}
        />
        
        <PropertyDetailCard
          icon={<Square className="h-5 w-5 text-indigo-600" />}
          title="Area"
          value={property?.details?.area ? `${property.details.area} sq ft` : undefined}
        />
      </div>
    </div>
  );
}
