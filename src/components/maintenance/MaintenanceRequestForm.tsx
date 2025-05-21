
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";

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
  const { user, session } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyId: properties.length > 0 ? properties[0].id : "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user makes changes
    if (error) setError(null);
  };

  const validateForm = () => {
    const errors = [];
    if (!form.title.trim()) errors.push("Title is required");
    if (!form.description.trim()) errors.push("Description is required");
    if (!form.propertyId) errors.push("Property selection is required");
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate authentication
    if (!user?.id) {
      const errorMsg = "You must be logged in to submit a maintenance request";
      setError(errorMsg);
      toast.error(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join(", ");
      setError(errorMsg);
      toast.error(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      console.log("Submitting maintenance request:", {
        title: form.title,
        description: form.description,
        property_id: form.propertyId,
        tenant_id: user.id
      });
      
      // Get auth token for the edge function
      const token = session?.access_token;
      
      if (!token) {
        throw new Error("Authentication token not available. Please try logging out and back in.");
      }
      
      // First try the direct database approach
      try {
        const { data: directResult, error: directError } = await supabase
          .rpc('create_maintenance_request', {
            title_param: form.title,
            description_param: form.description,
            property_id_param: form.propertyId,
            tenant_id_param: user.id,
            status_param: 'pending'
          });
          
        if (!directError) {
          console.log("Maintenance request created directly:", directResult);
          toast.success("Maintenance request submitted successfully");
          
          // Reset form
          setForm({
            title: "",
            description: "",
            propertyId: properties.length > 0 ? properties[0].id : "",
          });
          
          if (onRequestCreated) {
            onRequestCreated();
          }
          
          return;
        }
        
        console.warn("Direct insertion failed, falling back to edge function:", directError);
      } catch (directErr) {
        console.warn("Error in direct approach, falling back to edge function:", directErr);
      }
      
      // Fallback to edge function approach
      const response = await supabase.functions.invoke('maintenance-request', {
        body: {
          title: form.title,
          description: form.description,
          property_id: form.propertyId,
          tenant_id: user.id,
          status: 'pending'
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(`Failed to submit request: ${response.error.message || "API error"}`);
      }
      
      const data = response.data;
      
      if (!data || !data.success) {
        const errorDetails = data?.error || "Unknown error";
        throw new Error(`Failed to create maintenance request: ${errorDetails}`);
      }
      
      console.log("Maintenance request created successfully:", data);
      toast.success("Maintenance request submitted successfully");
      
      // Reset form
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
      setError(errorMessage);
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
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
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
      
      <p className="text-xs text-gray-500 text-center">
        Having issues? Try refreshing the page or logging out and back in.
      </p>
    </form>
  );
}
