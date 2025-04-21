
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Image, X, Upload } from "lucide-react";

type PropertyFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PropertyForm({ isOpen, onClose, onSuccess }: PropertyFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [property, setProperty] = useState({
    name: "",
    address: "",
    type: "apartment",
    bedrooms: "2",
    bathrooms: "1",
    area: "",
    rent: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Create URL previews for the new files
      const newImageUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...newFiles]);
      setImageUrls(prev => [...prev, ...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    
    // Also revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error("You must be logged in to add properties");
      return;
    }
    
    if (!property.name || !property.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Insert the property into the database
      const { data: propertyData, error: propertyError } = await supabase
        .from("properties")
        .insert({
          name: property.name,
          address: property.address,
          owner_id: user.id,
          details: {
            type: property.type,
            bedrooms: parseInt(property.bedrooms),
            bathrooms: parseFloat(property.bathrooms),
            area: property.area ? parseFloat(property.area) : null,
            rent: property.rent ? parseFloat(property.rent) : null,
          }
        })
        .select()
        .single();
      
      if (propertyError) throw propertyError;
      
      // Upload images if we have a property ID and files to upload
      if (propertyData.id && images.length > 0) {
        const uploadPromises = images.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `${propertyData.id}/${Date.now()}-${index}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          // Get the public URL for the uploaded image
          const { data: publicUrlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);
            
          // Insert the image reference into the property_images table
          const { error: imageError } = await supabase
            .from('property_images')
            .insert({
              property_id: propertyData.id,
              url: publicUrlData.publicUrl,
              is_primary: index === 0, // Make first image the primary one
            });
            
          if (imageError) throw imageError;
        });
        
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      }
      
      toast.success("Property added successfully");
      
      // Reset form
      setProperty({
        name: "",
        address: "",
        type: "apartment",
        bedrooms: "2",
        bathrooms: "1",
        area: "",
        rent: "",
      });
      setImages([]);
      setImageUrls([]);
      
      // Close modal and notify parent
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Enter the details of your new property. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              name="name"
              value={property.name}
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Full property address"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select
                value={property.type}
                onValueChange={(value) => handleSelectChange("type", value)}
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
                onChange={handleChange}
                placeholder="e.g. 1500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select
                value={property.bedrooms}
                onValueChange={(value) => handleSelectChange("bedrooms", value)}
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
                onValueChange={(value) => handleSelectChange("bathrooms", value)}
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
                onChange={handleChange}
                placeholder="e.g. 1200"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Property Images</Label>
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative h-24 rounded overflow-hidden border">
                  <img
                    src={url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              
              <label className="h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                  multiple
                />
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add Image</span>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              You can upload multiple images. The first image will be used as the main property image.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
