
import { X, Upload } from "lucide-react";

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
  return (
    <div className="space-y-2">
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
              onClick={() => onRemoveImage(index)}
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
            onChange={onImageChange}
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
  );
}
