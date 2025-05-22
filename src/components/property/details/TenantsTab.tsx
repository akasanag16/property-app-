
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Property } from "@/types/property";

interface TenantsTabProps {
  property: Property | null;
  onInviteClick: () => void;
}

export function TenantsTab({ property, onInviteClick }: TenantsTabProps) {
  return (
    <div className="py-8 text-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-medium text-lg">Tenant Management</h3>
        <p className="text-gray-500 max-w-md mb-4">
          Manage tenants for this property. You can invite new tenants or view current tenant information.
        </p>
        <Button onClick={onInviteClick} className="px-6">Manage Tenants</Button>
      </div>
    </div>
  );
}
