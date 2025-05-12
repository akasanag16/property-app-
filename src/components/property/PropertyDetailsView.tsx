
import { Loader2 } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyEditForm } from "./details/PropertyEditForm";
import { PropertyTabsContainer } from "./details/PropertyTabsContainer";
import { PropertyActionButtons } from "./details/PropertyActionButtons";

interface PropertyDetailsViewProps {
  loading: boolean;
  property: Property | null;
  onEditToggle: () => void;
  onSave: () => Promise<void>;
  onInviteClick: () => void;
  editing: boolean;
  name: string;
  setName: (name: string) => void;
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
}: PropertyDetailsViewProps) {
  return (
    <>
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
