
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PropertyImageUpload } from "./PropertyImageUpload";
import { PropertyDetailsFields } from "./PropertyDetailsFields";
import { usePropertyForm } from "@/hooks/usePropertyForm";

type PropertyFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PropertyForm({ isOpen, onClose, onSuccess }: PropertyFormProps) {
  const {
    property,
    images,
    imageUrls,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleImageChange,
    removeImage,
    handleSubmit,
  } = usePropertyForm(onSuccess);

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
          <PropertyDetailsFields
            property={property}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
          />
          
          <div className="space-y-2">
            <PropertyImageUpload
              images={images}
              imageUrls={imageUrls}
              onImageChange={handleImageChange}
              onRemoveImage={removeImage}
            />
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
