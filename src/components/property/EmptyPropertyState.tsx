
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type EmptyPropertyStateProps = {
  onAddProperty: () => void;
};

export function EmptyPropertyState({ onAddProperty }: EmptyPropertyStateProps) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border">
      <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
      <p className="text-gray-500 mb-4">Get started by adding your first property</p>
      <Button onClick={onAddProperty}>
        <Plus className="h-4 w-4 mr-2" />
        Add Property
      </Button>
    </div>
  );
}
