
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyForm } from "@/components/property/PropertyForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyPropertyState } from "@/components/property/EmptyPropertyState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useProperties } from "@/hooks/useProperties";
import { toast } from "sonner";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { properties, loading, handleRefresh } = useProperties(user?.id);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  const handleOpenPropertyForm = () => {
    setShowAddPropertyForm(true);
  };

  const handleClosePropertyForm = () => {
    setShowAddPropertyForm(false);
  };

  const handlePropertyFormSuccess = () => {
    handleRefresh();
    handleClosePropertyForm();
    toast.success("Property added successfully");
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        email={user?.email}
        onRefresh={handleRefresh}
        onAddProperty={handleOpenPropertyForm}
      />
      
      {loading ? (
        <LoadingSpinner />
      ) : properties.length === 0 ? (
        <EmptyPropertyState onAddProperty={handleOpenPropertyForm} />
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
          onClose={handleClosePropertyForm}
          onSuccess={handlePropertyFormSuccess}
        />
      )}
    </DashboardLayout>
  );
}
