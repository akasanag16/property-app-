
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Home, Bed, Bath, Square, DollarSign, Map, Users, Wrench } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Property } from "@/types/property";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Property Name
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
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Property Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="tenants" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Tenants</span>
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>Services</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6 pt-4">
                  {/* Property Address */}
                  <div className="bg-gray-50 p-4 rounded-lg border flex items-start">
                    <div className="p-3 bg-indigo-100 rounded-md mr-4">
                      <Map className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Property Address</h3>
                      <p className="text-gray-700">{property?.address || "No address provided"}</p>
                    </div>
                  </div>
                  
                  {/* Property details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border flex items-center">
                      <div className="p-3 bg-indigo-100 rounded-md mr-4">
                        <Home className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Property Type</div>
                        <div className="font-medium text-lg">{property?.details?.type || "Not specified"}</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border flex items-center">
                      <div className="p-3 bg-indigo-100 rounded-md mr-4">
                        <DollarSign className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Monthly Rent</div>
                        <div className="font-medium text-lg">
                          {property?.details?.rent ? `$${property.details.rent}/month` : "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border flex items-center">
                      <div className="p-3 bg-indigo-100 rounded-md mr-4">
                        <Bed className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Bedrooms</div>
                        <div className="font-medium text-lg">{property?.details?.bedrooms || "Not specified"}</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border flex items-center">
                      <div className="p-3 bg-indigo-100 rounded-md mr-4">
                        <Bath className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Bathrooms</div>
                        <div className="font-medium text-lg">{property?.details?.bathrooms || "Not specified"}</div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border flex items-center">
                      <div className="p-3 bg-indigo-100 rounded-md mr-4">
                        <Square className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Area</div>
                        <div className="font-medium text-lg">
                          {property?.details?.area ? `${property.details.area} sq ft` : "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tenants">
                  <div className="py-8 text-center">
                    <h3 className="font-medium text-lg mb-2">Tenant Management</h3>
                    <p className="text-gray-500 mb-4">Manage tenants for this property</p>
                    <Button onClick={onInviteClick}>Manage Tenants</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="services">
                  <div className="py-8 text-center">
                    <h3 className="font-medium text-lg mb-2">Service Providers</h3>
                    <p className="text-gray-500 mb-4">Manage service providers for this property</p>
                    <Button onClick={onInviteClick}>Manage Service Providers</Button>
                  </div>
                </TabsContent>
              </Tabs>
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
    </>
  );
}
