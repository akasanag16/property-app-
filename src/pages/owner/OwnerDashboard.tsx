
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyForm } from "@/components/property/PropertyForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyPropertyState } from "@/components/property/EmptyPropertyState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useProperties } from "@/hooks/useProperties";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { properties, loading, handleRefresh } = useProperties(user?.id);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  return (
    <DashboardLayout>
      <DashboardHeader 
        email={user?.email}
        onRefresh={handleRefresh}
        onAddProperty={() => setShowAddPropertyForm(true)}
      />
      
      {loading ? (
        <LoadingSpinner />
      ) : properties.length === 0 ? (
        <EmptyPropertyState onAddProperty={() => setShowAddPropertyForm(true)} />
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

      {showAddPropertyForm && (
        <PropertyForm
          isOpen={showAddPropertyForm}
          onClose={() => setShowAddPropertyForm(false)}
          onSuccess={handleRefresh}
        />
      )}
    </DashboardLayout>
  );
}
