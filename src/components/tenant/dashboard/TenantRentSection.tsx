
import { User } from "@supabase/supabase-js";
import { TenantRentDashboard } from "./TenantRentDashboard";

interface TenantRentSectionProps {
  user: User | null;
}

export function TenantRentSection({ user }: TenantRentSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Rent Payments</h2>
      <TenantRentDashboard user={user} />
    </div>
  );
}
