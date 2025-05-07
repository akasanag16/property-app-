
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, ChevronLeft } from "lucide-react";
import { Property } from "@/types/property";
import { PropertyInvitesTabs } from "./PropertyInvitesTabs";
import { convertDetailsToPropertyDetails } from "@/hooks/properties/propertyUtils";

interface PropertyDetailsModalProps {
  propertyId: string;
  onSuccess: () => void;
}

type ActiveView = 'details' | 'invitations';

export function PropertyDetailsModal({ propertyId, onSuccess }: PropertyDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('details');

  useEffect(() => {
    if (!propertyId) return;

    const fetchProperty = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (error) {
          console.error("Error fetching property:", error);
          toast.error("Failed to load property details");
        } else if (data) {
          const propertyWithDetails: Property = {
            id: data.id,
            name: data.name,
            address: data.address,
            description: data.description || "",
            details: convertDetailsToPropertyDetails(data.details),
            owner_id: data.owner_id,
            image_url: null
          };
          setProperty(propertyWithDetails);
          setName(propertyWithDetails.name);
          setDescription(propertyWithDetails.description || "");
        }
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProperty();
    }
  }, [open, propertyId]);

  const handleOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setEditing(false);
      setActiveView('details');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ name, description })
        .eq('id', propertyId);

      if (error) {
        console.error("Error updating property:", error);
        toast.error("Failed to update property");
      } else {
        if (property) {
          setProperty({ 
            ...property, 
            name, 
            description 
          });
        }
        toast.success("Property updated successfully");
        setEditing(false);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    setActiveView('invitations');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {loading ? (
              "Loading..."
            ) : editing ? (
              "Edit Property"
            ) : (
              property?.name || "Property Details"
            )}
          </DialogTitle>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <DialogDescription>
              {editing ? "Update property details." : property?.description || "View property details."}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {activeView === 'details' && (
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
                  <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSave} disabled={loading}>
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
                  <Button type="button" variant="secondary" onClick={handleInvite} disabled={loading}>
                    Manage Invitations
                  </Button>
                  <Button type="button" onClick={handleEdit} disabled={loading}>
                    Edit Property
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}

        {activeView === 'invitations' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setActiveView('details')}
                >
                  <ChevronLeft size={18} />
                </Button>
                Manage Invitations for {property?.name || "Property"}
              </DialogTitle>
            </DialogHeader>

            <PropertyInvitesTabs 
              propertyId={property?.id || ""}
              onClose={() => setActiveView('details')}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
