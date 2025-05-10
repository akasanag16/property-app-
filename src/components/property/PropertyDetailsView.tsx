
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Home, Bed, Bath, Square, DollarSign } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Property } from "@/types/property";

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
        <div>
          {editing ? (
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
                  className="col-span-3"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Property tabs */}
              <div className="flex border-b">
                <div className="px-4 py-2 font-medium text-indigo-600 border-b-2 border-indigo-600">
                  Property Details
                </div>
                <div className="px-4 py-2 text-gray-500 hover:text-gray-700">
                  Tenants
                </div>
                <div className="px-4 py-2 text-gray-500 hover:text-gray-700">
                  Service Providers
                </div>
              </div>
              
              {/* Property details cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-md mr-3">
                    <Home className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Property Type</div>
                    <div className="font-medium">{property?.details?.type || "Not specified"}</div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-md mr-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Monthly Rent</div>
                    <div className="font-medium">
                      {property?.details?.rent ? `$${property.details.rent}/month` : "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-md mr-3">
                    <Bed className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bedrooms</div>
                    <div className="font-medium">{property?.details?.bedrooms || "Not specified"}</div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-md mr-3">
                    <Bath className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bathrooms</div>
                    <div className="font-medium">{property?.details?.bathrooms || "Not specified"}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="border rounded-lg p-4 flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-md mr-3">
                    <Square className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Area</div>
                    <div className="font-medium">
                      {property?.details?.area ? `${property.details.area} sq ft` : "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Address</h3>
                <p className="text-gray-700">{property?.address || "No address provided"}</p>
              </div>
            </div>
          )}
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
