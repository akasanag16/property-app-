
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { Property } from "@/types/property";
import { convertDetailsToPropertyDetails } from "@/hooks/properties/propertyUtils";
import { PropertyDetailsView } from "./PropertyDetailsView";
import { PropertyInvitationsView } from "./PropertyInvitationsView";

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
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('details');

  useEffect(() => {
    if (!propertyId || !open) return;

    const fetchProperty = async () => {
      setLoading(true);
      try {
        // Use the safe_get_owner_properties RPC function to avoid infinite recursion
        const { data: propertiesData, error: propertiesError } = await supabase
          .rpc('safe_get_owner_properties', { owner_id_param: user?.id })
          
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          toast.error("Failed to load property details");
          setLoading(false);
          return;
        }
        
        // Find the specific property by ID from the returned data
        const propertyData = propertiesData?.find(p => p.id === propertyId);
        
        if (propertyData) {
          const propertyWithDetails: Property = {
            id: propertyData.id,
            name: propertyData.name,
            address: propertyData.address,
            details: convertDetailsToPropertyDetails(propertyData.details),
            owner_id: propertyData.owner_id,
            image_url: null
          };
          setProperty(propertyWithDetails);
          setName(propertyWithDetails.name);
        } else {
          toast.error("Property not found");
        }
      } catch (err) {
        console.error("Error in fetchProperty:", err);
        toast.error("An error occurred while loading property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [open, propertyId, user?.id]);

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
    if (!propertyId || !property) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ name })
        .eq('id', propertyId);

      if (error) {
        console.error("Error updating property:", error);
        toast.error("Failed to update property");
      } else {
        setProperty({ 
          ...property, 
          name
        });
        toast.success("Property updated successfully");
        setEditing(false);
        onSuccess();
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      toast.error("An error occurred while saving property details");
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
        {activeView === 'details' ? (
          <>
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
                  {editing ? "Update property details." : "View property details."}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <PropertyDetailsView
              loading={loading}
              property={property}
              onEditToggle={() => editing ? setEditing(false) : handleEdit()}
              onSave={handleSave}
              onInviteClick={handleInvite}
              editing={editing}
              name={name}
              setName={setName}
            />
          </>
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
