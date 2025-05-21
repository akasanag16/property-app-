
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ServiceType } from "@/data/serviceTypes";

interface ServiceTypeCardProps {
  service: ServiceType;
  onViewProviders: (name: string) => void;
  onAddToProperty: (name: string) => void;
}

export function ServiceTypeCard({ service, onViewProviders, onAddToProperty }: ServiceTypeCardProps) {
  return (
    <Card key={service.id} className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <service.icon className={`h-8 w-8 ${service.color}`} />
          <span className="text-sm text-gray-500">{service.providers} providers</span>
        </div>
        <CardTitle className="mt-2">{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="text-sm text-gray-600">
        <ul className="list-disc list-inside space-y-1">
          <li>Available for all your properties</li>
          <li>Licensed and insured professionals</li>
          <li>Tenant scheduling available</li>
        </ul>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewProviders(service.name)}
        >
          View Providers
        </Button>
        <Button 
          size="sm"
          onClick={() => onAddToProperty(service.name)}
        >
          Add to Property
        </Button>
      </CardFooter>
    </Card>
  );
}
