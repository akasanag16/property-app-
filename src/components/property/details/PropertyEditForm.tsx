
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertyEditFormProps {
  name: string;
  setName: (name: string) => void;
}

export function PropertyEditForm({ name, setName }: PropertyEditFormProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Property Name
          </Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
    </div>
  );
}
