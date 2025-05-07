
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Property } from "@/types/property";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PropertyDetailsViewProps {
  loading: boolean;
  property: Property | null;
  onEditToggle: () => void;
  onSave: () => Promise<void>;
  onInviteClick: () => void;
  editing: boolean;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
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
  description,
  setDescription
}: PropertyDetailsViewProps) {
  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!editing}
              className="col-span-3"
            />
          </div>
        </div>
      )}

      <DialogFooter>
        {editing ? (
          <>
            <Button type="button" variant="secondary" onClick={onEditToggle} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" onClick={onSave} disabled={loading}>
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
            <Button type="button" onClick={onEditToggle} disabled={loading}>
              Edit Property
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}
