
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";
import { Property } from "@/types/property";

interface ServicesTabProps {
  property: Property | null;
  onInviteClick: () => void;
}

export function ServicesTab({ property, onInviteClick }: ServicesTabProps) {
  return (
    <div className="py-8 text-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Wrench className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-medium text-lg">Service Provider Management</h3>
        <p className="text-gray-500 max-w-md mb-4">
          Assign service providers to this property. You can invite new service providers or view current service provider information.
        </p>
        <Button onClick={onInviteClick} className="px-6">Manage Service Providers</Button>
      </div>
    </div>
  );
}
