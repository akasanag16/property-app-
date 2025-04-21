
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { PropertyFilter, PropertyFilterValues } from "@/components/property/PropertyFilter";
import { PropertyForm } from "@/components/property/PropertyForm";
import { PropertiesList } from "@/components/property/PropertiesList";
import { useProperties } from "@/hooks/useProperties";
import { RefreshCw, Plus, Filter } from "lucide-react";

export default function OwnerProperties() {
  const { user } = useAuth();
  const { properties, filteredProperties, setFilteredProperties, loading, handleRefresh } = useProperties(user?.id);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  const handleFilterChange = (filters: PropertyFilterValues) => {
    if (!properties.length) return;

    let result = [...properties];

    // Apply search term filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(
        property => 
          property.name.toLowerCase().includes(searchTerm) || 
          property.address.toLowerCase().includes(searchTerm)
      );
    }

    // Apply property type filter
    if (filters.propertyType !== 'all') {
      result = result.filter(
        property => property.details?.type === filters.propertyType
      );
    }

    // Apply bedroom filters
    result = result.filter(
      property => {
        const bedrooms = property.details?.bedrooms || 0;
        return bedrooms >= filters.minBedrooms && 
               (filters.maxBedrooms === 5 ? bedrooms >= 5 || bedrooms <= 5 : bedrooms <= filters.maxBedrooms);
      }
    );

    // Apply bathroom filters
    result = result.filter(
      property => {
        const bathrooms = property.details?.bathrooms || 0;
        return bathrooms >= filters.minBathrooms && 
               (filters.maxBathrooms === 5 ? bathrooms >= 5 || bathrooms <= 5 : bathrooms <= filters.maxBathrooms);
      }
    );

    // Apply rent filters
    result = result.filter(
      property => {
        const rent = property.details?.rent || 0;
        return rent >= filters.minRent && rent <= filters.maxRent;
      }
    );

    setFilteredProperties(result);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Properties</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              size="sm"
              onClick={() => setShowAddPropertyForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

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
          onSuccess={() => {
            handleRefresh();
          }}
        />
      )}
    </DashboardLayout>
  );
}
