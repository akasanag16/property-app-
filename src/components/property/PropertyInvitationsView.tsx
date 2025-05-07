
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft } from "lucide-react";
import { PropertyInvitesTabs } from "./PropertyInvitesTabs";
import { Property } from "@/types/property";

interface PropertyInvitationsViewProps {
  property: Property | null;
  onBack: () => void;
}

export function PropertyInvitationsView({ property, onBack }: PropertyInvitationsViewProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={onBack}
          >
            <ChevronLeft size={18} />
          </Button>
          Manage Invitations for {property?.name || "Property"}
        </DialogTitle>
      </DialogHeader>

      <PropertyInvitesTabs 
        propertyId={property?.id || ""}
        onClose={onBack}
      />
    </>
  );
}
