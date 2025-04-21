
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export type PropertyFilterValues = {
  searchTerm: string;
  propertyType: string;
  minBedrooms: number;
  maxBedrooms: number;
  minBathrooms: number;
  maxBathrooms: number;
  minRent: number;
  maxRent: number;
};

type PropertyFilterProps = {
  onFilterChange: (filters: PropertyFilterValues) => void;
  minRent?: number;
  maxRent?: number;
};

const defaultFilters: PropertyFilterValues = {
  searchTerm: "",
  propertyType: "all",
  minBedrooms: 0,
  maxBedrooms: 5,
  minBathrooms: 0,
  maxBathrooms: 5,
  minRent: 0,
  maxRent: 5000,
};

export function PropertyFilter({ 
  onFilterChange,
  minRent = 0,
  maxRent = 5000
}: PropertyFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<PropertyFilterValues>({
    ...defaultFilters,
    minRent,
    maxRent
  });

  const handleFilterChange = (
    key: keyof PropertyFilterValues,
    value: string | number
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      ...defaultFilters,
      minRent,
      maxRent
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleRentRangeChange = (values: number[]) => {
    if (values.length === 2) {
      const newFilters = {
        ...filters,
        minRent: values[0],
        maxRent: values[1],
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filter Properties</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {isExpanded ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      <div className="mb-4">
        <Label htmlFor="searchTerm" className="sr-only">
          Search
        </Label>
        <Input
          id="searchTerm"
          placeholder="Search by name or address"
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          className="w-full"
        />
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="propertyType" className="mb-1 block">
              Property Type
            </Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) => handleFilterChange("propertyType", value)}
            >
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label>Bedrooms</Label>
              <span className="text-sm text-gray-500">
                {filters.minBedrooms} - {filters.maxBedrooms === 5 ? "5+" : filters.maxBedrooms}
              </span>
            </div>
            <div className="flex gap-4">
              <Select
                value={filters.minBedrooms.toString()}
                onValueChange={(value) => handleFilterChange("minBedrooms", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.maxBedrooms.toString()}
                onValueChange={(value) => handleFilterChange("maxBedrooms", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label>Bathrooms</Label>
              <span className="text-sm text-gray-500">
                {filters.minBathrooms} - {filters.maxBathrooms === 5 ? "5+" : filters.maxBathrooms}
              </span>
            </div>
            <div className="flex gap-4">
              <Select
                value={filters.minBathrooms.toString()}
                onValueChange={(value) => handleFilterChange("minBathrooms", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.maxBathrooms.toString()}
                onValueChange={(value) => handleFilterChange("maxBathrooms", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label>Monthly Rent</Label>
              <span className="text-sm text-gray-500">
                ${filters.minRent} - ${filters.maxRent}
              </span>
            </div>
            <Slider
              defaultValue={[filters.minRent, filters.maxRent]}
              max={5000}
              step={100}
              onValueChange={handleRentRangeChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>${minRent}</span>
              <span>${maxRent}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleResetFilters} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
