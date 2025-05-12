
import { Button } from "@/components/ui/button";

interface ServicesTabProps {
  onInviteClick: () => void;
}

export function ServicesTab({ onInviteClick }: ServicesTabProps) {
  return (
    <div className="py-8 text-center">
      <h3 className="font-medium text-lg mb-2">Service Providers</h3>
      <p className="text-gray-500 mb-4">Manage service providers for this property</p>
      <Button onClick={onInviteClick}>Manage Service Providers</Button>
    </div>
  );
}
