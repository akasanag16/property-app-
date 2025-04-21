
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PropertyFilter } from "@/components/property/PropertyFilter";
import { PropertyForm } from "@/components/property/PropertyForm";
import { PropertiesList } from "@/components/property/PropertiesList";
import { PropertiesHeader } from "@/components/property/PropertiesHeader";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";

export default function OwnerProperties() {
  const { user } = useAuth();
  const { properties, loading, handleRefresh } = useProperties(user?.id);
  const { filteredProperties, handleFilterChange } = usePropertyFilters(properties);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PropertiesHeader 
          onAddProperty={() => setShowAddPropertyForm(true)}
          onRefresh={handleRefresh}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        <p className="text-gray-600">
          View and manage your properties here.
        </p>

        {showFilters && (
          <PropertyFilter 
            onFilterChange={handleFilterChange}
            minRent={0}
            maxRent={5000}
          />
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
