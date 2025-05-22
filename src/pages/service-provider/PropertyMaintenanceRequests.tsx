
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequestsList } from "@/components/maintenance/MaintenanceRequestsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ErrorAlert } from "@/components/ui/alert-error";

export default function PropertyMaintenanceRequests() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [propertyName, setPropertyName] = useState<string>("Property");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchPropertyDetails() {
      if (!propertyId) {
        setError("No property ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch property details
        const { data, error } = await supabase
          .from('properties')
          .select('name')
          .eq('id', propertyId)
          .single();

        if (error) {
          console.error("Error fetching property:", error);
          setError(`Error loading property: ${error.message}`);
          return;
        }

        if (data) {
          setPropertyName(data.name);
        }
      } catch (err: any) {
        console.error("Error in fetchPropertyDetails:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchPropertyDetails();
  }, [propertyId]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/service-provider-dashboard')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Maintenance Requests</h1>
            <p className="text-gray-600">
              {loading ? "Loading..." : `Property: ${propertyName}`}
            </p>
          </div>
        </div>

        {error && (
          <ErrorAlert 
            message={error} 
            onRetry={handleRefresh} 
          />
        )}

        {!error && propertyId && (
          <div className="bg-white p-6 rounded-lg shadow">
            <MaintenanceRequestsList 
              userRole="service_provider" 
              refreshKey={refreshKey} 
              onRefreshNeeded={handleRefresh}
              onError={handleError}
              propertyId={propertyId}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
