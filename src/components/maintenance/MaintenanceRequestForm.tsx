
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Property = {
  id: string;
  name: string;
};

type MaintenanceRequestFormProps = {
  properties: Property[];
  onRequestCreated?: () => void;
  onError?: (errorMessage: string) => void;
};

export function MaintenanceRequestForm({ properties, onRequestCreated, onError }: MaintenanceRequestFormProps) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyId: properties.length > 0 ? properties[0].id : "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.propertyId) {
      const errorMsg = "Please fill in all fields";
      toast.error(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setSubmitting(true);
    try {
      // Use edge function instead of direct insert to avoid recursion issues
      const { data, error } = await supabase.functions.invoke('maintenance-request', {
        body: {
          title: form.title,
          description: form.description,
          property_id: form.propertyId,
          tenant_id: user?.id,
          status: 'pending'
        }
      });

      if (error) {
        console.error("Error creating maintenance request:", error);
        throw new Error(`Failed to submit request: ${error.message || "Unknown error"}`);
      }
      
      if (!data || !data.success) {
        throw new Error("Failed to create maintenance request: No response from server");
      }
      
      toast.success("Maintenance request submitted successfully");
      setForm({
        title: "",
        description: "",
        propertyId: properties.length > 0 ? properties[0].id : "",
      });
      
      if (onRequestCreated) {
        onRequestCreated();
      }
    } catch (error: any) {
      console.error("Error submitting maintenance request:", error);
      const errorMessage = `Failed to submit maintenance request: ${error.message || "Unknown error"}`;
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg border">
        <p className="text-gray-500">You don't have any properties yet.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="propertyId">Property</Label>
        <select
          id="propertyId"
          name="propertyId"
          value={form.propertyId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Brief description of the issue"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Provide details about the maintenance issue"
          rows={4}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Maintenance Request"}
      </Button>
    </form>
  );
}
