
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameInputsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onErrorClear: () => void;
}

export function NameInputs({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onErrorClear
}: NameInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => {
            onFirstNameChange(e.target.value);
            onErrorClear();
          }}
          required
          autoComplete="given-name"
          placeholder="Enter your first name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => {
            onLastNameChange(e.target.value);
            onErrorClear();
          }}
          required
          autoComplete="family-name"
          placeholder="Enter your last name"
        />
      </div>
    </div>
  );
}
