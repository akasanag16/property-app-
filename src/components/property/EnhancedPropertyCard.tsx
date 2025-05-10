
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, DollarSign, Bed, Bath, SquareDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyDetailsModal } from "./PropertyDetailsModal";

type PropertyCardProps = {
  id: string;
  name: string;
  address: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  rent?: number;
  imageUrl?: string | null;
  onClick?: () => void;
  className?: string;
};

export function EnhancedPropertyCard({
  id,
  name,
  address,
  type,
  bedrooms,
  bathrooms,
  area,
  rent,
  imageUrl,
  onClick,
  className
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg", 
        isHovered ? "scale-[1.02]" : "", 
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="h-16 w-16 text-indigo-300" />
          </div>
        )}
        {rent && (
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 m-2 rounded-md font-medium">
            ${rent}/month
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <CardDescription className="text-sm line-clamp-1">{address}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 grid grid-cols-2 gap-3">
        {type && (
          <div className="flex items-center text-gray-600">
            <div className="rounded-full bg-indigo-100 p-1.5 mr-2">
              <Home className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <span className="capitalize text-sm">{type}</span>
          </div>
        )}
        
        {bedrooms !== undefined && (
          <div className="flex items-center text-gray-600">
            <div className="rounded-full bg-indigo-100 p-1.5 mr-2">
              <Bed className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <span className="text-sm">{bedrooms} {bedrooms === 1 ? 'bed' : 'beds'}</span>
          </div>
        )}
        
        {bathrooms !== undefined && (
          <div className="flex items-center text-gray-600">
            <div className="rounded-full bg-indigo-100 p-1.5 mr-2">
              <Bath className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <span className="text-sm">{bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}</span>
          </div>
        )}
        
        {area !== undefined && (
          <div className="flex items-center text-gray-600">
            <div className="rounded-full bg-indigo-100 p-1.5 mr-2">
              <SquareDot className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <span className="text-sm">{area} sq ft</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <PropertyDetailsModal
          propertyId={id}
          onSuccess={() => {
            if (onClick) onClick();
          }}
        />
      </CardFooter>
    </Card>
  );
}
