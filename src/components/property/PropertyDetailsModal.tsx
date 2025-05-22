
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { PropertyDetailsView } from "./PropertyDetailsView";
import { PropertyInvitationsView } from "./PropertyInvitationsView";
import { usePropertyDetails } from "@/hooks/properties/usePropertyDetails";

interface PropertyDetailsModalProps {
  propertyId: string;
  onSuccess: () => void;
}

type ActiveView = 'details' | 'invitations';

export function PropertyDetailsModal({ propertyId, onSuccess }: PropertyDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('details');
  
  const {
    property,
    loading,
    editing,
    setEditing,
    name,
    setName,
    handleSave,
    resetState
  } = usePropertyDetails(propertyId, open);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetState();
      setActiveView('details');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveClick = async () => {
    const success = await handleSave();
    if (success) {
      onSuccess();
    }
  };

  const handleInvite = () => {
    setActiveView('invitations');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Edit className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        {activeView === 'details' ? (
          <PropertyDetailsView
            loading={loading}
            property={property}
            onEditToggle={() => editing ? setEditing(false) : handleEdit()}
            onSave={handleSaveClick}
            onInviteClick={handleInvite}
            editing={editing}
            name={name}
            setName={setName}
            dialogTitle={editing ? "Edit Property" : (property?.name || "Property Details")}
          />
        ) : (
          <PropertyInvitationsView 
            property={property}
            onBack={() => setActiveView('details')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
