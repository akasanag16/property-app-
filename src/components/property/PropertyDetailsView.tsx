
import { Loader2 } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyEditForm } from "./details/PropertyEditForm";
import { PropertyTabsContainer } from "./details/PropertyTabsContainer";
import { PropertyActionButtons } from "./details/PropertyActionButtons";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PropertyDetailsViewProps {
  loading: boolean;
  property: Property | null;
  onEditToggle: () => void;
  onSave: () => Promise<void>;
  onInviteClick: () => void;
  editing: boolean;
  name: string;
  setName: (name: string) => void;
  dialogTitle: string;
}

export function PropertyDetailsView({
  loading,
  property,
  onEditToggle,
  onSave,
  onInviteClick,
  editing,
  name,
  setName,
  dialogTitle,
}: PropertyDetailsViewProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">
          {loading ? "Loading..." : dialogTitle}
        </DialogTitle>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <DialogDescription>
            {editing ? "Update property details." : "View property details."}
          </DialogDescription>
        )}
      </DialogHeader>
      
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="my-4">
          {editing ? (
            <PropertyEditForm name={name} setName={setName} />
          ) : (
            <div className="space-y-6">
              <PropertyTabsContainer 
                property={property}
                onInviteClick={onInviteClick}
              />
            </div>
          )}
        </div>
      )}

      <PropertyActionButtons 
        editing={editing}
        loading={loading}
        onEditToggle={onEditToggle}
        onSave={onSave}
        onInviteClick={onInviteClick}
      />
    </>
  );
}
