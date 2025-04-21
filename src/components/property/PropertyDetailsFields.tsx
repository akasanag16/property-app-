
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PropertyFormData = {
  name: string;
  address: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  rent: string;
};

type PropertyDetailsFieldsProps = {
  property: PropertyFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
};

export function PropertyDetailsFields({
  property,
  onChange,
  onSelectChange,
}: PropertyDetailsFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Property Name *</Label>
        <Input
          id="name"
          name="name"
          value={property.name}
          onChange={onChange}
          placeholder="e.g. Sunset Apartment"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          name="address"
          value={property.address}
          onChange={onChange}
          placeholder="Full property address"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select
            value={property.type}
            onValueChange={(value) => onSelectChange("type", value)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rent">Monthly Rent ($)</Label>
          <Input
            id="rent"
            name="rent"
            type="number"
            value={property.rent}
            onChange={onChange}
            placeholder="e.g. 1500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select
            value={property.bedrooms}
            onValueChange={(value) => onSelectChange("bedrooms", value)}
          >
            <SelectTrigger id="bedrooms">
              <SelectValue placeholder="Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Studio</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Select
            value={property.bathrooms}
            onValueChange={(value) => onSelectChange("bathrooms", value)}
          >
            <SelectTrigger id="bathrooms">
              <SelectValue placeholder="Bathrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="1.5">1.5</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="2.5">2.5</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="3.5">3.5</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="area">Square Feet</Label>
          <Input
            id="area"
            name="area"
            type="number"
            value={property.area}
            onChange={onChange}
            placeholder="e.g. 1200"
          />
        </div>
      </div>
    </>
  );
}
