
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  id: string;
  name: string;
  address: string;
  className?: string;
  type?: string;
};

export function PropertyCard({
  id,
  name,
  address,
  className,
  type = 'property'
}: PropertyCardProps) {
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 grid place-items-center text-white">
        <Building className="h-10 w-10" />
      </div>
      
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{name || 'Unnamed Property'}</CardTitle>
          <Badge variant="outline" className="ml-2 text-xs">
            {type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="flex items-start text-gray-500">
          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <p className="text-sm line-clamp-2">{address}</p>
        </div>
      </CardContent>
    </Card>
  );
}
