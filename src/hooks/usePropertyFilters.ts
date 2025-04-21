
import { useState, useEffect } from "react";
import { Property } from "@/hooks/useProperties";
import { PropertyFilterValues } from "@/components/property/PropertyFilter";

export function usePropertyFilters(properties: Property[]) {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);

  // Update filtered properties when properties array changes
  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

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

  return {
    filteredProperties,
    handleFilterChange
  };
}
