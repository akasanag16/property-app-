
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
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

      if (!user?.id) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use our new secure function to fetch property details
        const { data, error } = await supabase
          .rpc('safe_get_property_by_id_for_service_provider', {
            property_id_param: propertyId,
            service_provider_id_param: user.id
          });

        if (error) {
          console.error("Error fetching property:", error);
          setError(`Error loading property: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          setError("Property not found or you don't have access to this property");
          return;
        }

        setPropertyName(data[0].name);
      } catch (err: any) {
        console.error("Error in fetchPropertyDetails:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchPropertyDetails();
  }, [propertyId, user?.id, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/service-provider-dashboard')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-indigo-800">
            {loading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              `${propertyName} - Maintenance Requests`
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            {loading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              "View and manage maintenance requests for this property"
            )}
          </p>
        </div>

        {error && (
          <ErrorAlert 
            message={error} 
            onRetry={handleRefresh} 
          />
        )}

        {!error && propertyId && (
          <Card>
            <CardContent className="p-6">
              <MaintenanceRequestsList 
                userRole="service_provider" 
                refreshKey={refreshKey} 
                onRefreshNeeded={handleRefresh}
                onError={handleError}
                propertyId={propertyId}
              />
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
