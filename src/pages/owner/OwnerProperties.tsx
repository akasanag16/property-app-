
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyFilter } from "@/components/property/PropertyFilter";
import { PropertyForm } from "@/components/property/PropertyForm";
import { PropertiesList } from "@/components/property/PropertiesList";
import { PropertiesHeader } from "@/components/property/PropertiesHeader";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { toast } from "sonner";

export default function OwnerProperties() {
  const { user } = useAuth();
  const { properties, loading, handleRefresh } = useProperties(user?.id);
  const { filteredProperties, handleFilterChange } = usePropertyFilters(properties);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  // Notify user when realtime is active
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info("Real-time updates active", {
        description: "Property changes will appear automatically",
        duration: 4000,
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertiesHeader 
          onAddProperty={() => setShowAddPropertyForm(true)}
          onRefresh={handleRefresh}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        {showFilters && (
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <PropertyFilter 
              onFilterChange={handleFilterChange}
              minRent={0}
              maxRent={5000}
            />
          </div>
        )}

        <PropertiesList 
          loading={loading}
          properties={filteredProperties}
          onAddProperty={() => setShowAddPropertyForm(true)}
        />
      </div>

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
