
import { useState } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

type PropertyImageUploadProps = {
  images: File[];
  imageUrls: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
};

export function PropertyImageUpload({
  images,
  imageUrls,
  onImageChange,
  onRemoveImage,
}: PropertyImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event to use with onImageChange
      const fileList = e.dataTransfer.files;
      const event = {
        target: {
          files: fileList
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onImageChange(event);
      toast.success(`${fileList.length} image${fileList.length === 1 ? '' : 's'} added`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative h-24 rounded overflow-hidden border group">
            <img
              src={url}
              alt={`Property ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200"></div>
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Remove image"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        
        <div 
          className={`h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="sr-only"
              multiple
            />
            {imageUrls.length === 0 ? (
              <>
                <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Drag images or click to upload</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Add more images</span>
              </>
            )}
          </label>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        You can upload multiple images. The first image will be used as the main property image.
      </p>
      {images.length > 0 && (
        <p className="text-xs text-emerald-600">
          {images.length} image{images.length !== 1 ? 's' : ''} ready to upload
        </p>
      )}
    </div>
  );
}
