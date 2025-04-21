
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

type Property = {
  id: string;
  name: string;
  address: string;
  created_at: string;
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [newProperty, setNewProperty] = useState({ name: "", address: "" });
  const [addingProperty, setAddingProperty] = useState(false);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // Add new property
  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.name || !newProperty.address) {
      toast.error("Please fill in all fields");
      return;
    }

    setAddingProperty(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .insert({
          name: newProperty.name,
          address: newProperty.address,
          owner_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Add new property to state
      if (data) {
        toast.success("Property added successfully");
        setNewProperty({ name: "", address: "" });
        setIsAddPropertyOpen(false);
        // Properties will be updated through the real-time subscription
      }
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property");
    } finally {
      setAddingProperty(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchProperties();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
        },
        (payload) => {
          // Refresh the list when data changes
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Owner Dashboard</h1>
        
        <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProperty} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                  placeholder="Enter property name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newProperty.address}
                  onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                  placeholder="Enter property address"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={addingProperty}>
                {addingProperty ? "Adding..." : "Add Property"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <p className="text-gray-600 mb-8">Welcome, {user?.email}</p>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
          <p className="text-gray-500 mb-4">Get started by adding your first property</p>
          <Button onClick={() => setIsAddPropertyOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.name}
              address={property.address}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
