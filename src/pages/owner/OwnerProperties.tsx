
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EnhancedPropertyCard } from "@/components/property/EnhancedPropertyCard";
import { PropertyFilter, PropertyFilterValues } from "@/components/property/PropertyFilter";
import { PropertyForm } from "@/components/property/PropertyForm";
import { RefreshCw, Plus, Filter } from "lucide-react";
import { sampleProperties } from "@/data/sampleProperties";

type Property = {
  id: string;
  name: string;
  address: string;
  details?: {
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    rent?: number;
  };
  image_url?: string;
};

export default function OwnerProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

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

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("id, name, address, details, property_images!inner(url, is_primary)")
        .eq("owner_id", user?.id)
        .eq("property_images.is_primary", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Property type
      const transformedProperties = data ? data.map(item => ({
        id: item.id,
        name: item.name,
        address: item.address,
        details: item.details,
        image_url: item.property_images?.[0]?.url
      })) : [];

      // If no properties found in the database, use sample properties for demo
      if (transformedProperties.length === 0) {
        const samplePropertiesWithImgUrl = sampleProperties.map(prop => ({
          id: prop.id,
          name: prop.name,
          address: prop.address,
          details: {
            type: prop.type,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area,
            rent: prop.rent
          },
          image_url: prop.photos[0]?.url
        }));
        
        setProperties(samplePropertiesWithImgUrl);
        setFilteredProperties(samplePropertiesWithImgUrl);
      } else {
        setProperties(transformedProperties);
        setFilteredProperties(transformedProperties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
      
      // Use sample properties as fallback
      const samplePropertiesWithImgUrl = sampleProperties.map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        details: {
          type: prop.type,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area,
          rent: prop.rent
        },
        image_url: prop.photos[0]?.url
      }));
      
      setProperties(samplePropertiesWithImgUrl);
      setFilteredProperties(samplePropertiesWithImgUrl);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    fetchProperties();

    // Set up realtime subscription
    const channel = supabase
      .channel('property-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `owner_id=eq.${user.id}`,
        },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshKey]);

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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
            <p className="text-gray-500 mb-4">
              {properties.length === 0 
                ? "Please add properties from the dashboard" 
                : "No properties match your current filters"}
            </p>
            {properties.length === 0 && (
              <Button onClick={() => setShowAddPropertyForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <EnhancedPropertyCard
                key={property.id}
                id={property.id}
                name={property.name}
                address={property.address}
                type={property.details?.type}
                bedrooms={property.details?.bedrooms}
                bathrooms={property.details?.bathrooms}
                area={property.details?.area}
                rent={property.details?.rent}
                imageUrl={property.image_url}
              />
            ))}
          </div>
        )}
      </div>

      {showAddPropertyForm && (
        <PropertyForm
          isOpen={showAddPropertyForm}
          onClose={() => setShowAddPropertyForm(false)}
          onSuccess={() => {
            handleRefresh();
            toast.success("Property added successfully");
          }}
        />
      )}
    </DashboardLayout>
  );
}
