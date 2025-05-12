
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PropertyActionButtonsProps {
  editing: boolean;
  loading: boolean;
  onEditToggle: () => void;
  onSave: () => Promise<void>;
  onInviteClick: () => void;
}

export function PropertyActionButtons({
  editing,
  loading,
  onEditToggle,
  onSave,
  onInviteClick
}: PropertyActionButtonsProps) {
  return (
    <DialogFooter>
      {editing ? (
        <>
          <Button type="button" variant="secondary" onClick={onEditToggle} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? (
              <>
                Saving <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </>
      ) : (
        <>
          <Button type="button" variant="secondary" onClick={onInviteClick} disabled={loading}>
            Manage Invitations
          </Button>
          <Button 
            type="button" 
            onClick={onEditToggle} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Edit Property
          </Button>
        </>
      )}
    </DialogFooter>
  );
}
