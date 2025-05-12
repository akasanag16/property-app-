
import { Button } from "@/components/ui/button";

interface TenantsTabProps {
  onInviteClick: () => void;
}

export function TenantsTab({ onInviteClick }: TenantsTabProps) {
  return (
    <div className="py-8 text-center">
      <h3 className="font-medium text-lg mb-2">Tenant Management</h3>
      <p className="text-gray-500 mb-4">Manage tenants for this property</p>
      <Button onClick={onInviteClick}>Manage Tenants</Button>
    </div>
  );
}
