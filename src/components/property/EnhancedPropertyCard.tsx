
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
      className={cn("overflow-hidden transition-all duration-300 hover:shadow-lg", 
        isHovered ? "scale-[1.02]" : "", 
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription className="text-sm line-clamp-1">{address}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {type && (
            <div className="flex items-center text-gray-600">
              <Home className="h-4 w-4 mr-1" />
              <span className="capitalize">{type}</span>
            </div>
          )}
          
          {rent !== undefined && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${rent}/month</span>
            </div>
          )}
          
          {bedrooms !== undefined && (
            <div className="flex items-center text-gray-600">
              <Bed className="h-4 w-4 mr-1" />
              <span>{bedrooms} {bedrooms === 1 ? 'bed' : 'beds'}</span>
            </div>
          )}
          
          {bathrooms !== undefined && (
            <div className="flex items-center text-gray-600">
              <Bath className="h-4 w-4 mr-1" />
              <span>{bathrooms} {bathrooms === 1 ? 'bath' : 'baths'}</span>
            </div>
          )}
          
          {area !== undefined && (
            <div className="flex items-center text-gray-600">
              <SquareDot className="h-4 w-4 mr-1" />
              <span>{area} sq ft</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClick}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
